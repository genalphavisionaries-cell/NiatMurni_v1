# Niat Murni Platform — Functional & Mechanism Reference v1.0

**Source:** NiatMurni_Functional_Mechanism_Reference_v1.pdf  
**Purpose:** User journeys, flows, and mechanism details for implementation reference.  
**Upgraded version:** See **`docs/DEEP_WORKFLOW_UX_REFERENCE.md`** (v2 — Deep Workflow & UX Mechanism) for detailed stages and UX requirements.

---

## 1. Public User Journey (Individual Registration Flow)

| Step | Action |
|------|--------|
| **1** | Visitor lands on website; views available classes (filter by **location, date, language, mode**). |
| **2** | User selects a class; views full details (trainer, capacity, price, schedule). |
| **3** | User clicks **Register** → fills participant details (NRIC/passport; employer optional). |
| **4** | System creates **Booking** record (status = **pending**). |
| **5** | Stripe Checkout session created → user redirected to secure payment page. |
| **6** | Payment successful → **Stripe webhook** updates booking to **paid**. |
| **7** | Booking moves to **verified** after admin/system validation. |
| **8** | On class day: attendance recorded (physical check-in **or** Zoom attendance validation). |
| **9** | If attendance threshold met → booking status **completed**. |
| **10** | Certificate generated with QR verification → status **certified**. |

---

## 2. Online Class (Zoom Mechanism)

| Step | Action |
|------|--------|
| 1 | Admin creates **online class session**. |
| 2 | System **auto-generates Zoom meeting** via Zoom API. |
| 3 | **Meeting ID & link** stored in **ClassSession** record. |
| 4 | Participants receive **reminder email** with Zoom link. |
| 5 | After session ends → **Zoom attendance report** retrieved. |
| 6 | **Go API** validates attendance duration threshold. |
| 7 | Eligible participants move to **certification stage**. |

---

## 3. Corporate Registration Flow

| Step | Action |
|------|--------|
| 1 | Corporate admin submits **bulk registration form**. |
| 2 | System creates **Employer** record (if new). |
| 3 | Corporate **uploads participant list (CSV)**. |
| 4 | System creates **multiple Bookings** (pending). |
| 5 | System generates **consolidated Stripe invoice or Payment Link**. |
| 6 | Upon payment confirmation → **all bookings marked paid**. |
| 7 | Attendance & certification processed **individually per participant**. |

---

## 4. Admin Mechanism (Laravel Filament)

Admins can:

- **Manage** Programs and ClassSessions.
- **View and manage** Participants and Employers.
- **Override booking status** (with **mandatory audit log reason**).
- **Manually verify** identity when required.
- **View payment status** synced from Stripe.
- **Trigger** certificate re-issue or revocation.
- **Export** attendance reports.
- **View audit logs** for compliance.

---

## 5. Tutor / Trainer Mechanism

Trainers can:

- **View** assigned ClassSessions.
- **Access** participant list for session.
- **Mark attendance** (check-in/check-out).
- **Flag** participants for verification issues.
- **Submit** session completion confirmation.
- **Upload** supporting documents if required.

---

## 6. Certificate & QR Verification Mechanism

| Rule | Detail |
|------|--------|
| **Generation** | Certificate generated only after **completed + verified** state. |
| **QR** | Unique QR code embedded in certificate. |
| **Verification** | QR links to **public verification endpoint**. |
| **Display** | Verification endpoint displays **certificate validity**. |
| **Revocation** | Admin can revoke certificate (status = **revoked**). |

---

## 7. State Enforcement Rules

- **Booking** must follow **strict state progression** (no skipping).
- **No certification** without **paid + verified + completed** status.
- **Admin override** requires **audit trail** (who, when, reason).
- **Zoom attendance** must meet **minimum duration threshold** for eligibility.

---

## Cross-Reference

- **State machines & models:** See `docs/MASTER_SYSTEM_BLUEPRINT.md`.
- **Stripe webhook events:** payment confirmation → booking paid (Section 1 Step 6; Section 3 Step 6).
- **Go API:** attendance validation (Section 2); certification logic per master blueprint.
