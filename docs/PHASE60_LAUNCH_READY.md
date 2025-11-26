# Phase 60: Launch Stage Management

## Overview

Levqor X 9.0 includes a comprehensive launch stage management system that enables smooth transition from pre-launch (approval-required) to post-launch (automated) operations.

## Launch Stages

### PRE-LAUNCH (Default)
- **Environment**: `LEVQOR_LAUNCH_STAGE=pre` or unset
- **Behavior**: All Growth Organism actions run in dry-run mode only
- **Approval**: All executions require explicit founder approval
- **Safety**: Maximum protection during testing and validation

### POST-LAUNCH
- **Environment**: `LEVQOR_LAUNCH_STAGE=post`
- **Behavior**: Low/medium risk actions execute autonomously
- **Approval**: Only high-risk actions require approval
- **Automation**: Full Growth Organism autonomous operation enabled

## How to Switch Stages

### Option 1: Replit Secrets (Recommended)
1. Go to Replit Secrets tab
2. Add secret: `LEVQOR_LAUNCH_STAGE`
3. Set value: `post`
4. Restart workflows

### Option 2: Environment Variable
```bash
export LEVQOR_LAUNCH_STAGE=post
```

## Pre-Launch Checklist

Before switching to post-launch mode, verify:

1. **Secrets Health**: All critical secrets configured
   ```bash
   python scripts/autopilot/secrets_health.py
   ```

2. **Compliance Audit**: 100% compliance score
   ```bash
   python scripts/autopilot/compliance_audit.py
   ```

3. **Growth Organism**: All 5 modules healthy
   ```bash
   python scripts/autopilot/growth_organism_check.py
   ```

4. **Full Stack Verification**: All endpoints responding
   ```bash
   python scripts/postlaunch/verify_full_stack.py
   ```

## Stage Configuration Details

### PRE-LAUNCH Permissions
| Permission | Status |
|------------|--------|
| Growth Organism Execute | Disabled |
| Content Posting | Disabled |
| Git Commits | Disabled |
| Template Deployment | Disabled |
| High-Risk Auto-Approve | Disabled |

### POST-LAUNCH Permissions
| Permission | Status |
|------------|--------|
| Growth Organism Execute | Enabled |
| Content Posting | Enabled |
| Git Commits | Enabled |
| Template Deployment | Enabled |
| High-Risk Auto-Approve | Disabled (always requires approval) |

## Affected Components

### Growth Organism Engines
- **MutationEngine**: Respects launch stage for mutation execution
- **DistributionEngine**: Respects launch stage for content distribution
- **DemandSignatureEngine**: Respects launch stage for demand scanning
- **GravityEngine**: Respects launch stage for user engagement actions
- **EvolutionEngine**: Respects launch stage for strategy evolution

### Guardian Autopilot Scripts
- **secrets_health.py**: Reports current launch stage
- **compliance_audit.py**: Validates launch readiness
- **growth_organism_check.py**: Shows stage-aware behavior
- **founder_digest.py**: Displays current stage in digest

## Verification Commands

### Check Current Stage
```python
from config.launch_stage import get_launch_stage, get_stage_config
print(get_launch_stage())  # 'pre' or 'post'
print(get_stage_config())  # Full configuration
```

### Run All Autopilot Checks
```bash
python scripts/autopilot/secrets_health.py
python scripts/autopilot/compliance_audit.py
python scripts/autopilot/growth_organism_check.py
python scripts/postlaunch/verify_full_stack.py
```

## Launch Day Procedure

1. Run full verification suite
2. Review Founder Digest for any warnings
3. Confirm all compliance checks pass
4. Set `LEVQOR_LAUNCH_STAGE=post` in Replit Secrets
5. Restart all workflows
6. Monitor Growth Organism Dashboard for autonomous actions

## Rollback Procedure

To return to pre-launch mode:
1. Remove or set `LEVQOR_LAUNCH_STAGE=pre` in Replit Secrets
2. Restart all workflows
3. All actions will return to dry-run mode

## Support

For launch support, contact the Levqor team or review the Guardian Autopilot Dashboard.
