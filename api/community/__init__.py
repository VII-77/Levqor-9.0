"""Community & Badge System API - HYPERGROWTH CYCLE 5"""

from flask import Blueprint

community_bp = Blueprint('community', __name__, url_prefix='/api/community')

from . import routes
