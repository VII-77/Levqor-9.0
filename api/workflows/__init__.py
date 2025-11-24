"""Workflow Library & Daily Workflow API - HYPERGROWTH CYCLE 5"""

from flask import Blueprint

workflows_bp = Blueprint('workflows', __name__, url_prefix='/api/workflows')

from . import routes
