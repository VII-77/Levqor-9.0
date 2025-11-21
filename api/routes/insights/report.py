"""
Insights Report Generation API
Generates PDF reports and uploads to Google Drive
"""
from flask import Blueprint, jsonify
from datetime import datetime
import sys
import os

# Add modules to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..'))

from modules.data_insights.aggregator import aggregate
from modules.data_insights.report_builder import build_pdf
from modules.data_insights.uploader import upload_pdf

bp = Blueprint('insights_report', __name__, url_prefix="/api/insights")

@bp.post("/report")
def generate_report():
    """
    Generate quarterly insights report
    
    Returns:
        JSON with Drive link and KPIs
    """
    try:
        # Aggregate data
        kpis = aggregate(period_days=90)
        
        # Build PDF
        pdf_bytes = build_pdf(kpis)
        
        # Upload to Drive
        filename = f"Levqor_Insights_{datetime.utcnow().date().isoformat()}.pdf"
        drive_link = upload_pdf(pdf_bytes, filename)
        
        return jsonify({
            "ok": True,
            "drive_link": drive_link,
            "kpis": kpis,
            "filename": filename,
            "size_bytes": len(pdf_bytes)
        }), 200
        
    except Exception as e:
        return jsonify({
            "ok": False,
            "error": "report_generation_failed",
            "message": str(e)
        }), 500
