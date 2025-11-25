# Levqor Scaling Documentation

**Version:** v22.0  
**Last Updated:** November 25, 2025

---

## Overview

Levqor uses a combination of logical auto-scaling (rate limiting) and external infrastructure scaling. This document explains how both work and how to integrate Levqor with external autoscalers.

---

## Logical Auto-Scaling (Rate Limiting)

Levqor's `scaling_policy.py` module provides dynamic rate limiting based on current system load.

### Load Tiers

| Tier | Load Level | Description |
|------|------------|-------------|
| Low | 0-30% | Normal operations, generous rate limits |
| Medium | 30-60% | Moderate load, standard rate limits |
| High | 60-80% | Heavy load, reduced rate limits |
| Critical | 80-95% | Maximum load, minimal rate limits |

### Rate Limit Profiles

| Endpoint | Low Load | Medium Load | High Load | Critical Load |
|----------|----------|-------------|-----------|---------------|
| Default | 200/min | 100/min | 70/min | 50/min |
| AI Chat | 50/min | 30/min | 20/min | 10/min |
| Workflows | 100/min | 60/min | 40/min | 20/min |
| Billing | 30/min | 20/min | 15/min | 10/min |
| Health | 200/min | 100/min | 50/min | 30/min |

### Usage

```python
from security_core.scaling_policy import (
    set_current_load,
    get_load_tier,
    choose_rate_limits,
    get_limit_for_endpoint
)

# Set current load (0.0 - 1.0)
set_current_load(0.65)

# Get current tier
tier = get_load_tier()  # Returns "high"

# Get rate limits for current load
limits = choose_rate_limits()

# Get limit for specific endpoint
limit = get_limit_for_endpoint("/api/ai/chat")
```

### Load Estimation

```python
from security_core.scaling_policy import estimate_load_from_requests

# Estimate load from requests per minute
requests_per_minute = 450
capacity = 1000
load = estimate_load_from_requests(requests_per_minute, capacity)
# Returns 0.45 (45% load)
```

---

## Infrastructure Scaling

**Important:** Levqor does NOT auto-provision infrastructure. Infrastructure scaling must be configured externally through your hosting platform.

### Recommended Scaling Triggers

| Metric | Scale Up Threshold | Scale Down Threshold |
|--------|-------------------|----------------------|
| CPU Usage | > 70% for 5 min | < 30% for 10 min |
| Memory Usage | > 80% for 5 min | < 40% for 10 min |
| Request Queue | > 100 pending | < 10 pending |
| Response Time (p95) | > 500ms | < 100ms |

### Health Endpoint for Autoscalers

Levqor exposes `/api/health/summary` for health checks and autoscaler integration:

```bash
curl https://api.levqor.ai/api/health/summary
```

Response:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime_seconds": 86400,
  "checks": {
    "database": "ok",
    "scheduler": "ok",
    "rate_limits": "ok"
  },
  "metrics": {
    "requests_per_minute": 450,
    "error_rate": 0.02,
    "avg_response_ms": 125
  }
}
```

### Integration with External Autoscalers

#### Kubernetes HPA

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: levqor-backend
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: levqor-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### AWS Auto Scaling

```json
{
  "AutoScalingGroupName": "levqor-backend-asg",
  "MinSize": 2,
  "MaxSize": 10,
  "DesiredCapacity": 2,
  "DefaultCooldown": 300,
  "HealthCheckType": "ELB",
  "HealthCheckGracePeriod": 60,
  "TargetGroupARNs": ["arn:aws:elasticloadbalancing:..."]
}
```

#### Replit Autoscale

Replit's built-in Autoscale deployment handles scaling automatically based on traffic. Configure via the Replit deployment settings:

1. Go to Deployment settings
2. Select "Autoscale" deployment type
3. Configure minimum/maximum instances
4. Set health check endpoint to `/api/health`

---

## Monitoring Integration

### Prometheus Metrics

Expose Levqor metrics for Prometheus scraping:

```python
# Example metrics endpoint
@app.route('/metrics')
def prometheus_metrics():
    return f"""
# HELP levqor_requests_total Total requests
# TYPE levqor_requests_total counter
levqor_requests_total {request_count}

# HELP levqor_response_time_seconds Response time histogram
# TYPE levqor_response_time_seconds histogram
levqor_response_time_seconds_bucket{{le="0.1"}} {fast_requests}
levqor_response_time_seconds_bucket{{le="0.5"}} {medium_requests}
levqor_response_time_seconds_bucket{{le="1.0"}} {slow_requests}

# HELP levqor_load_ratio Current load ratio
# TYPE levqor_load_ratio gauge
levqor_load_ratio {current_load}
"""
```

### Grafana Dashboard

Recommended panels for Levqor monitoring:

1. **Request Rate** - Requests per second over time
2. **Response Time** - p50, p95, p99 latencies
3. **Error Rate** - 4xx and 5xx errors per minute
4. **Load Level** - Current load tier from scaling_policy
5. **Active Workflows** - Running workflow count
6. **Approval Queue** - Pending approvals count

---

## Best Practices

### Do

1. **Monitor health endpoint** - Use `/api/health/summary` for readiness/liveness probes
2. **Set conservative limits** - Start with lower rate limits and increase as needed
3. **Use horizontal scaling** - Scale out (more instances) before scaling up (bigger instances)
4. **Implement circuit breakers** - Protect downstream services from cascading failures
5. **Cache aggressively** - Use Redis or memcached for frequently accessed data

### Don't

1. **Don't auto-scale based on single spikes** - Use averaged metrics over 5+ minutes
2. **Don't scale to zero** - Maintain minimum 2 instances for availability
3. **Don't ignore rate limits** - They protect both Levqor and your infrastructure
4. **Don't skip health checks** - Configure proper health check intervals

---

## Capacity Planning

### Estimated Capacity Per Instance

| Metric | Single Instance | With 2GB RAM | With 4GB RAM |
|--------|-----------------|--------------|--------------|
| Requests/sec | 50-100 | 100-200 | 200-400 |
| Concurrent users | 100 | 200 | 400 |
| Workflows/min | 20 | 40 | 80 |
| AI calls/min | 10 | 20 | 40 |

### Scaling Formula

```
Required Instances = (Peak Requests/sec / 75) + 1
```

Example: For 500 requests/sec peak → (500/75) + 1 = ~8 instances

---

## Related Documentation

- [Operations Guide](./operations.md) - Day-to-day operations
- [Workflows Guide](./workflows.md) - Workflow execution system
- [Real-World Alignment](./real_world_alignment.md) - ICP and safety limits

---

*This document is part of MEGA PHASE v22. Update when scaling policies change.*
