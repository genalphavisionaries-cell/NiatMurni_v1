# Niat Murni Platform — Deep Workflow & UX Mechanism Reference v2.0

**Source:** NiatMurni_Deep_Workflow_And_UX_Mechanism_v2.pdf  
**Purpose:** Detailed UX stages, workflows, and mechanism rules for implementation.  
**Note:** Upgraded version of the Functional Mechanism Reference v1.

---

## 1. Individual Participant — End-to-End UX Flow

### STAGE 1 – Landing Experience

- User visits **homepage** → sees: **Upcoming Classes**, **Search Filter** (Location, Mode, Date, Language), CTA: **Register Now**.
- **UX requirement:** No login required at browsing stage. Fast-loading class cards with **price + availability indicator**.

### STAGE 2 – Class Detail Page

- Displays: **Program Info**, **Trainer**, **Date/Time**, **Mode** (Physical/Online), **Capacity Remaining**, **Price**.
- User clicks **Register** → moves to registration form.

### STAGE 3 – Registration Form

- **Fields:** Full Name, NRIC/Passport (validated uniqueness), Phone, Email, Employer (optional).
- **System behavior:**
  - Check duplicate NRIC.
  - Create **Participant** record (if new).
  - Create **Booking** (status = **pending**).

### STAGE 4 – Payment

- System creates **Stripe Checkout Session**.
- User redirected to Stripe.
- After success → **Stripe webhook** → **Laravel** updates booking to **PAID**.
- **Go API** validates payment before allowing verification stage.

### STAGE 5 – Pre-Class Dashboard (Participant Portal)

- User receives **confirmation email**.
- User can log in to **Participant Portal** to see:
  - Booking status timeline
  - Class details
  - Payment receipt
  - Zoom link (if online)

### STAGE 6 – Attendance Mechanism

- **Physical:** Trainer marks check-in/out.
- **Online:** Zoom attendance pulled after class.
- **Go** validates **minimum attendance duration threshold**.

### STAGE 7 – Certification

- System **auto-generates certificate** only if:
  - Paid
  - Verified
  - Attendance completed
- Certificate includes **QR verification link**.

---

## 2. Corporate Registration Flow (B2B UX)

| Stage | Description |
|-------|-------------|
| **STAGE 1** | Corporate Landing Page — Corporate clicks **Corporate Registration**. |
| **STAGE 2** | Corporate Form — Fields: **Company Name**, **SSM Reg No**, **Contact Person**, **Email**, **Phone**. |
| **STAGE 3** | Bulk Upload — Upload **CSV** → System validates **NRIC uniqueness** → Creates **multiple bookings (pending)**. |
| **STAGE 4** | Consolidated Payment — System generates **Stripe Invoice or Payment Link** for total amount. Payment success → **All bookings move to PAID**. |
| **STAGE 5** | Corporate Dashboard — Corporate can: **Track participant status**, **Download invoices**, **Download certificates**, **Re-register participants**. |

---

## 3. Admin Panel — Filament Workflow

### Admin Dashboard KPIs

- Upcoming classes
- Paid vs Pending bookings
- Revenue summary
- Attendance status

### Admin Functionalities

- Create/Edit **Programs**
- Create **ClassSessions**
- **Assign Trainer**
- View **Participants**
- **Override booking status** (requires **audit reason**)
- **Revoke certificate**
- **Export compliance reports**

### Stripe Management

- View invoice status
- Issue manual refund
- Handle webhook failure alerts

### Zoom Management

- Auto-create meeting on class creation
- Regenerate meeting link
- View attendance logs

---

## 4. Trainer / Tutor Workflow

### Trainer Portal Features

- View **assigned sessions**
- View **participant list**
- **Mark attendance**
- **Flag verification issues**
- **Confirm session completion**
- **Upload session evidence** (if required)

### Attendance Rules

- Trainer **cannot mark completed** unless **minimum session duration** met.
- System logs **timestamp + trainer ID** for audit compliance.

---

## 5. Automation & State Enforcement

| Rule | Detail |
|------|--------|
| **Booking state machine** | `pending` → `reserved` → `paid` → `verified` → `completed` → `certified`. |
| **No skip** | System **prevents skipping states** unless **Admin override with audit log**. |
| **Stripe** | **Webhook must confirm payment** before state changes. |
| **Zoom** | Attendance must **pass duration validation** before completion. |
| **Certificate** | **QR endpoint** must **publicly validate** status (issued/revoked). |

---

## Cross-Reference

- **Architecture & models:** `docs/MASTER_SYSTEM_BLUEPRINT.md`
- **Simpler flow summary:** `docs/FUNCTIONAL_MECHANISM_REFERENCE.md` (v1)
