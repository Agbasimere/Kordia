import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# --- Numbered Canvas for Dynamic Page Numbers & Running Header/Footer ---
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#5B6472"))

        # Top running header (pages 2+)
        if self._pageNumber > 1:
            self.drawString(36, 11 * 72 - 26, "KORDIA - COMPREHENSIVE USER TESTING GUIDE")
            self.drawRightString(8.5 * 72 - 36, 11 * 72 - 26, "END-TO-END VERIFICATION MANUAL v1.0")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.75)
            self.line(36, 11 * 72 - 30, 8.5 * 72 - 36, 11 * 72 - 30)

        # Bottom running footer (all pages)
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.75)
        self.line(36, 30, 8.5 * 72 - 36, 30)
        
        self.setFont("Helvetica", 8)
        self.drawString(36, 18, "Kordia Protocol - Confidential - Two-Party Peer Escrow & Settlement Verification")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * 72 - 36, 18, page_str)
        self.restoreState()


def generate_testing_guide_pdf(filename="Kordia_User_Testing_Guide.pdf"):
    # Page setup: Letter (8.5 x 11 inches), 36 pt (0.5 inch) margins
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Brand Colors
    PRIMARY = colors.HexColor("#0055FF")
    DARK = colors.HexColor("#101828")
    MUTED = colors.HexColor("#5B6472")
    LIGHT_BG = colors.HexColor("#FAF8FF")
    CARD_BG = colors.HexColor("#F3F5FF")
    GREEN = colors.HexColor("#10B981")
    BORDER = colors.HexColor("#E2E8F0")
    AMBER = colors.HexColor("#D97706")
    WHITE = colors.white

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=DARK,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=DARK
    )

    body_bold = ParagraphStyle(
        'Body_Bold_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=DARK
    )

    body_muted = ParagraphStyle(
        'Body_Muted_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=MUTED
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10.5,
        textColor=DARK
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=WHITE
    )

    story = []

    # =========================================================================
    # PAGE 1: COVER HEADER, SYSTEM SETUP & SEED TEST ACCOUNTS
    # =========================================================================
    banner_data = [
        [
            Paragraph("<b>KORDIA</b>", ParagraphStyle('BTitle', fontName='Helvetica-Bold', fontSize=26, textColor=WHITE, leading=28)),
            Paragraph("<b>END-TO-END VERIFICATION MANUAL</b><br/><font size=8.5 color='#93C5FD'>Version 1.0 - November 2026</font>", ParagraphStyle('BSub', fontName='Helvetica', fontSize=10, textColor=WHITE, leading=13, alignment=2))
        ],
        [
            Paragraph("<font size=8.5 color='#E2E8F0'><b>Product:</b> Private Peer Escrow & Cross-Border Settlement Platform<br/><b>Rails:</b> Zcash Orchard Shielded Pool (Testnet) + Pollar Banking Rails (NGN)<br/><b>Backend:</b> Supabase PostgreSQL Real-Time Sync & Row-Level Security</font>", ParagraphStyle('BDesc', fontName='Helvetica', fontSize=8.5, textColor=WHITE, leading=12)),
            Paragraph("<font size=8 color='#93C5FD'><b>Target URL:</b> http://localhost:5175<br/><b>Admin Route:</b> /admin<br/><b>User Seed Pass:</b> Password123!<br/><b>Admin Master Key:</b> AdminSecure2026!</font>", ParagraphStyle('BParams', fontName='Helvetica', fontSize=8, textColor=WHITE, leading=11, alignment=2))
        ]
    ]
    banner_table = Table(banner_data, colWidths=[330, 210])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), DARK),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LINEBELOW', (0,0), (-1,0), 1, colors.HexColor('#1E293B')),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("1. Executive Summary & Verification Purpose", h1_style))
    story.append(Paragraph(
        "This manual provides step-by-step test scenarios to validate all user workflows, peer consensus mechanisms, "
        "cryptographic escrow funding, deliverable inspection, Pollar bank off-ramping, Supabase synchronization, and the "
        "dedicated corporate Node Admin console in <b>Kordia</b>. Each test case provides exact click paths, inputs, expected visual results, "
        "and pass/fail verification points.",
        body_style
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("2. Target Test Environment Configuration", h1_style))
    env_data = [
        [
            Paragraph("<b>Local Dev Server URL</b>", body_bold),
            Paragraph("<code>http://localhost:5175</code> (Vite React Client)", code_style),
            Paragraph("<b>Status:</b> Live & Operational", body_muted)
        ],
        [
            Paragraph("<b>Supabase Database</b>", body_bold),
            Paragraph("<code>https://xwkrmruirfvkmedhcwpf.supabase.co</code>", code_style),
            Paragraph("<b>Status:</b> Connected & Authenticated", body_muted)
        ],
        [
            Paragraph("<b>Zcash Testnet Rail</b>", body_bold),
            Paragraph("NU5 Orchard Shielded Pool (Testnet)", code_style),
            Paragraph("<b>Status:</b> Simulated with live explorer links", body_muted)
        ],
        [
            Paragraph("<b>Pollar Liquidity Rail</b>", body_bold),
            Paragraph("Guaranty Trust Bank (GTBank) Direct Clearing", code_style),
            Paragraph("<b>Status:</b> Active FX peg (NGN 1,500 = $1 USD)", body_muted)
        ]
    ]
    env_table = Table(env_data, colWidths=[130, 240, 170])
    env_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(env_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("3. Pre-Configured Seed Test Accounts Reference", h1_style))
    story.append(Paragraph("Use these pre-seeded accounts to execute tests across counterparties without manual setup:", body_style))
    story.append(Spacer(1, 6))

    seed_data = [
        [
            Paragraph("<b>Role Persona</b>", table_header_style),
            Paragraph("<b>Unique User Tag</b>", table_header_style),
            Paragraph("<b>Login Email</b>", table_header_style),
            Paragraph("<b>Password</b>", table_header_style),
            Paragraph("<b>Persona Identity & Banking Details</b>", table_header_style)
        ],
        [
            Paragraph("<b>Hirer (Client)</b>", body_bold),
            Paragraph("<font color='#0055FF'><b>@davidvance</b></font>", body_style),
            Paragraph("david@apexdesign.co.uk", code_style),
            Paragraph("<code>Password123!</code>", code_style),
            Paragraph("David Vance - Apex Design Studio Ltd - London, UK", body_muted)
        ],
        [
            Paragraph("<b>Talent (Freelancer)</b>", body_bold),
            Paragraph("<font color='#0055FF'><b>@amaraokafor</b></font>", body_style),
            Paragraph("amara.okafor@devhub.ng", code_style),
            Paragraph("<code>Password123!</code>", code_style),
            Paragraph("Amara Okafor - GTBank: 0149928371 - Lagos, Nigeria", body_muted)
        ],
        [
            Paragraph("<b>Node Admin</b>", body_bold),
            Paragraph("<font color='#0055FF'><b>@admin</b></font>", body_style),
            Paragraph("admin@kordia.work", code_style),
            Paragraph("<code>AdminSecure2026!</code>", code_style),
            Paragraph("Kordia Protocol Master Admin - Dedicated /admin route", body_muted)
        ]
    ]
    seed_table = Table(seed_data, colWidths=[85, 80, 125, 95, 155])
    seed_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, CARD_BG])
    ]))
    story.append(seed_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("4. Quick 5-Minute Hackathon Demonstration Script", h1_style))
    story.append(Paragraph(
        "For a fast demonstration of the entire system, execute this 6-step speedrun:<br/>"
        "1. <b>Login as Hirer:</b> Open <code>http://localhost:5175</code>, click 'Hirer (@davidvance)'.<br/>"
        "2. <b>Create Agreement:</b> Click 'New Agreement', click 'Auto-Fill Demo Scenario ($500)', then 'Create & Initialize'.<br/>"
        "3. <b>Fund Escrow:</b> Observe Zcash Orchard Shielded commitment with 12.50 ZEC deposit.<br/>"
        "4. <b>Talent Submission:</b> Switch to Amara Okafor, open agreement, submit live Vercel URL & GitHub repo.<br/>"
        "5. <b>Hirer Approval:</b> Switch back to David Vance, inspect sandbox preview, verify criteria, click 'Approve & Release'.<br/>"
        "6. <b>Pollar Settlement:</b> Disburses NGN 836,048.75 directly to Amara's GTBank account in Lagos.",
        body_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: PHASE 1 (AUTH & TAGS) & PHASE 2 (AGREEMENT CREATION)
    # =========================================================================
    story.append(Paragraph("5. Phase 1: Authentication, Registration & User Tag System", h1_style))
    story.append(Paragraph(
        "Kordia enforces a verified unique tag model (@username) required for calling and tagging counterparties into legal escrow contracts.",
        body_style
    ))
    story.append(Spacer(1, 6))

    test_phase1 = [
        [
            Paragraph("<b>Test Case ID & Title</b>", table_header_style),
            Paragraph("<b>Step-by-Step Action</b>", table_header_style),
            Paragraph("<b>Expected Visual Result & Verification</b>", table_header_style),
            Paragraph("<b>Result</b>", table_header_style)
        ],
        [
            Paragraph("<b>TC-1.1</b><br/>1-Click Hirer Login", body_bold),
            Paragraph("1. Open <code>http://localhost:5175</code>.<br/>2. If logged in, click 'Sign Out' in sidebar.<br/>3. On Auth Page, click <b>'Hirer (Client)'</b> 1-click card.<br/>4. Click <b>'Sign In as David Vance'</b>.", body_style),
            Paragraph("- Screen transitions to Hirer Workspace.<br/>- Header displays <b>David Vance</b> with blue tag <b>@davidvance</b>.<br/>- Green badge confirms 'Verified Tag Active'.<br/>- Left sidebar navigation displays Kordia branding.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-1.2</b><br/>1-Click Talent Login", body_bold),
            Paragraph("1. Click 'Sign Out' in bottom left sidebar.<br/>2. On Auth Page, click <b>'Talent (Freelancer)'</b> card.<br/>3. Click <b>'Sign In as Amara Okafor'</b>.", body_style),
            Paragraph("- Screen transitions to Talent Workspace.<br/>- Header displays <b>Amara Okafor</b> with tag <b>@amaraokafor</b>.<br/>- Verified badge shows active email status.<br/>- Milestone submission options are enabled.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-1.3</b><br/>New Account & Dynamic Tag", body_bold),
            Paragraph("1. Sign Out to Auth Page.<br/>2. Click <b>'Create Account'</b> tab.<br/>3. Select Role: Hirer or Talent.<br/>4. Enter Full Name: <i>Chidi Nwosu</i>.<br/>5. Notice auto-suggested tag: <code>@chidinwosu</code>.<br/>6. Enter Email & Password, then click <b>'Create Account'</b>.", body_style),
            Paragraph("- Green toast: <i>'Account Created: Welcome to Kordia! Tag @chidinwosu active.'</i><br/>- User logged into workspace.<br/>- Tag persists to Supabase `profiles` table.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-1.4</b><br/>Email Verification Gating", body_bold),
            Paragraph("1. For any new account, check top header.<br/>2. If pending, amber button displays <b>'Verify Email for Unique Tag'</b>.<br/>3. Click the verify button.", body_style),
            Paragraph("- Status updates to green <b>'Verified Tag Active'</b>.<br/>- User can now be tagged in escrow agreements.<br/>- Profile status updates in Supabase backend.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ]
    ]
    t1 = Table(test_phase1, colWidths=[90, 195, 205, 50])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), DARK),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, CARD_BG])
    ]))
    story.append(t1)
    story.append(Spacer(1, 10))

    story.append(Paragraph("6. Phase 2: Escrow Agreement Creation & Counterparty Tagging", h1_style))
    story.append(Paragraph(
        "Validate how a Hirer tags a verified Talent into an agreement, specifies deliverable milestones, and calculates Naira payouts.",
        body_style
    ))
    story.append(Spacer(1, 6))

    test_phase2 = [
        [
            Paragraph("<b>Test Case ID & Title</b>", table_header_style),
            Paragraph("<b>Step-by-Step Action</b>", table_header_style),
            Paragraph("<b>Expected Visual Result & Verification</b>", table_header_style),
            Paragraph("<b>Result</b>", table_header_style)
        ],
        [
            Paragraph("<b>TC-2.1</b><br/>Launch Agreement Form", body_bold),
            Paragraph("1. Sign in as Hirer (<b>@davidvance</b>).<br/>2. In left sidebar, click <b>'New Agreement'</b> (or click '+ New Agreement' on Dashboard).", body_style),
            Paragraph("- Form opens with Corporate Multi-Section layout.<br/>- Hirer tag <code>@davidvance</code> locked as Creator/Client.<br/>- Live contract preview card renders on the right.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-2.2</b><br/>Tag Counterparty (@amaraokafor)", body_bold),
            Paragraph("1. Locate 'Counterparty Tag' input.<br/>2. Type <code>@amaraokafor</code>.<br/>3. Observe auto-resolution card.", body_style),
            Paragraph("- Green badge confirms <b>'@amaraokafor - Amara Okafor (Verified)'</b>.<br/>- Destination payout resolves to GTBank NGN.<br/>- Shielded Zcash unified address loads.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-2.3</b><br/>Milestones & FX Calculations", body_bold),
            Paragraph("1. Enter Milestone Title: <i>E-Commerce Storefront</i>.<br/>2. Enter Deliverable Amount: <code>500.00</code> USD.<br/>3. Set Deadline date.<br/>4. Check the Naira conversion widget.", body_style),
            Paragraph("- Auto-calculates: <b>~12.50 ZEC</b> (~$40/ZEC).<br/>- Auto-calculates: <b>NGN 750,000</b> (at NGN 1,500/USD).<br/>- Live Agreement Preview card updates synchronously.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-2.4</b><br/>Auto-Fill Demo & Submit", body_bold),
            Paragraph("1. Click <b>'Auto-Fill Demo Scenario ($500)'</b> button at top of form.<br/>2. Click <b>'Create & Initialize Agreement'</b>.", body_style),
            Paragraph("- Success toast: <i>'Agreement Created Successfully'</i>.<br/>- Redirects to Agreement Details view.<br/>- Agreement status displays as <b>'Submitted / Active'</b>.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ]
    ]
    t2 = Table(test_phase2, colWidths=[90, 195, 205, 50])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), DARK),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, CARD_BG])
    ]))
    story.append(t2)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: PHASE 3 (6-STAGE LIFECYCLE) & PHASE 4 (DELIVERABLE INSPECTION)
    # =========================================================================
    story.append(Paragraph("7. Phase 3: The 6-Stage Escrow Lifecycle Progression", h1_style))
    story.append(Paragraph(
        "Kordia agreements progress through 6 cryptographic and legal milestones from creation to Nigerian bank payout:",
        body_style
    ))
    story.append(Spacer(1, 6))

    lifecycle_data = [
        [
            Paragraph("<b>Stage</b>", table_header_style),
            Paragraph("<b>Lifecycle State</b>", table_header_style),
            Paragraph("<b>Triggering Party & Action</b>", table_header_style),
            Paragraph("<b>System & Cryptographic Transition</b>", table_header_style),
            Paragraph("<b>Verification Point</b>", table_header_style)
        ],
        [
            Paragraph("<b>Stage 1</b>", body_bold),
            Paragraph("<font color='#0055FF'><b>Created</b></font>", body_bold),
            Paragraph("Hirer drafts scope and tags counterparty.", body_style),
            Paragraph("Agreement record created with unique ID (e.g., KRD-2026-9042).", body_style),
            Paragraph("Shows on Hirer & Talent dashboards.", body_muted)
        ],
        [
            Paragraph("<b>Stage 2</b>", body_bold),
            Paragraph("<font color='#0055FF'><b>Accepted</b></font>", body_bold),
            Paragraph("Talent signs terms of work.", body_style),
            Paragraph("Talent digital signature recorded with timestamp.", body_style),
            Paragraph("Stepper advances to 'Accepted'.", body_muted)
        ],
        [
            Paragraph("<b>Stage 3</b>", body_bold),
            Paragraph("<font color='#10B981'><b>Funded</b></font>", body_bold),
            Paragraph("Hirer commits 12.50 ZEC to Shielded Orchard Pool.", body_style),
            Paragraph("Cryptographic tx hash generated; funds locked in privacy pool.", body_style),
            Paragraph("Escrow badge shows 'Funded & Locked'.", body_muted)
        ],
        [
            Paragraph("<b>Stage 4</b>", body_bold),
            Paragraph("<font color='#D97706'><b>Submitted</b></font>", body_bold),
            Paragraph("Talent submits production URL & test logs.", body_style),
            Paragraph("Deliverable URLs & GitHub repo committed to contract.", body_style),
            Paragraph("Hirer notified for review & inspection.", body_muted)
        ],
        [
            Paragraph("<b>Stage 5</b>", body_bold),
            Paragraph("<font color='#10B981'><b>Approved</b></font>", body_bold),
            Paragraph("Hirer inspects deliverable and clicks 'Approve & Release'.", body_style),
            Paragraph("Escrow lock unlocked; settlement triggered.", body_style),
            Paragraph("Agreement status updates to 'Released'.", body_muted)
        ],
        [
            Paragraph("<b>Stage 6</b>", body_bold),
            Paragraph("<font color='#10B981'><b>Settled</b></font>", body_bold),
            Paragraph("Pollar rails disburse Naira to GTBank.", body_style),
            Paragraph("NGN 836,048.75 credited to account 0149928371.", body_style),
            Paragraph("Payout status: PAYOUT_COMPLETED.", body_muted)
        ]
    ]
    t3 = Table(lifecycle_data, colWidths=[55, 65, 125, 155, 140])
    t3.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, CARD_BG])
    ]))
    story.append(t3)
    story.append(Spacer(1, 10))

    story.append(Paragraph("8. Phase 4: Deliverable Inspection & Acceptance Checklist", h1_style))
    story.append(Paragraph(
        "Validate how Hirers inspect deliverables in a live preview frame and verify technical acceptance criteria before releasing funds:",
        body_style
    ))
    story.append(Spacer(1, 6))

    test_phase4 = [
        [
            Paragraph("<b>Test Case ID & Title</b>", table_header_style),
            Paragraph("<b>Step-by-Step Action</b>", table_header_style),
            Paragraph("<b>Expected Visual Result & Verification</b>", table_header_style),
            Paragraph("<b>Result</b>", table_header_style)
        ],
        [
            Paragraph("<b>TC-4.1</b><br/>Talent Work Submission", body_bold),
            Paragraph("1. Switch role to <b>Talent (@amaraokafor)</b>.<br/>2. Open Agreement KRD-2026-9042.<br/>3. Navigate to <b>'Submit Work'</b> view.<br/>4. Enter Live Vercel Preview URL: <code>https://apex-store-staging.vercel.app</code>.<br/>5. Enter Repo: <code>github.com/amara-okafor/apex-commerce</code>.<br/>6. Enter Submission Notes.<br/>7. Click <b>'Submit Deliverables for Review'</b>.", body_style),
            Paragraph("- Milestone status advances to <b>'Submitted'</b>.<br/>- Activity log records submission with timestamp.<br/>- Deliverable links become active for the Hirer.<br/>- Notification badge triggers on Hirer dashboard.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-4.2</b><br/>Live Sandbox Inspection", body_bold),
            Paragraph("1. Switch role to <b>Hirer (@davidvance)</b>.<br/>2. Open Agreement details and click <b>'Review Work'</b>.<br/>3. Observe the embedded staging preview card.<br/>4. Click 'Open in New Tab' external link.", body_style),
            Paragraph("- Interactive preview frame renders preview container.<br/>- External preview links direct to verified staging deployment.<br/>- Deliverable PDF attachments and test logs are downloadable.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-4.3</b><br/>Acceptance Checklist", body_bold),
            Paragraph("1. In Review screen, locate Acceptance Criteria.<br/>2. Check: <i>'Responsive across mobile, tablet, desktop'</i>.<br/>3. Check: <i>'All automated test suites passing'</i>.<br/>4. Check: <i>'Lighthouse performance audit > 95'</i>.<br/>5. Notice 'Approve & Release' button enables.", body_style),
            Paragraph("- Checkboxes toggle with visual confirmation.<br/>- 'Approve & Release' button lights up blue once criteria are validated.<br/>- Prevents accidental release before inspection.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-4.4</b><br/>Hirer Approval & Release", body_bold),
            Paragraph("1. Click <b>'Approve & Release Escrow'</b>.<br/>2. Confirm approval in confirmation prompt.", body_style),
            Paragraph("- Escrow funds released from Shielded pool.<br/>- Agreement status changes to <b>'Released'</b>.<br/>- Pollar payment settlement pipeline automatically triggers.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ]
    ]
    t4 = Table(test_phase4, colWidths=[90, 195, 205, 50])
    t4.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), DARK),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, CARD_BG])
    ]))
    story.append(t4)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: PHASE 5 (BLOCKCHAIN RAILS) & PHASE 6 PART 1 (ADMIN CONSOLE)
    # =========================================================================
    story.append(Paragraph("9. Phase 5: Dual Blockchain Rails & Pollar Settlement Verification", h1_style))
    story.append(Paragraph(
        "Kordia integrates two complementary blockchain and settlement layers: Zcash Orchard for cryptographic privacy, and Pollar for local fiat clearing.",
        body_style
    ))
    story.append(Spacer(1, 6))

    test_phase5 = [
        [
            Paragraph("<b>Test Case ID & Title</b>", table_header_style),
            Paragraph("<b>Step-by-Step Action</b>", table_header_style),
            Paragraph("<b>Expected Visual Result & Verification</b>", table_header_style),
            Paragraph("<b>Result</b>", table_header_style)
        ],
        [
            Paragraph("<b>TC-5.1</b><br/>Zcash Shielded Pool", body_bold),
            Paragraph("1. In sidebar, click <b>'Privacy & Orchard'</b>.<br/>2. Inspect Shielded Escrow Vault container.<br/>3. Check pool state: <i>Zcash Orchard Pool</i>.<br/>4. Observe encrypted memo and transaction hash.<br/>5. Click 'View Testnet Explorer' link.", body_style),
            Paragraph("- Sender, recipient, and amount are mathematically hidden via zero-knowledge proofs.<br/>- Testnet link targets Zcash testnet block explorer.<br/>- Faucet link accessible for live testnet funding.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-5.2</b><br/>Auditor Viewing Key Tool", body_bold),
            Paragraph("1. In Privacy view, test the <b>Viewing Key Tool</b>.<br/>2. Toggle between 'Public Ledger View' and 'Viewing Key Decrypted View'.", body_style),
            Paragraph("- Public ledger shows zero metadata (100% confidential).<br/>- Viewing key view demonstrates selective regulatory disclosure for tax/compliance auditors.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-5.3</b><br/>Pollar FX Calculator", body_bold),
            Paragraph("1. Click <b>'Payment & Pollar'</b> in sidebar.<br/>2. Locate the real-time FX calculator.<br/>3. Switch currencies: USD to NGN, KES, GHS.<br/>4. Observe rate updates: NGN 1,500.00 / USD.", body_style),
            Paragraph("- Displays Indicative Quote vs Guaranteed 15-Minute Executable Quote.<br/>- Correctly calculates local payout without hidden charges.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-5.4</b><br/>Pollar Direct Clearing (GTBank)", body_bold),
            Paragraph("1. Click <b>'Execute Pollar Settlement'</b>.<br/>2. Observe the 4-stage pipeline animation: <i>Quote Locked -> Pool Swap -> NIP Route -> Settled</i>.", body_style),
            Paragraph("- Status updates to <b>PAYOUT_COMPLETED</b>.<br/>- Beneficiary: <b>Amara Okafor</b>, GTBank Account <code>0149928371</code>.<br/>- Pollar transaction reference generated: <code>POL-NG-8840</code>.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ]
    ]
    t5 = Table(test_phase5, colWidths=[90, 195, 205, 50])
    t5.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), DARK),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, CARD_BG])
    ]))
    story.append(t5)
    story.append(Spacer(1, 10))

    story.append(Paragraph("10. Phase 6 (Part 1): Node Admin Security Gate & Overview Tab", h1_style))
    story.append(Paragraph(
        "Validate the isolated, password-gated Admin Console (/admin) featuring the corporate sidebar layout matching Escrowry Admin specifications.",
        body_style
    ))
    story.append(Spacer(1, 6))

    test_phase6_p1 = [
        [
            Paragraph("<b>Test Case ID & Title</b>", table_header_style),
            Paragraph("<b>Step-by-Step Action</b>", table_header_style),
            Paragraph("<b>Expected Visual Result & Verification</b>", table_header_style),
            Paragraph("<b>Result</b>", table_header_style)
        ],
        [
            Paragraph("<b>TC-6.1</b><br/>Admin Security Password Gate", body_bold),
            Paragraph("1. Navigate to <code>http://localhost:5175/#/admin</code> (or click 'Admin Portal' in sidebar).<br/>2. Observe Master Security Key screen.<br/>3. Click <b>'Autofill Seed Admin Pass'</b>.<br/>4. Click <b>'Unlock Admin Console'</b>.", body_style),
            Paragraph("- Password field fills: <code>AdminSecure2026!</code>.<br/>- Screen transitions to full two-column corporate layout.<br/>- Left sidebar displays Kordia Admin brand and 5 navigation tabs.<br/>- Console state saved in session storage.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-6.2</b><br/>Overview Tab & Sparkline Chart", body_bold),
            Paragraph("1. In Admin sidebar, click <b>'Overview'</b>.<br/>2. Inspect Two-Column Analytics card.<br/>3. Inspect SVG Sparkline Mountain Peak Chart.<br/>4. Check right panel: Profit ($118), Escrow held.<br/>5. Check Supabase Live Sync banner.", body_style),
            Paragraph("- Exact corporate layout renders with peak chart.<br/>- Clicking 'View' on Escrow held automatically jumps to Orders tab.<br/>- Supabase card shows 'Live Database Active' with Verify DB button.<br/>- 4 KPI metric cards display platform volume.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ]
    ]
    t6_1 = Table(test_phase6_p1, colWidths=[90, 195, 205, 50])
    t6_1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), DARK),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, CARD_BG])
    ]))
    story.append(t6_1)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: PHASE 6 PART 2 (ADMIN ORDERS, USERS, PAYOUTS, AUDIT) & PHASE 7 (DB)
    # =========================================================================
    story.append(Paragraph("11. Phase 6 (Part 2): Admin Orders, Users, Payouts & Audit Trail", h1_style))
    story.append(Paragraph(
        "Validate contract inspection, 1-click user verification management, and the cryptographic audit log stream:",
        body_style
    ))
    story.append(Spacer(1, 6))

    test_phase6_p2 = [
        [
            Paragraph("<b>Test Case ID & Title</b>", table_header_style),
            Paragraph("<b>Step-by-Step Action</b>", table_header_style),
            Paragraph("<b>Expected Visual Result & Verification</b>", table_header_style),
            Paragraph("<b>Result</b>", table_header_style)
        ],
        [
            Paragraph("<b>TC-6.3</b><br/>Orders Tab & In-Page Modal", body_bold),
            Paragraph("1. Click <b>'Orders'</b> in Admin sidebar.<br/>2. Test filter tabs: <b>All</b>, <b>Active</b>, <b>Settled</b>.<br/>3. Type <code>Apex</code> in search box.<br/>4. Click <b>'Inspect Order'</b> on contract.<br/>5. Close inspector with 'X'.", body_style),
            Paragraph("- Instant filtering by status and search keyword.<br/>- In-page modal opens showing tagged Hirer/Talent, deliverables, Vercel/GitHub links, and Zcash pool memo.<br/>- 'Admin Release' button available for submitted contracts.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-6.4</b><br/>Users Tab & 1-Click Verification", body_bold),
            Paragraph("1. Click <b>'Users'</b> in Admin sidebar.<br/>2. Type <code>@davidvance</code> in search.<br/>3. Click <b>'Revoke Verification'</b> on user.<br/>4. Click <b>'Verify Account'</b> to re-enable.<br/>5. Refresh page.", body_style),
            Paragraph("- Badge toggles from 'Email Verified' to 'Pending Verification'.<br/>- Change immediately persists to Supabase backend.<br/>- User tag permissions update synchronously.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-6.5</b><br/>Payouts Tab (Pollar Rails)", body_bold),
            Paragraph("1. Click <b>'Payouts'</b> in Admin sidebar.<br/>2. Inspect FX Rate indicators (NGN 1,500/USD, $40/ZEC).<br/>3. Inspect Pollar clearing queue table.<br/>4. Click 'Execute Pollar Payout' if pending.", body_style),
            Paragraph("- Displays GTBank beneficiary details, account number, NGN amount.<br/>- Status indicates 'Settled to GTBank' upon completion.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-6.6</b><br/>Audit Tab & Actor Filtering", body_bold),
            Paragraph("1. Click <b>'Audit'</b> in Admin sidebar.<br/>2. Filter logs by actor: <code>@davidvance</code>, <code>@amaraokafor</code>, <code>@admin</code>, <code>POLLAR_CORE</code>.", body_style),
            Paragraph("- Filter instantly isolates events performed by chosen actor.<br/>- Timestamped chronological ledger provides full auditability.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-6.7</b><br/>Lock Console & Exit", body_bold),
            Paragraph("1. In header or sidebar footer, click <b>'Lock console'</b>.<br/>2. Verify console locks back to password gate.<br/>3. Unlock again, then click <b>'Exit Admin to Workspaces'</b>.", body_style),
            Paragraph("- Locks security gate securely.<br/>- Exit returns user seamlessly to Hirer/Talent workspaces.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ]
    ]
    t6_2 = Table(test_phase6_p2, colWidths=[90, 195, 205, 50])
    t6_2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), DARK),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, CARD_BG])
    ]))
    story.append(t6_2)
    story.append(Spacer(1, 10))

    story.append(Paragraph("12. Phase 7: Supabase Database Synchronization Testing", h1_style))
    story.append(Paragraph(
        "Validate how Kordia communicates with the live Supabase PostgreSQL database:",
        body_style
    ))
    story.append(Spacer(1, 6))

    test_phase7 = [
        [
            Paragraph("<b>Test Case ID & Title</b>", table_header_style),
            Paragraph("<b>Step-by-Step Action</b>", table_header_style),
            Paragraph("<b>Expected Visual Result & Verification</b>", table_header_style),
            Paragraph("<b>Result</b>", table_header_style)
        ],
        [
            Paragraph("<b>TC-7.1</b><br/>Database Status Probe", body_bold),
            Paragraph("1. In Admin Console top header or Supabase card, click <b>'Verify DB'</b>.", body_style),
            Paragraph("- Spin animation confirms live REST probe.<br/>- Badge displays green <b>'Live Database Active'</b>.<br/>- Confirms connection to <code>xwkrmruirfvkmedhcwpf.supabase.co</code>.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ],
        [
            Paragraph("<b>TC-7.2</b><br/>Persistence Across Reload", body_bold),
            Paragraph("1. Toggle verification on any user tag.<br/>2. Hard-refresh the browser (Ctrl+F5).<br/>3. Return to Users tab.", body_style),
            Paragraph("- Verified state remains exactly as toggled.<br/>- Confirms live bi-directional sync between client and Supabase `profiles` table.", body_style),
            Paragraph("[  ] PASS<br/>[  ] FAIL", body_bold)
        ]
    ]
    t7 = Table(test_phase7, colWidths=[90, 195, 205, 50])
    t7.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), DARK),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, CARD_BG])
    ]))
    story.append(t7)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 6: MASTER VERIFICATION SCORECARD & SIGN-OFF CHECKLIST
    # =========================================================================
    story.append(Paragraph("13. Master Verification Scorecard & Sign-Off Checklist", h1_style))
    story.append(Paragraph("Record test results below for formal QA compliance, security audit, and hackathon judging sign-off:", body_style))
    story.append(Spacer(1, 6))

    scorecard_data = [
        [
            Paragraph("<b>Functional Test Section</b>", table_header_style),
            Paragraph("<b>Scope of Functional Testing</b>", table_header_style),
            Paragraph("<b>Acceptance Threshold</b>", table_header_style),
            Paragraph("<b>QA Status</b>", table_header_style)
        ],
        [
            Paragraph("<b>1. Authentication & Tags</b>", body_bold),
            Paragraph("1-click Hirer/Talent logins, dynamic user tag generation, email verification status gating.", body_style),
            Paragraph("Zero auth failures; tags unique with @ prefix.", body_style),
            Paragraph("<b>[  ] PASS</b>", body_bold)
        ],
        [
            Paragraph("<b>2. Agreement Creation</b>", body_bold),
            Paragraph("Counterparty tagging (@amaraokafor), deliverable scopes, USD/NGN FX auto-calculation.", body_style),
            Paragraph("Contract generated with correct ZEC & NGN equivalents.", body_style),
            Paragraph("<b>[  ] PASS</b>", body_bold)
        ],
        [
            Paragraph("<b>3. 6-Stage Lifecycle</b>", body_bold),
            Paragraph("Stepper progression: Created -> Accepted -> Funded -> Submitted -> Approved -> Settled.", body_style),
            Paragraph("Transitions cleanly through all 6 stages without errors.", body_style),
            Paragraph("<b>[  ] PASS</b>", body_bold)
        ],
        [
            Paragraph("<b>4. Deliverable Review</b>", body_bold),
            Paragraph("Live sandbox preview, GitHub repository links, interactive acceptance criteria checklist.", body_style),
            Paragraph("Release disabled until criteria checked.", body_style),
            Paragraph("<b>[  ] PASS</b>", body_bold)
        ],
        [
            Paragraph("<b>5. Dual Blockchain Rails</b>", body_bold),
            Paragraph("Zcash Orchard shielded pool commitments + Pollar direct settlement to GTBank account.", body_style),
            Paragraph("Shielded memo generated; NGN 836,048.75 settled.", body_style),
            Paragraph("<b>[  ] PASS</b>", body_bold)
        ],
        [
            Paragraph("<b>6. Admin Console (/admin)</b>", body_bold),
            Paragraph("Balanced corporate sidebar: Overview chart, Orders inspector modal, Users tag manager, Payouts, Audit trail.", body_style),
            Paragraph("Password-gated (AdminSecure2026!); 100% balanced layout.", body_style),
            Paragraph("<b>[  ] PASS</b>", body_bold)
        ],
        [
            Paragraph("<b>7. Supabase Database</b>", body_bold),
            Paragraph("Live sync of profiles, contracts, milestones, and audit logs with RLS policies.", body_style),
            Paragraph("Green status pill; data persists on reload.", body_style),
            Paragraph("<b>[  ] PASS</b>", body_bold)
        ]
    ]
    sc_table = Table(scorecard_data, colWidths=[120, 210, 140, 70])
    sc_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, CARD_BG])
    ]))
    story.append(sc_table)
    story.append(Spacer(1, 14))

    # Sign-off box
    signoff_data = [
        [
            Paragraph("<b>QA Lead Verification Sign-Off:</b>", body_bold),
            Paragraph("<b>Date Verified:</b> ___________________________", body_style),
            Paragraph("<b>Overall Status:</b> [  ] APPROVED  [  ] REVISE", body_bold)
        ],
        [
            Paragraph("<b>Tester Name:</b> ___________________________", body_style),
            Paragraph("<b>Target Build:</b> Kordia v1.0 (commit main)", body_style),
            Paragraph("<b>Digital Signature:</b> ______________________", body_style)
        ]
    ]
    signoff_table = Table(signoff_data, colWidths=[180, 180, 180])
    signoff_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(signoff_table)
    story.append(Spacer(1, 14))

    story.append(Paragraph("14. Troubleshooting & Quick State Recovery", h1_style))
    story.append(Paragraph(
        "- <b>Unexpected Local State:</b> Click the 'Reset Demo State & Reload' button in the bottom sidebar or browser localStorage to reset to clean demo seed state.<br/>"
        "- <b>Supabase RLS Policy:</b> If an insert fails, ensure you ran the complete <code>supabase/schema.sql</code> script in the Supabase SQL Editor.<br/>"
        "- <b>Admin Access:</b> Direct URL access is available via <code>http://localhost:5175/#/admin</code> with key <code>AdminSecure2026!</code>.",
        body_style
    ))

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated: {filename} (Size: {os.path.getsize(filename)} bytes)")

if __name__ == '__main__':
    generate_testing_guide_pdf()
