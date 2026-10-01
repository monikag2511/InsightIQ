import os
import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
from reportlab.lib.units import inch

def generate_pdf_report(
    output_pdf_path: str,
    dataset_name: str,
    profile: Dict[str, Any],
    stats: Dict[str, Any],
    insights: List[Dict[str, Any]],
    ai_summary: str
) -> str:
    """
    Generates an executive-level, professional analytics PDF report using ReportLab.
    Includes Dataset Overview, Data Quality Score, Column Profiles, Statistics,
    Key Insights, Outlier Breakdown, and AI Summary.
    """
    os.makedirs(os.path.dirname(os.path.abspath(output_pdf_path)), exist_ok=True)

    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Brand Styles
    brand_dark = colors.HexColor("#0f172a")
    brand_blue = colors.HexColor("#2563eb")
    brand_gray = colors.HexColor("#64748b")
    brand_bg = colors.HexColor("#f8fafc")
    brand_border = colors.HexColor("#e2e8f0")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=brand_dark,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=brand_blue,
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'Heading1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=brand_dark,
        spaceBefore=14,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=brand_dark
    )

    meta_style = ParagraphStyle(
        'Meta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=brand_gray
    )

    story = []

    # Header / Title Banner
    story.append(Paragraph("<b>InsightIQ</b> Executive Analytics Report", title_style))
    story.append(Paragraph(f"Dataset: <b>{dataset_name}</b> | Generated on {datetime.datetime.now().strftime('%B %d, %Y %H:%M')}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=brand_blue, spaceBefore=4, spaceAfter=14))

    # Section 1: Executive KPI Summary
    story.append(Paragraph("1. Executive Dataset Overview", h1_style))
    
    kpi_data = [
        ["Total Rows", "Columns", "Data Quality Score", "Missing Values", "Duplicate Rows"],
        [
            f"{profile.get('row_count', 0):,}",
            f"{profile.get('column_count', 0)}",
            f"{profile.get('quality_score', 100.0)}%",
            f"{profile.get('missing_values', 0):,} ({profile.get('missing_pct', 0)}%)",
            f"{profile.get('duplicate_rows', 0):,} ({profile.get('duplicate_pct', 0)}%)"
        ]
    ]

    t_kpi = Table(kpi_data, colWidths=[105, 75, 120, 130, 110])
    t_kpi.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), brand_dark),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, 1), (-1, 1), brand_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, brand_border),
    ]))
    story.append(t_kpi)
    story.append(Spacer(1, 12))

    # Section 2: AI Executive Summary
    story.append(Paragraph("2. Automated Strategic Summary", h1_style))
    for line in ai_summary.split("\n\n"):
        if line.strip():
            story.append(Paragraph(line.replace("### ", "<b>").replace("\n", "</b><br/>"), body_style))
            story.append(Spacer(1, 4))
    story.append(Spacer(1, 8))

    # Section 3: Key Actionable Insights
    story.append(Paragraph("3. Key Actionable Insights", h1_style))
    insight_table_data = [["Category", "Finding & Analysis", "Impact"]]
    for item in insights[:8]:
        category_tag = item.get("category", "General").upper()
        title = item.get("title", "")
        desc = item.get("description", "")
        sev = item.get("severity", "info").upper()
        text_cell = Paragraph(f"<b>{title}</b><br/>{desc}", body_style)
        insight_table_data.append([category_tag, text_cell, sev])

    t_ins = Table(insight_table_data, colWidths=[80, 390, 70])
    t_ins.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), brand_blue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (2, 0), (2, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, brand_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, brand_bg])
    ]))
    story.append(t_ins)
    story.append(Spacer(1, 12))

    # Section 4: Numerical Statistics
    story.append(Paragraph("4. Numerical Statistics Breakdown", h1_style))
    num_stats = stats.get("numerical", {})
    if num_stats:
        num_rows = [["Column", "Mean", "Std Dev", "Min", "Median", "Max", "IQR"]]
        for col, s in list(num_stats.items())[:8]:
            num_rows.append([
                col,
                f"{s.get('mean', 0):,.2f}",
                f"{s.get('std', 0):,.2f}",
                f"{s.get('min', 0):,.2f}",
                f"{s.get('median', 0):,.2f}",
                f"{s.get('max', 0):,.2f}",
                f"{s.get('iqr', 0):,.2f}"
            ])
        t_num = Table(num_rows, colWidths=[120, 70, 70, 70, 70, 70, 70])
        t_num.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), brand_dark),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('GRID', (0, 0), (-1, -1), 0.5, brand_border),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, brand_bg])
        ]))
        story.append(t_num)
    story.append(Spacer(1, 14))

    # Footer note
    story.append(HRFlowable(width="100%", thickness=1, color=brand_border, spaceBefore=10, spaceAfter=6))
    story.append(Paragraph("InsightIQ Platform | Autonomous Natural Language Tabular Intelligence | Confidential Report", meta_style))

    doc.build(story)
    return output_pdf_path
