"""
Templates API Blueprint - MEGA PHASE v20
Provides REST API for workflow template marketplace.
"""
from flask import Blueprint

templates_bp = Blueprint("templates", __name__, url_prefix="/api/templates")

from . import routes
