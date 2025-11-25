#!/usr/bin/env python3
"""
Levqor Master Safety Command
============================
Runs all checks required before deployment:
1. Frontend lint/type checks
2. Backend syntax validation
3. Safety gate (production endpoints)

Exit codes:
- 0: All checks passed
- 1: One or more checks failed

Usage:
    python scripts/ci/run_all_checks.py
"""
import subprocess
import sys
import os
from datetime import datetime

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class CheckResult:
    def __init__(self, name: str, passed: bool, output: str = "", duration: float = 0):
        self.name = name
        self.passed = passed
        self.output = output
        self.duration = duration

def run_command(cmd: list, cwd: str = None, timeout: int = 300) -> tuple:
    """Run a command and return (success, output)"""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd or REPO_ROOT,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        output = result.stdout + result.stderr
        return result.returncode == 0, output
    except subprocess.TimeoutExpired:
        return False, f"Command timed out after {timeout}s"
    except Exception as e:
        return False, f"Error running command: {e}"

def check_frontend_lint() -> CheckResult:
    """Run Next.js lint in levqor-site (non-blocking, warning only)"""
    print("  Running frontend lint (warning only)...")
    start = datetime.now()
    
    frontend_dir = os.path.join(REPO_ROOT, "levqor-site")
    if not os.path.exists(frontend_dir):
        return CheckResult("Frontend Lint", True, "levqor-site directory not found - skipped")
    
    success, output = run_command(["npm", "run", "lint"], cwd=frontend_dir)
    duration = (datetime.now() - start).total_seconds()
    
    if not success:
        return CheckResult("Frontend Lint (WARNING)", True, f"Lint issues found (non-blocking): {output[:200]}", duration)
    
    return CheckResult("Frontend Lint", True, output, duration)

def check_frontend_build() -> CheckResult:
    """Run Next.js build in levqor-site (type checking)"""
    print("  Running frontend build (type check)...")
    start = datetime.now()
    
    frontend_dir = os.path.join(REPO_ROOT, "levqor-site")
    if not os.path.exists(frontend_dir):
        return CheckResult("Frontend Build", False, "levqor-site directory not found")
    
    success, output = run_command(["npm", "run", "build"], cwd=frontend_dir, timeout=600)
    duration = (datetime.now() - start).total_seconds()
    
    return CheckResult("Frontend Build", success, output, duration)

def check_backend_syntax() -> CheckResult:
    """Check Python syntax for ALL backend files"""
    print("  Checking backend Python syntax...")
    start = datetime.now()
    
    backend_dirs = ["api", "modules", "tenant", "security_core", "enterprise", "scripts", "monitors", "services"]
    backend_files = ["run.py"]
    
    for bdir in backend_dirs:
        dir_path = os.path.join(REPO_ROOT, bdir)
        if os.path.exists(dir_path):
            for root, dirs, files in os.walk(dir_path):
                for f in files:
                    if f.endswith(".py"):
                        rel_path = os.path.relpath(os.path.join(root, f), REPO_ROOT)
                        backend_files.append(rel_path)
    
    errors = []
    checked = 0
    
    for pyfile in backend_files:
        filepath = os.path.join(REPO_ROOT, pyfile)
        if not os.path.exists(filepath):
            continue
        
        success, output = run_command(["python", "-m", "py_compile", pyfile])
        checked += 1
        
        if not success:
            errors.append(f"{pyfile}: {output.strip()[:100]}")
    
    duration = (datetime.now() - start).total_seconds()
    
    if errors:
        error_msg = f"Syntax errors in {len(errors)} file(s):\n" + "\n".join(errors[:5])
        if len(errors) > 5:
            error_msg += f"\n... and {len(errors) - 5} more"
        return CheckResult("Backend Syntax", False, error_msg, duration)
    
    return CheckResult("Backend Syntax", True, f"All {checked} Python files OK", duration)

def check_safety_gate() -> CheckResult:
    """Run the production safety gate checks"""
    print("  Running safety gate...")
    start = datetime.now()
    
    safety_script = os.path.join(REPO_ROOT, "scripts", "monitoring", "safety_gate_full.py")
    if not os.path.exists(safety_script):
        return CheckResult("Safety Gate", False, "safety_gate_full.py not found")
    
    success, output = run_command(["python", safety_script], timeout=120)
    duration = (datetime.now() - start).total_seconds()
    
    return CheckResult("Safety Gate", success, output, duration)

def main():
    print("=" * 60)
    print("LEVQOR MASTER SAFETY COMMAND")
    print("=" * 60)
    print(f"Started at: {datetime.now().isoformat()}")
    print(f"Repository: {REPO_ROOT}")
    print()
    
    results = []
    
    print("[1/4] Frontend Lint")
    results.append(check_frontend_lint())
    
    print("[2/4] Frontend Build")
    results.append(check_frontend_build())
    
    print("[3/4] Backend Syntax")
    results.append(check_backend_syntax())
    
    print("[4/4] Safety Gate")
    results.append(check_safety_gate())
    
    print()
    print("=" * 60)
    print("RESULTS SUMMARY")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for r in results:
        status = "PASS" if r.passed else "FAIL"
        duration_str = f"({r.duration:.1f}s)" if r.duration > 0 else ""
        print(f"[{status}] {r.name} {duration_str}")
        
        if not r.passed:
            failed += 1
            if r.output:
                lines = r.output.strip().split('\n')
                for line in lines[:20]:
                    print(f"       {line}")
                if len(lines) > 20:
                    print(f"       ... ({len(lines) - 20} more lines)")
        else:
            passed += 1
    
    print()
    print(f"Total: {passed} passed, {failed} failed")
    print()
    
    if failed > 0:
        print("OVERALL: FAILED - Do NOT deploy")
        sys.exit(1)
    else:
        print("OVERALL: PASSED - Safe to deploy")
        sys.exit(0)

if __name__ == "__main__":
    main()
