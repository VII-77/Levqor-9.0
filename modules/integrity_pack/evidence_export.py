"""
Evidence Exporter - PDF Report Generation
Converts integrity test results to professional PDF reports
"""
import os
import json
from datetime import datetime
from typing import Dict, Any

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


class EvidenceExporter:
    """Exports integrity test results as PDF evidence reports"""
    
    def __init__(self):
        if not REPORTLAB_AVAILABLE:
            raise ImportError("reportlab not installed. Run: pip install reportlab")
        
        self.styles = getSampleStyleSheet()
        self._add_custom_styles()
    
    def _add_custom_styles(self):
        """Add custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30,
            alignment=TA_CENTER
        ))
        
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#333333'),
            spaceAfter=12,
            spaceBefore=12
        ))
        
        self.styles.add(ParagraphStyle(
            name='Status',
            parent=self.styles['Normal'],
            fontSize=10,
            alignment=TA_LEFT
        ))
    
    def export_to_pdf(self, integrity_results: Dict[str, Any], finalizer_results: Dict[str, Any], output_path: str) -> str:
        """
        Generate PDF report from integrity and finalizer results
        
        Args:
            integrity_results: Results from IntegrityTester
            finalizer_results: Results from Finalizer
            output_path: Path to save PDF file
        
        Returns:
            Path to generated PDF file
        """
        print(f"📄 Generating PDF report...")
        
        doc = SimpleDocTemplate(output_path, pagesize=letter)
        story = []
        
        # Title Page
        story.extend(self._create_title_page(integrity_results, finalizer_results))
        story.append(PageBreak())
        
        # Executive Summary
        story.extend(self._create_executive_summary(integrity_results, finalizer_results))
        story.append(PageBreak())
        
        # Integrity Test Results
        story.extend(self._create_integrity_section(integrity_results))
        story.append(PageBreak())
        
        # Finalizer Validation Results
        story.extend(self._create_finalizer_section(finalizer_results))
        story.append(PageBreak())
        
        # Recommendations
        story.extend(self._create_recommendations(integrity_results, finalizer_results))
        
        # Build PDF
        doc.build(story)
        
        print(f"✅ PDF report generated: {output_path}")
        return output_path
    
    def _create_title_page(self, integrity: Dict, finalizer: Dict) -> list:
        """Create title page"""
        elements = []
        
        # Title
        elements.append(Spacer(1, 2*inch))
        title = Paragraph("Levqor Integrity Report", self.styles['CustomTitle'])
        elements.append(title)
        elements.append(Spacer(1, 0.5*inch))
        
        # Subtitle
        timestamp = datetime.now().strftime("%B %d, %Y at %I:%M %p UTC")
        subtitle = Paragraph(f"Generated: {timestamp}", self.styles['Normal'])
        elements.append(subtitle)
        elements.append(Spacer(1, 1*inch))
        
        # Overall Status
        integrity_passed = integrity.get("summary", {}).get("failed", 0) == 0
        finalizer_passed = finalizer.get("summary", {}).get("deployment_ready", False)
        overall_status = "✅ PASSED" if (integrity_passed and finalizer_passed) else "⚠️ NEEDS ATTENTION"
        
        status_text = f"<b>Overall Status:</b> {overall_status}"
        status = Paragraph(status_text, self.styles['Heading2'])
        elements.append(status)
        
        return elements
    
    def _create_executive_summary(self, integrity: Dict, finalizer: Dict) -> list:
        """Create executive summary section"""
        elements = []
        
        elements.append(Paragraph("Executive Summary", self.styles['CustomHeading']))
        elements.append(Spacer(1, 12))
        
        # Summary table
        integrity_summary = integrity.get("summary", {})
        finalizer_summary = finalizer.get("summary", {})
        
        data = [
            ['Category', 'Total', 'Passed', 'Failed', 'Success Rate'],
            [
                'Integrity Tests',
                str(integrity_summary.get('total', 0)),
                str(integrity_summary.get('passed', 0)),
                str(integrity_summary.get('failed', 0)),
                f"{integrity_summary.get('success_rate', 0)}%"
            ],
            [
                'Finalizer Checks',
                str(finalizer_summary.get('total', 0)),
                str(finalizer_summary.get('passed', 0)),
                str(finalizer_summary.get('failed', 0)),
                f"{finalizer_summary.get('success_rate', 0)}%"
            ]
        ]
        
        table = Table(data, colWidths=[2*inch, 1*inch, 1*inch, 1*inch, 1.5*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 24))
        
        # Deployment Status
        deployment_ready = finalizer_summary.get('deployment_ready', False)
        deployment_text = f"<b>Deployment Status:</b> {'✅ Ready for Production' if deployment_ready else '⚠️ Not Ready - Issues Found'}"
        elements.append(Paragraph(deployment_text, self.styles['Normal']))
        
        return elements
    
    def _create_integrity_section(self, integrity: Dict) -> list:
        """Create integrity test results section"""
        elements = []
        
        elements.append(Paragraph("Integrity Test Results", self.styles['CustomHeading']))
        elements.append(Spacer(1, 12))
        
        # Group results by category
        results = integrity.get("results", [])
        categories = {}
        for result in results:
            cat = result.get("category", "other")
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(result)
        
        # Create tables for each category
        for category, tests in categories.items():
            cat_title = category.replace("_", " ").title()
            elements.append(Paragraph(cat_title, self.styles['Heading3']))
            elements.append(Spacer(1, 6))
            
            # Build table data
            data = [['Test', 'Status', 'Details']]
            for test in tests:
                status_emoji = {
                    'passed': '✅',
                    'failed': '❌',
                    'warning': '⚠️',
                    'skipped': '⏭️'
                }.get(test.get('status'), '❓')
                
                test_name = test.get('test', 'Unknown')
                status = f"{status_emoji} {test.get('status', 'unknown').upper()}"
                
                details = []
                if 'latency_ms' in test:
                    details.append(f"{test['latency_ms']}ms")
                if 'error' in test:
                    details.append(test['error'][:50])
                if 'reason' in test:
                    details.append(test['reason'][:50])
                
                data.append([test_name, status, ', '.join(details) if details else 'OK'])
            
            table = Table(data, colWidths=[2.5*inch, 1.5*inch, 2.5*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4CAF50')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
            ]))
            
            elements.append(table)
            elements.append(Spacer(1, 18))
        
        return elements
    
    def _create_finalizer_section(self, finalizer: Dict) -> list:
        """Create finalizer validation section"""
        elements = []
        
        elements.append(Paragraph("Finalizer Validation Results", self.styles['CustomHeading']))
        elements.append(Spacer(1, 12))
        
        # Group validations by category
        validations = finalizer.get("validations", [])
        categories = {}
        for val in validations:
            cat = val.get("category", "other")
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(val)
        
        # Create tables for each category
        for category, checks in categories.items():
            cat_title = category.replace("_", " ").title()
            elements.append(Paragraph(cat_title, self.styles['Heading3']))
            elements.append(Spacer(1, 6))
            
            # Build table data
            data = [['Check', 'Status', 'Purpose']]
            for check in checks:
                status_emoji = {
                    'passed': '✅',
                    'failed': '❌',
                    'warning': '⚠️'
                }.get(check.get('status'), '❓')
                
                check_name = check.get('check', 'Unknown')
                status = f"{status_emoji} {check.get('status', 'unknown').upper()}"
                purpose = check.get('purpose', check.get('reason', 'N/A'))[:40]
                
                data.append([check_name, status, purpose])
            
            table = Table(data, colWidths=[2.5*inch, 1.5*inch, 2.5*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2196F3')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
            ]))
            
            elements.append(table)
            elements.append(Spacer(1, 18))
        
        return elements
    
    def _create_recommendations(self, integrity: Dict, finalizer: Dict) -> list:
        """Create recommendations section"""
        elements = []
        
        elements.append(Paragraph("Recommendations", self.styles['CustomHeading']))
        elements.append(Spacer(1, 12))
        
        recommendations = []
        
        # Check for failures
        integrity_failed = integrity.get("summary", {}).get("failed", 0)
        finalizer_failed = finalizer.get("summary", {}).get("failed", 0)
        
        if integrity_failed > 0:
            recommendations.append(f"• Address {integrity_failed} failed integrity test(s) before deployment")
        
        if finalizer_failed > 0:
            recommendations.append(f"• Fix {finalizer_failed} finalizer validation error(s)")
        
        if integrity_failed == 0 and finalizer_failed == 0:
            recommendations.append("• ✅ All checks passed - system is production-ready")
            recommendations.append("• Schedule regular integrity tests (weekly recommended)")
            recommendations.append("• Monitor uptime and performance metrics")
        else:
            recommendations.append("• Review detailed error logs above")
            recommendations.append("• Re-run integrity test after fixes")
            recommendations.append("• Contact support if issues persist")
        
        for rec in recommendations:
            elements.append(Paragraph(rec, self.styles['Normal']))
            elements.append(Spacer(1, 6))
        
        return elements


def generate_evidence_report(integrity_results: Dict[str, Any], finalizer_results: Dict[str, Any], output_dir: str = ".") -> str:
    """
    Convenience function to generate evidence PDF report
    
    Args:
        integrity_results: Results from IntegrityTester
        finalizer_results: Results from Finalizer
        output_dir: Directory to save PDF file
    
    Returns:
        Path to generated PDF file
    """
    timestamp = int(datetime.utcnow().timestamp())
    filename = f"integrity_evidence_{timestamp}.pdf"
    output_path = os.path.join(output_dir, filename)
    
    exporter = EvidenceExporter()
    return exporter.export_to_pdf(integrity_results, finalizer_results, output_path)


if __name__ == "__main__":
    # Example usage - load from JSON files
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python evidence_export.py <integrity_report.json> <finalizer_report.json>")
        sys.exit(1)
    
    with open(sys.argv[1], 'r') as f:
        integrity_data = json.load(f)
    
    with open(sys.argv[2], 'r') as f:
        finalizer_data = json.load(f)
    
    pdf_path = generate_evidence_report(integrity_data, finalizer_data)
    print(f"\n✅ Evidence report generated: {pdf_path}")
