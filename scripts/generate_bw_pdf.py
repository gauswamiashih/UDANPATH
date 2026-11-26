import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

# Ensure output directories exist
os.makedirs("scripts/diagrams", exist_ok=True)

# ==============================================================================
# 1. MATPLOTLIB BLACK & WHITE SEQUENCE DIAGRAM GENERATOR
# ==============================================================================

def draw_sequence_diagram(title, participants, steps, output_path, fig_height=6.5):
    """
    Renders a publication-grade, clean black-and-white sequence diagram.
    """
    fig, ax = plt.subplots(figsize=(10, fig_height), dpi=300)
    ax.set_facecolor('white')
    fig.patch.set_facecolor('white')

    n_parts = len(participants)
    x_positions = [i * (9.0 / max(1, n_parts - 1)) + 0.5 for i in range(n_parts)]
    y_top = fig_height - 0.8
    y_bottom = 0.5

    # Draw Participant Boxes and Lifelines
    for idx, name in enumerate(participants):
        x = x_positions[idx]
        
        # Header Box
        box_width = 1.3
        box_height = 0.45
        rect = patches.Rectangle(
            (x - box_width/2, y_top - box_height/2),
            box_width, box_height,
            facecolor='white',
            edgecolor='black',
            linewidth=1.4,
            zorder=3
        )
        ax.add_patch(rect)
        ax.text(x, y_top, name, ha='center', va='center', fontsize=8.5, fontweight='bold', color='black', zorder=4)

        # Dashed Lifeline
        ax.plot([x, x], [y_top - box_height/2, y_bottom], color='black', linestyle='--', linewidth=0.9, zorder=1)

        # Footer Box
        rect_bottom = patches.Rectangle(
            (x - box_width/2, y_bottom - box_height/2),
            box_width, box_height,
            facecolor='white',
            edgecolor='black',
            linewidth=1.2,
            zorder=3
        )
        ax.add_patch(rect_bottom)
        ax.text(x, y_bottom, name, ha='center', va='center', fontsize=8, color='black', zorder=4)

    # Calculate step vertical spacing
    n_steps = len(steps)
    step_y_spacing = (y_top - y_bottom - 0.7) / max(1, n_steps)
    current_y = y_top - 0.65

    for idx, step in enumerate(steps):
        from_idx, to_idx, text, is_dashed, is_self = step
        x1 = x_positions[from_idx]
        x2 = x_positions[to_idx]
        y = current_y

        if is_self:
            # Self call loop
            loop_w = 0.4
            loop_h = step_y_spacing * 0.4
            ax.plot([x1, x1 + loop_w, x1 + loop_w, x1], [y, y, y - loop_h, y - loop_h],
                    color='black', linewidth=1.2)
            # Arrow head
            ax.annotate('', xy=(x1, y - loop_h), xytext=(x1 + 0.05, y - loop_h),
                        arrowprops=dict(arrowstyle="-|>", color='black', lw=1.2))
            ax.text(x1 + loop_w + 0.05, y - loop_h/2, f"{idx+1}. {text}",
                    ha='left', va='center', fontsize=7.5, color='black', fontweight='medium')
        else:
            style = '--' if is_dashed else '-'
            arrow_style = "-|>"
            ax.plot([x1, x2], [y, y], color='black', linestyle=style, linewidth=1.2)
            
            # Draw arrowhead at destination
            dx = 0.01 if x2 > x1 else -0.01
            ax.annotate('', xy=(x2, y), xytext=(x2 - dx, y),
                        arrowprops=dict(arrowstyle=arrow_style, color='black', lw=1.2))
            
            # Label
            mid_x = (x1 + x2) / 2
            ax.text(mid_x, y + 0.07, f"{idx+1}. {text}",
                    ha='center', va='bottom', fontsize=7.5, color='black', fontweight='medium',
                    bbox=dict(boxstyle='square,pad=0.15', facecolor='white', edgecolor='none'))

        current_y -= step_y_spacing

    ax.set_xlim(-0.3, 10.3)
    ax.set_ylim(0.1, fig_height)
    ax.axis('off')
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()

# ------------------------------------------------------------------------------
# DIAGRAM 1: Module 1 - Authentication & RBAC
# ------------------------------------------------------------------------------
m1_participants = ["User", "Sign-In UI", "Auth Engine", "Users DB", "Route Guard"]
m1_steps = [
    (0, 1, "Select Persona & Input Credentials", False, False),
    (1, 2, "signInWithPassword(email, pass)", False, False),
    (2, 3, "SELECT role, status FROM users WHERE email=?", False, False),
    (3, 2, "Return User Record & Role (STUDENT / ADMIN)", True, False),
    (2, 1, "Issue JWT Session & Auth Cookie", True, False),
    (1, 4, "Validate Role & Route Permission", False, False),
    (4, 0, "[If STUDENT] Redirect to /student Dashboard", True, False),
    (4, 0, "[If ADMIN] Redirect to /coordinator Suite", True, False)
]
draw_sequence_diagram("Module 1: User Authentication & RBAC", m1_participants, m1_steps, "scripts/diagrams/m1_auth.png", fig_height=5.8)

# ------------------------------------------------------------------------------
# DIAGRAM 2: Module 2 - Student Onboarding & Academic Profile Setup
# ------------------------------------------------------------------------------
m2_participants = ["Student", "Onboarding UI", "Validator", "Profiles DB", "Eligibility Engine"]
m2_steps = [
    (0, 1, "Submit Demographics (DOB, Category, State)", False, False),
    (0, 1, "Submit Education (Degree, Branch, CGPA, Goal)", False, False),
    (1, 2, "validateProfile() & calculateCompleteness()", False, False),
    (2, 1, "Validation OK (Completeness = 95%)", True, False),
    (1, 3, "INSERT INTO students & education_profiles", False, False),
    (3, 1, "Persist Success (profile_id confirmed)", True, False),
    (1, 4, "computeMatch(Student, AllExams)", False, False),
    (4, 3, "SELECT criteria, cutoffs FROM exams", False, False),
    (3, 4, "Return Active Exam Rules", True, False),
    (4, 1, "Return Ranked Matches (ELIGIBLE / CHECK)", True, False),
    (1, 0, "Display Personalized Dashboard with Matches", True, False)
]
draw_sequence_diagram("Module 2: Student Onboarding & Profile Setup", m2_participants, m2_steps, "scripts/diagrams/m2_onboarding.png", fig_height=6.8)

# ------------------------------------------------------------------------------
# DIAGRAM 8: Module 8 - Exam Coordinator & Resource Management
# ------------------------------------------------------------------------------
m8_participants = ["Coordinator", "Portal UI", "Coord Service", "Master DB", "Notif Service", "Student"]
m8_steps = [
    (0, 1, "Enter Exam Schedule / Upload Syllabus / PYQ", False, False),
    (1, 2, "saveCoordinatorResources(resourceData)", False, False),
    (2, 3, "UPSERT INTO exams, resources, milestones", False, False),
    (3, 2, "Write Confirmed (Record IDs returned)", True, False),
    (2, 4, "broadcastAlert(examId, updateSummary)", False, False),
    (4, 3, "INSERT INTO user_notifications (targetStudents)", False, False),
    (3, 4, "Notifications Queued", True, False),
    (4, 5, "Push Notification Alert ('Exam Dates Updated')", True, False),
    (1, 0, "Display Success Toast ('Resource Published')", True, False)
]
draw_sequence_diagram("Module 8: Exam Coordinator & Resource Management", m8_participants, m8_steps, "scripts/diagrams/m8_coordinator.png", fig_height=6.5)

print("Matplotlib black-and-white sequence diagrams generated successfully.")


# ==============================================================================
# 2. REPORTLAB PROFESSIONAL BLACK & WHITE PDF GENERATION
# ==============================================================================

class NumberedCanvas(canvas.Canvas):
    """Adds formal page numbers and running header/footer in black and white."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setStrokeColor(colors.black)
        self.setLineWidth(0.6)

        # Running Header (except on page 1)
        if self._pageNumber > 1:
            self.drawString(54, 11 * inch - 36, "UDANPATH: AI Exam Roadmap Platform — Architecture Sequence Diagrams")
            self.line(54, 11 * inch - 40, 8.5 * inch - 54, 11 * inch - 40)

        # Running Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 36, page_str)
        self.drawString(54, 36, "Confidential — Minor Project Documentation (B&W Edition)")
        self.line(54, 46, 8.5 * inch - 54, 46)

        self.restoreState()


def build_pdf(filename="UdanPath_Modules_1_2_8_Sequence_Diagrams_BW.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        alignment=1, # Center
        textColor=colors.black
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        alignment=1,
        textColor=colors.black
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        alignment=1,
        textColor=colors.black
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.black,
        spaceAfter=4,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.black,
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.black,
        spaceAfter=4
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        alignment=1,
        textColor=colors.black
    )

    table_body_style = ParagraphStyle(
        'TableBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.black
    )

    story = []

    # ==========================================================================
    # COVER / HEADER
    # ==========================================================================
    story.append(Paragraph("UDANPATH: AI EXAM ROADMAP & CAREER NAVIGATOR", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("System Architecture Specification — Module Sequence Diagrams & Data Dictionaries", subtitle_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Focus Modules: Module 1 (Auth & RBAC) • Module 2 (Onboarding & Profile) • Module 8 (Coordinator & Resources)", meta_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Prepared for Academic Evaluation & Minor Project Examination | Candidate: Gauswami Ashish", subtitle_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.black, spaceAfter=10))

    # ==========================================================================
    # MODULE 1: AUTH & RBAC
    # ==========================================================================
    story.append(Paragraph("1. MODULE 1: User Authentication & Role-Based Access Control (RBAC)", h1_style))
    story.append(Paragraph(
        "<b>Description:</b> Manages secure identity verification via email/password credentials or Google OAuth2 tokens. "
        "Upon successful verification, the engine resolves the assigned role (<code>STUDENT</code>, <code>COORDINATOR</code>, or <code>ADMIN</code>) "
        "and directs the client session to the authorized portal with cryptographically signed JWT cookies.",
        body_style
    ))
    story.append(Spacer(1, 4))

    # Diagram Image
    story.append(Image("scripts/diagrams/m1_auth.png", width=6.8*inch, height=3.6*inch))
    story.append(Spacer(1, 4))

    # Message Flow Table
    story.append(Paragraph("<b>Table 1.1: Sequence Execution Steps (Module 1)</b>", h2_style))
    m1_table_data = [
        [Paragraph("Step", table_header_style), Paragraph("Source", table_header_style), Paragraph("Target", table_header_style), Paragraph("Message / Action", table_header_style), Paragraph("Type", table_header_style)],
        [Paragraph("1", table_body_style), Paragraph("User", table_body_style), Paragraph("Sign-In UI", table_body_style), Paragraph("Selects login persona & inputs credentials", table_body_style), Paragraph("Synchronous", table_body_style)],
        [Paragraph("2", table_body_style), Paragraph("Sign-In UI", table_body_style), Paragraph("Auth Engine", table_body_style), Paragraph("Calls signInWithPassword(email, password)", table_body_style), Paragraph("API Call", table_body_style)],
        [Paragraph("3", table_body_style), Paragraph("Auth Engine", table_body_style), Paragraph("Users DB", table_body_style), Paragraph("SELECT role, is_active FROM users WHERE email=?", table_body_style), Paragraph("SQL Query", table_body_style)],
        [Paragraph("4", table_body_style), Paragraph("Users DB", table_body_style), Paragraph("Auth Engine", table_body_style), Paragraph("Returns user record & assigned role", table_body_style), Paragraph("SQL Result", table_body_style)],
        [Paragraph("5", table_body_style), Paragraph("Auth Engine", table_body_style), Paragraph("Sign-In UI", table_body_style), Paragraph("Issues signed JWT session token & cookie", table_body_style), Paragraph("Auth Response", table_body_style)],
        [Paragraph("6", table_body_style), Paragraph("Sign-In UI", table_body_style), Paragraph("Route Guard", table_body_style), Paragraph("Evaluates user role against target route permissions", table_body_style), Paragraph("Client Logic", table_body_style)],
        [Paragraph("7", table_body_style), Paragraph("Route Guard", table_body_style), Paragraph("User", table_body_style), Paragraph("Routes Student to /student Dashboard | Admin to /coordinator Suite", table_body_style), Paragraph("Redirect", table_body_style)],
    ]
    t1 = Table(m1_table_data, colWidths=[0.4*inch, 1.0*inch, 1.1*inch, 3.4*inch, 0.9*inch])
    t1.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.black),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black),
        ('BACKGROUND', (0,0), (-1,0), colors.Color(0.9, 0.9, 0.9)),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t1)
    story.append(Spacer(1, 4))

    # Data Schema Table
    story.append(Paragraph("<b>Table 1.2: Relational Database Specification — <code>users</code> Table</b>", h2_style))
    db1_data = [
        [Paragraph("Column", table_header_style), Paragraph("Type", table_header_style), Paragraph("Constraint", table_header_style), Paragraph("Description", table_header_style)],
        [Paragraph("user_id", table_body_style), Paragraph("SERIAL", table_body_style), Paragraph("PRIMARY KEY", table_body_style), Paragraph("Unique sequential identifier for user account", table_body_style)],
        [Paragraph("full_name", table_body_style), Paragraph("VARCHAR(150)", table_body_style), Paragraph("NOT NULL", table_body_style), Paragraph("Legal full name of registered user", table_body_style)],
        [Paragraph("email", table_body_style), Paragraph("VARCHAR(255)", table_body_style), Paragraph("UNIQUE, NOT NULL", table_body_style), Paragraph("Unique email address utilized for credentials", table_body_style)],
        [Paragraph("auth_provider", table_body_style), Paragraph("VARCHAR(50)", table_body_style), Paragraph("DEFAULT 'EMAIL'", table_body_style), Paragraph("Authentication provider: 'EMAIL', 'GOOGLE'", table_body_style)],
        [Paragraph("role", table_body_style), Paragraph("VARCHAR(50)", table_body_style), Paragraph("DEFAULT 'STUDENT'", table_body_style), Paragraph("Assigned RBAC role: 'STUDENT', 'ADMIN', 'COORDINATOR'", table_body_style)],
    ]
    tdb1 = Table(db1_data, colWidths=[1.1*inch, 1.0*inch, 1.5*inch, 3.2*inch])
    tdb1.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.black),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black),
        ('BACKGROUND', (0,0), (-1,0), colors.Color(0.9, 0.9, 0.9)),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(tdb1)

    story.append(PageBreak())

    # ==========================================================================
    # MODULE 2: STUDENT ONBOARDING & PROFILE SETUP
    # ==========================================================================
    story.append(Paragraph("2. MODULE 2: Student Onboarding & Academic Profile Setup", h1_style))
    story.append(Paragraph(
        "<b>Description:</b> Captures multi-dimensional student background including birth date, domicile, reservation category (GENERAL/OBC/SC/ST), "
        "degree qualifications, and branch engineering streams. It validates input parameters, computes profile completeness, "
        "persists the educational schema, and triggers the reactive AI Eligibility Engine.",
        body_style
    ))
    story.append(Spacer(1, 4))

    # Diagram Image
    story.append(Image("scripts/diagrams/m2_onboarding.png", width=6.8*inch, height=4.0*inch))
    story.append(Spacer(1, 4))

    # Message Flow Table
    story.append(Paragraph("<b>Table 2.1: Sequence Execution Steps (Module 2)</b>", h2_style))
    m2_table_data = [
        [Paragraph("Step", table_header_style), Paragraph("Source", table_header_style), Paragraph("Target", table_header_style), Paragraph("Message / Action", table_header_style), Paragraph("Type", table_header_style)],
        [Paragraph("1", table_body_style), Paragraph("Student", table_body_style), Paragraph("Onboarding UI", table_body_style), Paragraph("Enters demographics (DOB, reservation category, state)", table_body_style), Paragraph("Form Input", table_body_style)],
        [Paragraph("2", table_body_style), Paragraph("Student", table_body_style), Paragraph("Onboarding UI", table_body_style), Paragraph("Enters academics (Degree: B.Tech, Branch: CE, Marks, Goal)", table_body_style), Paragraph("Form Input", table_body_style)],
        [Paragraph("3", table_body_style), Paragraph("Onboarding UI", table_body_style), Paragraph("Validator", table_body_style), Paragraph("Calls validateProfile() & calculateCompleteness()", table_body_style), Paragraph("Validation", table_body_style)],
        [Paragraph("4", table_body_style), Paragraph("Validator", table_body_style), Paragraph("Onboarding UI", table_body_style), Paragraph("Returns validation status OK (Completeness = 95%)", table_body_style), Paragraph("Status", table_body_style)],
        [Paragraph("5", table_body_style), Paragraph("Onboarding UI", table_body_style), Paragraph("Profiles DB", table_body_style), Paragraph("INSERT INTO students & education_profiles", table_body_style), Paragraph("SQL Insert", table_body_style)],
        [Paragraph("6", table_body_style), Paragraph("Profiles DB", table_body_style), Paragraph("Onboarding UI", table_body_style), Paragraph("Database confirms successful persistence", table_body_style), Paragraph("SQL Result", table_body_style)],
        [Paragraph("7", table_body_style), Paragraph("Onboarding UI", table_body_style), Paragraph("Eligibility Engine", table_body_style), Paragraph("Invokes computeMatch(Student, AllExams)", table_body_style), Paragraph("Async Call", table_body_style)],
        [Paragraph("8", table_body_style), Paragraph("Eligibility Engine", table_body_style), Paragraph("Profiles DB", table_body_style), Paragraph("SELECT criteria, age_limits, degrees FROM exams", table_body_style), Paragraph("SQL Query", table_body_style)],
        [Paragraph("9", table_body_style), Paragraph("Eligibility Engine", table_body_style), Paragraph("Onboarding UI", table_body_style), Paragraph("Returns ranked matches (e.g. GATE CS 95%, ISRO 90%)", table_body_style), Paragraph("Result", table_body_style)],
        [Paragraph("10", table_body_style), Paragraph("Onboarding UI", table_body_style), Paragraph("Student", table_body_style), Paragraph("Displays calibrated Dashboard with Eligibility Badges", table_body_style), Paragraph("Render", table_body_style)],
    ]
    t2 = Table(m2_table_data, colWidths=[0.4*inch, 1.1*inch, 1.2*inch, 3.2*inch, 0.9*inch])
    t2.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.black),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black),
        ('BACKGROUND', (0,0), (-1,0), colors.Color(0.9, 0.9, 0.9)),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(t2)
    story.append(Spacer(1, 4))

    # Data Schema Table
    story.append(Paragraph("<b>Table 2.2: Relational Database Specification — <code>students</code> & <code>education_profiles</code></b>", h2_style))
    db2_data = [
        [Paragraph("Table", table_header_style), Paragraph("Column", table_header_style), Paragraph("Type", table_header_style), Paragraph("Constraint", table_header_style), Paragraph("Description", table_header_style)],
        [Paragraph("students", table_body_style), Paragraph("student_id", table_body_style), Paragraph("INT", table_body_style), Paragraph("PK, FK (users.user_id)", table_body_style), Paragraph("1-to-1 link to user record", table_body_style)],
        [Paragraph("students", table_body_style), Paragraph("date_of_birth", table_body_style), Paragraph("DATE", table_body_style), Paragraph("NOT NULL", table_body_style), Paragraph("Used for age limit calculations", table_body_style)],
        [Paragraph("students", table_body_style), Paragraph("category", table_body_style), Paragraph("VARCHAR(30)", table_body_style), Paragraph("NOT NULL", table_body_style), Paragraph("Reservation category: GENERAL, OBC, SC, ST", table_body_style)],
        [Paragraph("education_profiles", table_body_style), Paragraph("profile_id", table_body_style), Paragraph("SERIAL", table_body_style), Paragraph("PRIMARY KEY", table_body_style), Paragraph("Unique education record ID", table_body_style)],
        [Paragraph("education_profiles", table_body_style), Paragraph("degree", table_body_style), Paragraph("VARCHAR(100)", table_body_style), Paragraph("NOT NULL", table_body_style), Paragraph("Qualification: B.Tech, B.Sc, Diploma", table_body_style)],
        [Paragraph("education_profiles", table_body_style), Paragraph("branch", table_body_style), Paragraph("VARCHAR(150)", table_body_style), Paragraph("NOT NULL", table_body_style), Paragraph("Specialization: Computer Engineering", table_body_style)],
        [Paragraph("education_profiles", table_body_style), Paragraph("percentage", table_body_style), Paragraph("DECIMAL(5,2)", table_body_style), Paragraph("NOT NULL", table_body_style), Paragraph("Marks / Aggregate percentage score", table_body_style)],
    ]
    tdb2 = Table(db2_data, colWidths=[1.1*inch, 1.1*inch, 0.9*inch, 1.5*inch, 2.2*inch])
    tdb2.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.black),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black),
        ('BACKGROUND', (0,0), (-1,0), colors.Color(0.9, 0.9, 0.9)),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(tdb2)

    story.append(PageBreak())

    # ==========================================================================
    # MODULE 8: EXAM COORDINATOR & RESOURCE MANAGEMENT
    # ==========================================================================
    story.append(Paragraph("3. MODULE 8: Exam Coordinator / Admin Resource & Syllabus Management", h1_style))
    story.append(Paragraph(
        "<b>Description:</b> Authorizes administrative coordinators to publish authoritative national exam calendar dates, "
        "structure topic-level syllabi hierarchies, curate certified courses, and upload official question papers. "
        "Upon successful publication, an asynchronous broadcast pipeline inserts high-priority notification records for all bookmarked students.",
        body_style
    ))
    story.append(Spacer(1, 4))

    # Diagram Image
    story.append(Image("scripts/diagrams/m8_coordinator.png", width=6.8*inch, height=3.9*inch))
    story.append(Spacer(1, 4))

    # Message Flow Table
    story.append(Paragraph("<b>Table 8.1: Sequence Execution Steps (Module 8)</b>", h2_style))
    m8_table_data = [
        [Paragraph("Step", table_header_style), Paragraph("Source", table_header_style), Paragraph("Target", table_header_style), Paragraph("Message / Action", table_header_style), Paragraph("Type", table_header_style)],
        [Paragraph("1", table_body_style), Paragraph("Coordinator", table_body_style), Paragraph("Portal UI", table_body_style), Paragraph("Enters revised exam schedule / official notification", table_body_style), Paragraph("User Input", table_body_style)],
        [Paragraph("2", table_body_style), Paragraph("Portal UI", table_body_style), Paragraph("Coord Service", table_body_style), Paragraph("Calls saveCoordinatorResources(resourceData)", table_body_style), Paragraph("Service Call", table_body_style)],
        [Paragraph("3", table_body_style), Paragraph("Coord Service", table_body_style), Paragraph("Master DB", table_body_style), Paragraph("UPSERT INTO exams, resources, exam_milestones", table_body_style), Paragraph("SQL Transaction", table_body_style)],
        [Paragraph("4", table_body_style), Paragraph("Master DB", table_body_style), Paragraph("Coord Service", table_body_style), Paragraph("Returns database commit confirmation & record ID", table_body_style), Paragraph("SQL Result", table_body_style)],
        [Paragraph("5", table_body_style), Paragraph("Coord Service", table_body_style), Paragraph("Notif Service", table_body_style), Paragraph("Calls broadcastAlert(examId, dateSummary)", table_body_style), Paragraph("Async Event", table_body_style)],
        [Paragraph("6", table_body_style), Paragraph("Notif Service", table_body_style), Paragraph("Master DB", table_body_style), Paragraph("INSERT INTO user_notifications for bookmarked students", table_body_style), Paragraph("Batch Insert", table_body_style)],
        [Paragraph("7", table_body_style), Paragraph("Master DB", table_body_style), Paragraph("Notif Service", table_body_style), Paragraph("Notification batch successfully queued", table_body_style), Paragraph("Status", table_body_style)],
        [Paragraph("8", table_body_style), Paragraph("Notif Service", table_body_style), Paragraph("Student", table_body_style), Paragraph("Student portal receives Live Bell Alert ('📅 Dates Updated')", table_body_style), Paragraph("Push / Polling", table_body_style)],
        [Paragraph("9", table_body_style), Paragraph("Portal UI", table_body_style), Paragraph("Coordinator", table_body_style), Paragraph("Displays Success Toast ('Resource Published Live')", table_body_style), Paragraph("UI Feedback", table_body_style)],
    ]
    t8 = Table(m8_table_data, colWidths=[0.4*inch, 1.1*inch, 1.2*inch, 3.2*inch, 0.9*inch])
    t8.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.black),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black),
        ('BACKGROUND', (0,0), (-1,0), colors.Color(0.9, 0.9, 0.9)),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(t8)
    story.append(Spacer(1, 4))

    # Data Schema Table
    story.append(Paragraph("<b>Table 8.2: Relational Database Specification — <code>exams</code>, <code>resources</code> & <code>notifications</code></b>", h2_style))
    db8_data = [
        [Paragraph("Table", table_header_style), Paragraph("Column", table_header_style), Paragraph("Type", table_header_style), Paragraph("Constraint", table_header_style), Paragraph("Description", table_header_style)],
        [Paragraph("exams", table_body_style), Paragraph("exam_id", table_body_style), Paragraph("SERIAL", table_body_style), Paragraph("PRIMARY KEY", table_body_style), Paragraph("Master catalog exam identifier", table_body_style)],
        [Paragraph("exams", table_body_style), Paragraph("code", table_body_style), Paragraph("VARCHAR(50)", table_body_style), Paragraph("UNIQUE, NOT NULL", table_body_style), Paragraph("Exam short code: GATE-CS, UPSC-CSE", table_body_style)],
        [Paragraph("exams", table_body_style), Paragraph("status", table_body_style), Paragraph("VARCHAR(50)", table_body_style), Paragraph("DEFAULT 'UPCOMING'", table_body_style), Paragraph("Exam lifecycle status: UPCOMING, OPEN, CLOSED", table_body_style)],
        [Paragraph("resources", table_body_style), Paragraph("resource_id", table_body_style), Paragraph("SERIAL", table_body_style), Paragraph("PRIMARY KEY", table_body_style), Paragraph("Curated coaching/course resource identifier", table_body_style)],
        [Paragraph("resources", table_body_style), Paragraph("type", table_body_style), Paragraph("VARCHAR(50)", table_body_style), Paragraph("NOT NULL", table_body_style), Paragraph("Category: ONLINE_COURSE, PYQ_PAPER", table_body_style)],
        [Paragraph("notifications", table_body_style), Paragraph("notif_id", table_body_style), Paragraph("SERIAL", table_body_style), Paragraph("PRIMARY KEY", table_body_style), Paragraph("Personalized user notification alert", table_body_style)],
        [Paragraph("notifications", table_body_style), Paragraph("student_id", table_body_style), Paragraph("INT", table_body_style), Paragraph("FK (students.student_id)", table_body_style), Paragraph("Recipient student identifier", table_body_style)],
    ]
    tdb8 = Table(db8_data, colWidths=[1.1*inch, 1.1*inch, 0.9*inch, 1.5*inch, 2.2*inch])
    tdb8.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.black),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black),
        ('BACKGROUND', (0,0), (-1,0), colors.Color(0.9, 0.9, 0.9)),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
    ]))
    story.append(tdb8)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Publication-grade Black & White PDF built successfully at: {filename}")

if __name__ == "__main__":
    build_pdf()
