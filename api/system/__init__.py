"""
System API Blueprint - MEGA PHASE v30
System-level endpoints for launch readiness and diagnostics.
"""
from flask import Blueprint

system_bp = Blueprint("system", __name__, url_prefix="/api/system")

from .launch_readiness import system_bp
