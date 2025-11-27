"""
System API Blueprint - MEGA PHASE v30 + Autopilot Wave 1
System-level endpoints for launch readiness, diagnostics, and heartbeat.
"""
from flask import Blueprint

system_bp = Blueprint("system", __name__, url_prefix="/api/system")

from .launch_readiness import system_bp
from .heartbeat import heartbeat_bp, run_heartbeat_check, get_heartbeat_data
