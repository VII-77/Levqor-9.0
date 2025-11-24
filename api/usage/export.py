from flask import Blueprint, Response
import csv
import io
from datetime import datetime, timedelta

bp = Blueprint('usage_export', __name__)

@bp.route('/api/usage/export', methods=['GET'])
def export_usage_csv():
    """Export usage data as CSV."""
    
    # TODO: Query actual usage data from database
    # For now, generate sample data
    
    data = [
        {
            "date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
            "workflows": max(0, 10 - i),
            "runs": max(0, 150 - (i * 10)),
            "ai_credits": max(0, 500 - (i * 50))
        }
        for i in range(30)
    ]
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["date", "workflows", "runs", "ai_credits"])
    writer.writeheader()
    writer.writerows(data)
    
    response = Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=levqor-usage-{datetime.now().strftime('%Y%m%d')}.csv"
        }
    )
    
    return response
