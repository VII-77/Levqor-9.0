"""
Privacy & Data Rights API Module
Handles GDPR/privacy requests: export, delete, consent withdrawal
"""
from flask import Blueprint

privacy_bp = Blueprint('privacy', __name__, url_prefix='/api/privacy')

from . import routes
