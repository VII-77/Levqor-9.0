#!/usr/bin/env python3
"""
Levqor V10 Spike Detector
Real-time cost spike detection and alerting.
"""

import json
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict

logging.basicConfig(level=logging.INFO, format='%(asctime)s [SPIKE] %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

OUTPUT_DIR = Path('/home/runner/workspace/workspace-data/autopilot/cost')


@dataclass
class SpikeAlert:
    """Represents a cost spike alert."""
    alert_id: str
    spike_type: str
    severity: str
    metric_name: str
    current_value: float
    threshold_value: float
    percent_over: float
    detected_at: str
    auto_action: Optional[str] = None
    requires_approval: bool = False
    resolved: bool = False
    resolved_at: Optional[str] = None


class SpikeDetector:
    """Real-time cost spike detection."""
    
    SPIKE_RULES = [
        {
            'name': 'openai_hourly_tokens',
            'metric_path': ['openai', 'tokens_hour'],
            'threshold': 10000,
            'severity': 'high',
            'auto_action': 'throttle_ai',
        },
        {
            'name': 'openai_daily_tokens',
            'metric_path': ['openai', 'tokens_today'],
            'threshold': 100000,
            'severity': 'critical',
            'auto_action': 'pause_ai',
            'requires_approval': True,
        },
        {
            'name': 'api_hourly_requests',
            'metric_path': ['api', 'requests_hour'],
            'threshold': 5000,
            'severity': 'medium',
            'auto_action': 'rate_limit',
        },
        {
            'name': 'cpu_usage',
            'metric_path': ['compute', 'cpu_percent'],
            'threshold': 85,
            'severity': 'high',
            'auto_action': 'reduce_background',
        },
        {
            'name': 'memory_usage',
            'metric_path': ['compute', 'memory_percent'],
            'threshold': 90,
            'severity': 'critical',
            'auto_action': 'emergency_gc',
        },
        {
            'name': 'daily_cost',
            'metric_path': ['estimated_cost_today'],
            'threshold': 50.0,
            'severity': 'critical',
            'auto_action': 'low_cost_mode',
            'requires_approval': True,
        },
    ]
    
    def __init__(self):
        self.alerts_file = OUTPUT_DIR / 'spike_alerts.json'
        self.history_file = OUTPUT_DIR / 'spike_history.json'
        self.active_alerts: List[SpikeAlert] = []
        self.load_state()
    
    def load_state(self):
        """Load existing alerts."""
        if self.alerts_file.exists():
            try:
                with open(self.alerts_file) as f:
                    data = json.load(f)
                    self.active_alerts = [
                        SpikeAlert(**a) for a in data.get('active', [])
                    ]
            except:
                self.active_alerts = []
    
    def save_state(self):
        """Save current alerts."""
        data = {
            'active': [asdict(a) for a in self.active_alerts],
            'last_updated': datetime.now(timezone.utc).isoformat(),
        }
        with open(self.alerts_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def _get_metric_value(self, metrics: Dict, path: List[str]) -> Optional[float]:
        """Get a metric value by path."""
        value = metrics
        for key in path:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return None
        return float(value) if value is not None else None
    
    def detect(self, metrics: Dict) -> List[SpikeAlert]:
        """Detect spikes in current metrics."""
        now = datetime.now(timezone.utc)
        new_alerts = []
        
        for rule in self.SPIKE_RULES:
            current_value = self._get_metric_value(metrics, rule['metric_path'])
            if current_value is None:
                continue
            
            threshold = rule['threshold']
            if current_value > threshold:
                percent_over = ((current_value - threshold) / threshold) * 100
                
                existing = next(
                    (a for a in self.active_alerts 
                     if a.metric_name == rule['name'] and not a.resolved),
                    None
                )
                
                if not existing:
                    alert = SpikeAlert(
                        alert_id=f"{rule['name']}_{int(now.timestamp())}",
                        spike_type='threshold_exceeded',
                        severity=rule['severity'],
                        metric_name=rule['name'],
                        current_value=current_value,
                        threshold_value=threshold,
                        percent_over=round(percent_over, 1),
                        detected_at=now.isoformat(),
                        auto_action=rule.get('auto_action'),
                        requires_approval=rule.get('requires_approval', False),
                    )
                    self.active_alerts.append(alert)
                    new_alerts.append(alert)
                    logger.warning(f"SPIKE: {rule['name']} = {current_value} (threshold: {threshold}, +{percent_over:.1f}%)")
        
        for alert in self.active_alerts:
            if not alert.resolved:
                current = self._get_metric_value(metrics, 
                    next((r['metric_path'] for r in self.SPIKE_RULES if r['name'] == alert.metric_name), []))
                if current is not None:
                    threshold = next(
                        (r['threshold'] for r in self.SPIKE_RULES if r['name'] == alert.metric_name),
                        float('inf')
                    )
                    if current <= threshold * 0.9:
                        alert.resolved = True
                        alert.resolved_at = now.isoformat()
                        logger.info(f"RESOLVED: {alert.metric_name} back to normal ({current})")
        
        self.save_state()
        return new_alerts
    
    def get_active_alerts(self) -> List[SpikeAlert]:
        """Get all active (unresolved) alerts."""
        return [a for a in self.active_alerts if not a.resolved]
    
    def get_critical_alerts(self) -> List[SpikeAlert]:
        """Get critical alerts requiring immediate attention."""
        return [a for a in self.active_alerts 
                if not a.resolved and a.severity == 'critical']
    
    def get_approval_required(self) -> List[SpikeAlert]:
        """Get alerts requiring founder approval."""
        return [a for a in self.active_alerts 
                if not a.resolved and a.requires_approval]
    
    def run_detection(self) -> Dict[str, Any]:
        """Run full spike detection cycle."""
        metrics_file = OUTPUT_DIR / 'metrics.json'
        if metrics_file.exists():
            with open(metrics_file) as f:
                data = json.load(f)
                samples = data.get('samples', [])
                if samples:
                    metrics = samples[-1]
                else:
                    metrics = {}
        else:
            metrics = {}
        
        new_alerts = self.detect(metrics)
        active = self.get_active_alerts()
        critical = self.get_critical_alerts()
        approval_needed = self.get_approval_required()
        
        result = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'status': 'CRITICAL' if critical else ('WARN' if active else 'OK'),
            'new_alerts': len(new_alerts),
            'active_alerts': len(active),
            'critical_alerts': len(critical),
            'approval_required': len(approval_needed),
            'alerts': [asdict(a) for a in active],
        }
        
        return result


def main():
    """Main entry point."""
    detector = SpikeDetector()
    result = detector.run_detection()
    
    print("\n" + "=" * 50)
    print("SPIKE DETECTOR STATUS")
    print("=" * 50)
    print(f"Status: {result['status']}")
    print(f"New alerts: {result['new_alerts']}")
    print(f"Active alerts: {result['active_alerts']}")
    print(f"Critical: {result['critical_alerts']}")
    print(f"Needs approval: {result['approval_required']}")
    
    return result


if __name__ == '__main__':
    main()
