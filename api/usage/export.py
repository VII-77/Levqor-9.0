from flask import Blueprint, Response
import csv
import io
import logging
from datetime import datetime, timedelta

bp = Blueprint('usage_export', __name__)
logger = logging.getLogger(__name__)

@bp.route('/api/usage/export', methods=['GET'])
def export_usage_csv():
    """Export usage data as CSV with safety hardening."""
    
    try:
        # TODO: Query actual usage data from database
        # For now, generate sample data with None-safety
        
        raw_data = [
            {
                "date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
                "workflows": max(0, 10 - i),
                "runs": max(0, 150 - (i * 10)),
                "ai_credits": max(0, 500 - (i * 50))
            }
            for i in range(30)
        ]
        
        # Safety: Ensure all values are valid, coerce None to 0
        data = []
        for row in raw_data:
            try:
                safe_row = {
                    "date": row.get("date", datetime.now().strftime("%Y-%m-%d")),
                    "workflows": int(row.get("workflows") or 0),
                    "runs": int(row.get("runs") or 0),
                    "ai_credits": int(row.get("ai_credits") or 0)
                }
                data.append(safe_row)
            except (ValueError, TypeError) as e:
                logger.warning(f"CSV_EXPORT_ROW_SKIP: Invalid row data: {e}")
                continue
        
        # Always return at least the header
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=["date", "workflows", "runs", "ai_credits"])
        writer.writeheader()
        
        # Write rows if any
        if data:
            writer.writerows(data)
        
        logger.info(f"CSV_EXPORT: Generated {len(data)} rows")
        
        response = Response(
            output.getvalue(),
            mimetype="text/csv; charset=utf-8",
            headers={
                "Content-Disposition": f"attachment; filename=usage_30d.csv",
                "Cache-Control": "no-cache, no-store, must-revalidate"
            }
        )
        
        return response
        
    except Exception as e:
        logger.error(f"CSV_EXPORT_ERROR: {str(e)}")
        # Return minimal valid CSV even on error
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=["date", "workflows", "runs", "ai_credits"])
        writer.writeheader()
        
        return Response(
            output.getvalue(),
            mimetype="text/csv; charset=utf-8",
            headers={"Content-Disposition": "attachment; filename=usage_30d.csv"}
        )
