#!/usr/bin/env python3
"""
Levqor V10 Cost Autopilot Grid
Monitor, predict, throttle, pause, and enforce approval for cost spikes.
"""

import json
import os
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional

logging.basicConfig(level=logging.INFO, format='%(asctime)s [COST] %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

OUTPUT_DIR = Path('/home/runner/workspace/workspace-data/autopilot/cost')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

COST_THRESHOLDS = {
    'openai_tokens_daily': 100000,
    'openai_tokens_hourly': 10000,
    'api_requests_daily': 50000,
    'api_requests_hourly': 5000,
    'stripe_transactions_daily': 1000,
    'cpu_usage_percent': 80,
    'memory_usage_percent': 85,
    'cost_spike_percent': 150,
    'daily_budget_usd': 50.0,
    'monthly_budget_usd': 500.0,
}

COST_RATES = {
    'openai_gpt4o_mini_input_per_1k': 0.00015,
    'openai_gpt4o_mini_output_per_1k': 0.0006,
    'stripe_transaction_percent': 2.9,
    'stripe_transaction_fixed': 0.30,
    'replit_cpu_hour': 0.01,
}

class CostGuard:
    """Cost monitoring and protection system."""
    
    def __init__(self):
        self.metrics_file = OUTPUT_DIR / 'metrics.json'
        self.forecast_file = OUTPUT_DIR / 'forecast.json'
        self.alerts_file = OUTPUT_DIR / 'alerts.json'
        self.throttle_file = OUTPUT_DIR / 'throttle_state.json'
        self.history_file = OUTPUT_DIR / 'cost_history.json'
        self.load_state()
    
    def load_state(self):
        """Load current state from files."""
        self.metrics = self._load_json(self.metrics_file, {'samples': []})
        self.throttle_state = self._load_json(self.throttle_file, {
            'throttled_modules': [],
            'paused_mutations': [],
            'low_cost_mode': False,
            'last_updated': None
        })
        self.history = self._load_json(self.history_file, {'daily_costs': []})
    
    def _load_json(self, path: Path, default: Dict) -> Dict:
        if path.exists():
            try:
                with open(path) as f:
                    return json.load(f)
            except:
                return default
        return default
    
    def _save_json(self, path: Path, data: Dict):
        with open(path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    def collect_metrics(self) -> Dict[str, Any]:
        """Collect current cost-related metrics."""
        now = datetime.now(timezone.utc)
        
        metrics = {
            'timestamp': now.isoformat(),
            'openai': self._get_openai_metrics(),
            'api': self._get_api_metrics(),
            'stripe': self._get_stripe_metrics(),
            'compute': self._get_compute_metrics(),
            'estimated_cost_today': 0.0,
            'estimated_cost_month': 0.0,
        }
        
        metrics['estimated_cost_today'] = self._calculate_daily_cost(metrics)
        metrics['estimated_cost_month'] = self._calculate_monthly_cost(metrics)
        
        self.metrics['samples'].append(metrics)
        if len(self.metrics['samples']) > 1440:
            self.metrics['samples'] = self.metrics['samples'][-1440:]
        
        self._save_json(self.metrics_file, self.metrics)
        return metrics
    
    def _get_openai_metrics(self) -> Dict[str, Any]:
        """Get OpenAI usage metrics from logs or API."""
        usage_file = Path('/home/runner/workspace/workspace-data/autopilot/ai_usage.json')
        if usage_file.exists():
            try:
                with open(usage_file) as f:
                    data = json.load(f)
                    return {
                        'tokens_today': data.get('tokens_today', 0),
                        'tokens_hour': data.get('tokens_hour', 0),
                        'requests_today': data.get('requests_today', 0),
                        'cost_today': data.get('cost_today', 0.0),
                    }
            except:
                pass
        return {
            'tokens_today': 0,
            'tokens_hour': 0,
            'requests_today': 0,
            'cost_today': 0.0,
        }
    
    def _get_api_metrics(self) -> Dict[str, Any]:
        """Get API request metrics."""
        return {
            'requests_today': 0,
            'requests_hour': 0,
            'errors_today': 0,
            'avg_latency_ms': 0,
        }
    
    def _get_stripe_metrics(self) -> Dict[str, Any]:
        """Get Stripe transaction metrics."""
        return {
            'transactions_today': 0,
            'volume_today_usd': 0.0,
            'fees_today_usd': 0.0,
        }
    
    def _get_compute_metrics(self) -> Dict[str, Any]:
        """Get compute resource metrics."""
        try:
            import psutil
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            return {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_used_mb': memory.used / (1024 * 1024),
            }
        except ImportError:
            return {
                'cpu_percent': 0,
                'memory_percent': 0,
                'memory_used_mb': 0,
            }
    
    def _calculate_daily_cost(self, metrics: Dict) -> float:
        """Calculate estimated daily cost."""
        cost = 0.0
        openai = metrics.get('openai', {})
        tokens = openai.get('tokens_today', 0)
        cost += (tokens / 1000) * COST_RATES['openai_gpt4o_mini_input_per_1k']
        
        stripe = metrics.get('stripe', {})
        volume = stripe.get('volume_today_usd', 0)
        txns = stripe.get('transactions_today', 0)
        cost += (volume * COST_RATES['stripe_transaction_percent'] / 100) + (txns * COST_RATES['stripe_transaction_fixed'])
        
        return round(cost, 4)
    
    def _calculate_monthly_cost(self, metrics: Dict) -> float:
        """Calculate estimated monthly cost."""
        daily_avg = metrics.get('estimated_cost_today', 0)
        return round(daily_avg * 30, 2)
    
    def predict_next_day_cost(self) -> Dict[str, Any]:
        """Predict tomorrow's cost based on historical data."""
        now = datetime.now(timezone.utc)
        samples = self.metrics.get('samples', [])
        
        if len(samples) < 24:
            prediction = {
                'predicted_cost_usd': COST_THRESHOLDS['daily_budget_usd'] * 0.5,
                'confidence': 'low',
                'trend': 'stable',
                'factors': ['insufficient_data'],
            }
        else:
            recent_costs = [s.get('estimated_cost_today', 0) for s in samples[-24:]]
            avg_cost = sum(recent_costs) / len(recent_costs) if recent_costs else 0
            
            older_costs = [s.get('estimated_cost_today', 0) for s in samples[-48:-24]] if len(samples) >= 48 else recent_costs
            older_avg = sum(older_costs) / len(older_costs) if older_costs else avg_cost
            
            if older_avg > 0:
                trend_factor = avg_cost / older_avg
            else:
                trend_factor = 1.0
            
            predicted = avg_cost * trend_factor
            
            if trend_factor > 1.2:
                trend = 'increasing'
            elif trend_factor < 0.8:
                trend = 'decreasing'
            else:
                trend = 'stable'
            
            prediction = {
                'predicted_cost_usd': round(predicted, 2),
                'confidence': 'high' if len(samples) >= 168 else 'medium',
                'trend': trend,
                'trend_factor': round(trend_factor, 2),
                'factors': self._identify_cost_factors(samples[-24:]),
            }
        
        prediction['timestamp'] = now.isoformat()
        prediction['budget_remaining'] = round(COST_THRESHOLDS['daily_budget_usd'] - prediction['predicted_cost_usd'], 2)
        prediction['budget_percent_used'] = round((prediction['predicted_cost_usd'] / COST_THRESHOLDS['daily_budget_usd']) * 100, 1)
        
        self._save_json(self.forecast_file, prediction)
        return prediction
    
    def _identify_cost_factors(self, samples: List[Dict]) -> List[str]:
        """Identify main cost drivers."""
        factors = []
        
        openai_costs = sum(s.get('openai', {}).get('cost_today', 0) for s in samples)
        if openai_costs > 0:
            factors.append('openai_usage')
        
        stripe_fees = sum(s.get('stripe', {}).get('fees_today_usd', 0) for s in samples)
        if stripe_fees > 0:
            factors.append('stripe_transactions')
        
        high_cpu = any(s.get('compute', {}).get('cpu_percent', 0) > 70 for s in samples)
        if high_cpu:
            factors.append('high_compute')
        
        return factors if factors else ['baseline_operations']
    
    def detect_spike(self, current_metrics: Dict) -> Optional[Dict]:
        """Detect cost spikes that require attention."""
        alerts = []
        
        openai = current_metrics.get('openai', {})
        if openai.get('tokens_hour', 0) > COST_THRESHOLDS['openai_tokens_hourly']:
            alerts.append({
                'type': 'openai_spike',
                'severity': 'high',
                'message': f"OpenAI tokens/hour ({openai['tokens_hour']}) exceeds threshold ({COST_THRESHOLDS['openai_tokens_hourly']})",
                'action': 'throttle_ai',
            })
        
        compute = current_metrics.get('compute', {})
        if compute.get('cpu_percent', 0) > COST_THRESHOLDS['cpu_usage_percent']:
            alerts.append({
                'type': 'cpu_spike',
                'severity': 'medium',
                'message': f"CPU usage ({compute['cpu_percent']}%) exceeds threshold ({COST_THRESHOLDS['cpu_usage_percent']}%)",
                'action': 'reduce_background_jobs',
            })
        
        daily_cost = current_metrics.get('estimated_cost_today', 0)
        if daily_cost > COST_THRESHOLDS['daily_budget_usd']:
            alerts.append({
                'type': 'budget_exceeded',
                'severity': 'critical',
                'message': f"Daily cost (${daily_cost}) exceeds budget (${COST_THRESHOLDS['daily_budget_usd']})",
                'action': 'enable_low_cost_mode',
                'requires_approval': True,
            })
        
        if alerts:
            spike_data = {
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'alerts': alerts,
                'current_metrics': current_metrics,
            }
            self._save_json(self.alerts_file, spike_data)
            return spike_data
        
        return None
    
    def auto_throttle(self, module: str, reason: str) -> Dict:
        """Auto-throttle an expensive module."""
        now = datetime.now(timezone.utc)
        
        throttle_entry = {
            'module': module,
            'reason': reason,
            'throttled_at': now.isoformat(),
            'expires_at': (now + timedelta(hours=1)).isoformat(),
        }
        
        self.throttle_state['throttled_modules'] = [
            t for t in self.throttle_state['throttled_modules']
            if t['module'] != module
        ]
        self.throttle_state['throttled_modules'].append(throttle_entry)
        self.throttle_state['last_updated'] = now.isoformat()
        
        self._save_json(self.throttle_file, self.throttle_state)
        logger.info(f"Auto-throttled module: {module} - Reason: {reason}")
        
        return throttle_entry
    
    def pause_mutation(self, mutation_id: str, risk_level: str) -> Dict:
        """Pause a risky growth mutation."""
        now = datetime.now(timezone.utc)
        
        pause_entry = {
            'mutation_id': mutation_id,
            'risk_level': risk_level,
            'paused_at': now.isoformat(),
            'requires_approval': risk_level in ['high', 'critical'],
        }
        
        self.throttle_state['paused_mutations'].append(pause_entry)
        self.throttle_state['last_updated'] = now.isoformat()
        
        self._save_json(self.throttle_file, self.throttle_state)
        logger.info(f"Paused mutation: {mutation_id} - Risk: {risk_level}")
        
        return pause_entry
    
    def enable_low_cost_mode(self) -> Dict:
        """Enable low-cost mode to reduce expenses."""
        now = datetime.now(timezone.utc)
        
        self.throttle_state['low_cost_mode'] = True
        self.throttle_state['low_cost_enabled_at'] = now.isoformat()
        self.throttle_state['last_updated'] = now.isoformat()
        
        self._save_json(self.throttle_file, self.throttle_state)
        logger.warning("LOW COST MODE ENABLED - Non-essential features throttled")
        
        return {
            'low_cost_mode': True,
            'enabled_at': now.isoformat(),
            'affected_features': [
                'ai_suggestions',
                'background_analytics',
                'real_time_monitoring',
                'growth_mutations',
            ],
        }
    
    def is_module_throttled(self, module: str) -> bool:
        """Check if a module is currently throttled."""
        now = datetime.now(timezone.utc)
        
        for throttle in self.throttle_state.get('throttled_modules', []):
            if throttle['module'] == module:
                expires = datetime.fromisoformat(throttle['expires_at'].replace('Z', '+00:00'))
                if now < expires:
                    return True
        return False
    
    def get_approval_queue(self) -> List[Dict]:
        """Get items requiring founder approval."""
        queue = []
        
        for mutation in self.throttle_state.get('paused_mutations', []):
            if mutation.get('requires_approval'):
                queue.append({
                    'type': 'mutation',
                    'id': mutation['mutation_id'],
                    'reason': f"High-risk mutation (risk: {mutation['risk_level']})",
                    'paused_at': mutation['paused_at'],
                })
        
        alerts_data = self._load_json(self.alerts_file, {'alerts': []})
        for alert in alerts_data.get('alerts', []):
            if alert.get('requires_approval'):
                queue.append({
                    'type': 'cost_alert',
                    'id': alert['type'],
                    'reason': alert['message'],
                    'severity': alert['severity'],
                })
        
        return queue
    
    def run_full_check(self) -> Dict[str, Any]:
        """Run complete cost guard check."""
        logger.info("=" * 60)
        logger.info("COST AUTOPILOT GRID - V10 CHECK")
        logger.info("=" * 60)
        
        metrics = self.collect_metrics()
        logger.info(f"Metrics collected: CPU {metrics['compute']['cpu_percent']}%, Memory {metrics['compute']['memory_percent']}%")
        
        forecast = self.predict_next_day_cost()
        logger.info(f"Next-day forecast: ${forecast['predicted_cost_usd']} ({forecast['confidence']} confidence)")
        logger.info(f"Budget status: {forecast['budget_percent_used']}% used, ${forecast['budget_remaining']} remaining")
        
        spike = self.detect_spike(metrics)
        if spike:
            logger.warning(f"SPIKE DETECTED: {len(spike['alerts'])} alerts")
            for alert in spike['alerts']:
                logger.warning(f"  - [{alert['severity'].upper()}] {alert['message']}")
                if alert.get('action') == 'throttle_ai':
                    self.auto_throttle('openai', 'token_spike')
                elif alert.get('action') == 'enable_low_cost_mode':
                    self.enable_low_cost_mode()
        else:
            logger.info("No cost spikes detected")
        
        approval_queue = self.get_approval_queue()
        logger.info(f"Pending approvals: {len(approval_queue)}")
        
        result = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'status': 'PASS' if not spike else 'WARN',
            'metrics': metrics,
            'forecast': forecast,
            'spike_detected': spike is not None,
            'alerts': spike['alerts'] if spike else [],
            'throttled_modules': self.throttle_state.get('throttled_modules', []),
            'paused_mutations': self.throttle_state.get('paused_mutations', []),
            'low_cost_mode': self.throttle_state.get('low_cost_mode', False),
            'approval_queue': approval_queue,
            'thresholds': COST_THRESHOLDS,
        }
        
        summary_file = OUTPUT_DIR / 'cost_guard_summary.json'
        self._save_json(summary_file, result)
        logger.info(f"Summary saved: {summary_file}")
        
        return result


def main():
    """Main entry point for cost guard."""
    guard = CostGuard()
    result = guard.run_full_check()
    
    print("\n" + "=" * 60)
    print("COST GUARD SUMMARY")
    print("=" * 60)
    print(f"Status: {result['status']}")
    print(f"Forecast: ${result['forecast']['predicted_cost_usd']} ({result['forecast']['trend']} trend)")
    print(f"Budget: {result['forecast']['budget_percent_used']}% used")
    print(f"Low-cost mode: {'ON' if result['low_cost_mode'] else 'OFF'}")
    print(f"Throttled modules: {len(result['throttled_modules'])}")
    print(f"Paused mutations: {len(result['paused_mutations'])}")
    print(f"Pending approvals: {len(result['approval_queue'])}")
    
    return result


if __name__ == '__main__':
    main()
