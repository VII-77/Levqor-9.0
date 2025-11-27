"""
Levqor Guardian Autopilot Module
Provides summary endpoints for telemetry analysis and autonomous monitoring.
Includes healing plan endpoint for safe auto-heal layer (dry-run only).

Wave 2 additions:
- Database-backed telemetry ingestion
- Telemetry summarizer with aggregation
- Anomaly detection (passive mode)
- Daily report generator with improvement suggestions
"""
from .summary import guardian_bp
from .healing import healing_bp, build_healing_plan
from .telemetry_ingest import telemetry_ingest_bp, store_telemetry, get_recent_logs
from .telemetry_summary import telemetry_summary_bp, get_telemetry_summary
from .anomaly_detector import anomaly_detector_bp, detect_anomalies
from .daily_report import daily_report_bp, generate_daily_report
