"""
PDF Report Builder for Insights
Uses reportlab to generate quarterly reports
"""
import io
from datetime import datetime
from typing import Dict, Any

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
    from reportlab.lib.units import inch
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    print("⚠️ reportlab not installed - PDF generation disabled")

def build_pdf(kpis: Dict[str, Any]) -> bytes:
    """
    Build a PDF insights report
    
    Args:
        kpis: Dictionary of key performance indicators
        
    Returns:
        PDF file as bytes
    """
    if not REPORTLAB_AVAILABLE:
        # Return a simple text-based fallback
        text = f"Levqor Insights Report - {datetime.utcnow().date()}\n\n"
        text += f"Period: {kpis.get('period_days', 90)} days\n"
        text += f"Revenue: ${kpis.get('revenue', {}).get('total', 0):,.2f}\n"
        text += f"API Calls: {kpis.get('api_usage', {}).get('calls', 0):,}\n"
        text += f"Uptime: {kpis.get('uptime_avg', 0)}%\n"
        return text.encode('utf-8')
    
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    
    # Starting position
    y = height - 1 * inch
    
    def draw_line(text: str, font_size: int = 12, step: float = 18):
        """Helper to draw a line of text"""
        nonlocal y
        c.setFont("Helvetica", font_size)
        c.drawString(40, y, text)
        y -= step
    
    def draw_bold_line(text: str, font_size: int = 12, step: float = 20):
        """Helper to draw bold text"""
        nonlocal y
        c.setFont("Helvetica-Bold", font_size)
        c.drawString(40, y, text)
        y -= step
    
    # Header
    draw_bold_line(f"Levqor Insights Report", 24, 30)
    draw_line(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", 10, 30)
    
    # Executive Summary
    draw_bold_line("Executive Summary", 16, 25)
    draw_line(f"Period: {kpis.get('period_days', 90)} days", 10, 18)
    y -= 10
    
    # Revenue Section
    revenue = kpis.get('revenue', {})
    draw_bold_line("Revenue Metrics", 14, 22)
    draw_line(f"• Total Revenue: ${revenue.get('total', 0):,.2f}")
    draw_line(f"• Monthly Recurring Revenue (MRR): ${revenue.get('mrr', 0):,.2f}")
    y -= 10
    
    # API Usage Section
    api = kpis.get('api_usage', {})
    draw_bold_line("API Usage", 14, 22)
    draw_line(f"• Total API Calls: {api.get('calls', 0):,}")
    draw_line(f"• Active Users: {api.get('users', 0):,}")
    draw_line(f"• Avg Calls/User: {api.get('avg_per_user', 0):,.2f}")
    y -= 10
    
    # Operations Section
    draw_bold_line("Operations", 14, 22)
    draw_line(f"• Average Uptime: {kpis.get('uptime_avg', 0):.2f}%")
    draw_line(f"• Integrity Runs: {kpis.get('integrity_runs', {}).get('count', 0):,}")
    y -= 10
    
    # Financial Health
    draw_bold_line("Financial Health", 14, 22)
    draw_line(f"• Estimated Net Margin: ${kpis.get('net_margin_est', 0):,.2f}")
    
    # Footer
    y = 40
    c.setFont("Helvetica", 8)
    c.drawString(40, y, "Levqor - AI Job Orchestration Platform")
    c.drawString(40, y - 12, "Confidential - For Internal Use Only")
    
    c.showPage()
    c.save()
    
    return buf.getvalue()
