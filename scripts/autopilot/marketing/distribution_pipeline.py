#!/usr/bin/env python3
"""
Levqor V10 Multi-Channel Distribution Pipeline
Distributes approved content across channels (draft mode).
"""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict

logging.basicConfig(level=logging.INFO, format='%(asctime)s [DIST] %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

OUTPUT_DIR = Path('/home/runner/workspace/workspace-data/autopilot/marketing')
READY_DIR = OUTPUT_DIR / 'ready'
DIST_DIR = OUTPUT_DIR / 'distributions'

DIST_DIR.mkdir(parents=True, exist_ok=True)


@dataclass
class DistributionJob:
    """Represents a content distribution job."""
    job_id: str
    content_id: str
    channel: str
    status: str
    scheduled_at: Optional[str]
    executed_at: Optional[str]
    requires_approval: bool
    approved: bool


CHANNEL_CONFIG = {
    'email': {
        'name': 'Email Newsletter',
        'requires_approval': True,
        'auto_execute': False,
        'rate_limit': 1,
        'rate_period': 'day',
    },
    'blog': {
        'name': 'Blog Post',
        'requires_approval': True,
        'auto_execute': False,
        'rate_limit': 3,
        'rate_period': 'week',
    },
    'social': {
        'name': 'Social Media',
        'requires_approval': True,
        'auto_execute': False,
        'rate_limit': 5,
        'rate_period': 'day',
    },
    'linkedin': {
        'name': 'LinkedIn',
        'requires_approval': True,
        'auto_execute': False,
        'rate_limit': 2,
        'rate_period': 'day',
    },
    'twitter': {
        'name': 'Twitter/X',
        'requires_approval': True,
        'auto_execute': False,
        'rate_limit': 10,
        'rate_period': 'day',
    },
}


class DistributionPipeline:
    """Multi-channel content distribution pipeline."""
    
    def __init__(self):
        self.jobs_file = DIST_DIR / 'distribution_jobs.json'
        self.history_file = DIST_DIR / 'distribution_history.json'
        self.load_state()
    
    def load_state(self):
        """Load pipeline state."""
        if self.jobs_file.exists():
            with open(self.jobs_file) as f:
                data = json.load(f)
                self.jobs = [DistributionJob(**j) for j in data.get('jobs', [])]
        else:
            self.jobs = []
        
        if self.history_file.exists():
            with open(self.history_file) as f:
                self.history = json.load(f)
        else:
            self.history = {'distributions': []}
    
    def save_state(self):
        """Save pipeline state."""
        with open(self.jobs_file, 'w') as f:
            json.dump({
                'jobs': [asdict(j) for j in self.jobs],
                'last_updated': datetime.now(timezone.utc).isoformat(),
            }, f, indent=2)
        with open(self.history_file, 'w') as f:
            json.dump(self.history, f, indent=2)
    
    def create_distribution_job(self, content_id: str, channel: str) -> DistributionJob:
        """Create a distribution job for content."""
        if channel not in CHANNEL_CONFIG:
            raise ValueError(f"Unknown channel: {channel}")
        
        config = CHANNEL_CONFIG[channel]
        now = datetime.now(timezone.utc)
        
        job = DistributionJob(
            job_id=f"{content_id}_{channel}_{int(now.timestamp())}",
            content_id=content_id,
            channel=channel,
            status='pending',
            scheduled_at=now.isoformat(),
            executed_at=None,
            requires_approval=config['requires_approval'],
            approved=False,
        )
        
        self.jobs.append(job)
        self.save_state()
        logger.info(f"Created distribution job: {job.job_id}")
        
        return job
    
    def queue_content_distribution(self, content: Dict) -> List[DistributionJob]:
        """Queue content for distribution across all its channels."""
        content_id = content.get('id')
        channels = content.get('channels', [])
        
        jobs = []
        for channel in channels:
            if channel in CHANNEL_CONFIG:
                job = self.create_distribution_job(content_id, channel)
                jobs.append(job)
        
        return jobs
    
    def approve_job(self, job_id: str) -> Optional[DistributionJob]:
        """Approve a distribution job."""
        for job in self.jobs:
            if job.job_id == job_id:
                job.approved = True
                job.status = 'approved'
                self.save_state()
                logger.info(f"Approved job: {job_id}")
                return job
        return None
    
    def execute_job(self, job: DistributionJob, dry_run: bool = True) -> Dict:
        """Execute a distribution job (or simulate in dry_run mode)."""
        if not job.approved and job.requires_approval:
            return {
                'success': False,
                'error': 'Job requires approval before execution',
            }
        
        now = datetime.now(timezone.utc)
        
        if dry_run:
            result = {
                'success': True,
                'dry_run': True,
                'job_id': job.job_id,
                'channel': job.channel,
                'message': f"Would distribute to {CHANNEL_CONFIG[job.channel]['name']}",
                'executed_at': now.isoformat(),
            }
            job.status = 'simulated'
            logger.info(f"[DRY RUN] Simulated distribution: {job.job_id} -> {job.channel}")
        else:
            result = {
                'success': True,
                'dry_run': False,
                'job_id': job.job_id,
                'channel': job.channel,
                'message': f"Distribution to {CHANNEL_CONFIG[job.channel]['name']} requires manual action",
                'executed_at': now.isoformat(),
            }
            job.status = 'requires_manual_action'
            job.executed_at = now.isoformat()
        
        self.history['distributions'].append(result)
        self.save_state()
        
        return result
    
    def get_pending_jobs(self) -> List[DistributionJob]:
        """Get jobs pending approval or execution."""
        return [j for j in self.jobs if j.status in ['pending', 'approved']]
    
    def get_approval_queue(self) -> List[DistributionJob]:
        """Get jobs requiring approval."""
        return [j for j in self.jobs if j.requires_approval and not j.approved]
    
    def run_pipeline(self, dry_run: bool = True) -> Dict[str, Any]:
        """Run the distribution pipeline."""
        logger.info("=" * 60)
        logger.info("MULTI-CHANNEL DISTRIBUTION PIPELINE - V10")
        logger.info("=" * 60)
        
        ready_content = []
        for ready_file in READY_DIR.glob('*.json'):
            with open(ready_file) as f:
                ready_content.append(json.load(f))
        
        jobs_created = []
        for content in ready_content:
            existing = [j for j in self.jobs if j.content_id == content.get('id')]
            if not existing:
                new_jobs = self.queue_content_distribution(content)
                jobs_created.extend(new_jobs)
        
        pending = self.get_pending_jobs()
        approval_queue = self.get_approval_queue()
        
        executed = []
        for job in pending:
            if job.approved or not job.requires_approval:
                result = self.execute_job(job, dry_run=dry_run)
                executed.append(result)
        
        result = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'status': 'PASS',
            'dry_run': dry_run,
            'ready_content_count': len(ready_content),
            'jobs_created': len(jobs_created),
            'pending_jobs': len(pending),
            'approval_queue': len(approval_queue),
            'executed': len(executed),
            'auto_posting': False,
            'channels_configured': list(CHANNEL_CONFIG.keys()),
        }
        
        summary_file = OUTPUT_DIR / 'distribution_pipeline_summary.json'
        with open(summary_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        logger.info(f"Ready content: {len(ready_content)}")
        logger.info(f"Jobs created: {len(jobs_created)}")
        logger.info(f"Pending: {len(pending)}")
        logger.info(f"Awaiting approval: {len(approval_queue)}")
        logger.info(f"Executed (dry-run): {len(executed)}")
        logger.info(f"Auto-posting: DISABLED")
        
        return result


def main():
    """Main entry point."""
    pipeline = DistributionPipeline()
    result = pipeline.run_pipeline(dry_run=True)
    
    print("\n" + "=" * 50)
    print("DISTRIBUTION PIPELINE SUMMARY")
    print("=" * 50)
    print(f"Status: {result['status']}")
    print(f"Dry-run mode: {result['dry_run']}")
    print(f"Ready content: {result['ready_content_count']}")
    print(f"Jobs created: {result['jobs_created']}")
    print(f"Awaiting approval: {result['approval_queue']}")
    print(f"Auto-posting: {'ON' if result['auto_posting'] else 'OFF (safe mode)'}")
    
    return result


if __name__ == '__main__':
    main()
