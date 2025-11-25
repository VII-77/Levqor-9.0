"""Approvals API - MEGA PHASE v16-v17"""

from flask import Blueprint

approvals_bp = Blueprint('approvals', __name__, url_prefix='/api/approvals')

from . import routes
