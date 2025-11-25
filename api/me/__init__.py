"""
User Data API Routes - MEGA PHASE Legal-0
Endpoints for GDPR/CCPA data subject rights (export, delete).
"""
from flask import Blueprint

me_bp = Blueprint('me', __name__, url_prefix='/api/me')

from . import routes
