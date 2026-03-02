# Modules 1–3 Functional Spec (Frozen)

This is the canonical implementation target for Cursor.

> Full DOCX reference is included in this repo under `/docs/`.

---

## Module 1 — Public Website & Discovery

### Offering
- Single course: **KKM Food Handling Course**
- Delivery: Online (Zoom) or Physical (venue)
- Each class has **exactly one language**; multiple languages = multiple concurrent classes.

### Website Language
- Default: BM
- Browser detection -> closest supported language
- Manual toggle always available
- Launch: BM + EN
- Options: Mandarin, Tamil, Bengali, Indonesian, Myanmar, Nepal

### Class Listing UX
- Show **next 6** upcoming available classes
- Show up to **4 most recent sold-out** classes
- Button: **View more available classes** (loads next 6)
- Date selector to search other dates
- Sold-out classes show FULL badge + next available suggestions

### Trust & Conversion
- KKM recognition
- “Certificate in 24 hours”
- WhatsApp support entry
- Testimonials + photos
- Seat-based urgency only

### Alternative Date Request
- DemandRequest form (NOT booking)
- Fields: preferred date(s), time (optional), language, mode, name, WhatsApp, email, participant count (optional), notes
- Aggregated in Ops dashboard for decisions

### CTAs
- “Book Now with Payment”
- “Reserve Now, Pay Later (24h Lock)”
- No login upfront

---

## Module 2 — Booking, Identity, Compliance Core

### Unified Checkout (B2C + Corporate)
- Corporate uses the **same checkout**, with more fields + bulk entry
- Corporate login required
- Employer field:
  - Auto-suggest from registered employers
  - Free-text fallback
- Self-registered participant may select employer -> **Pending employer approval**

### Reservations (Pay Later)
- Seat lock duration: 24h
- Expiry releases seat automatically
- Abuse controls: rate limits, max active reservations per identity

### Identity Rules
- Repeat registration allowed for same IC/passport (retake)
- User can edit name **before class start** only
- After class starts: user/employer identity edits locked; admin only w/ reason
- Lost phone/email: RecoveryRequest -> admin verified update

### Corporate Employee Claiming
- Corporate-created participants start **Unclaimed**
- Claim methods: WhatsApp OTP OR email password link
- Employer visibility: can see full employee data incl full IC
- After claim: employer is read-only for identity fields, but can still enroll employee for future classes

### Verification (Mandatory)
- Pre-class self check-in: selfie + ID upload
- Session admin assistant reviews/approves/rejects
- Admin can override/skip with reason
- Verification resets on move/transfer

### Attendance & Evidence
- Must be 100% present; camera expected on
- Connectivity buffer: 5 minutes cumulative disconnect/rejoin allowed
- Evidence: Zoom join/leave duration + checkpoint questionnaires + trainer confirmation

### Questionnaires
- Admin manages banks and per-class plan
- Embedded portal or external form links (configurable)
- Trainer opens/closes checkpoints with one-click controls
- Late submissions allowed within 2 hours; marked late

### Completion + Certificate
- Gated issuance: verification approved + attendance compliant + questionnaires completed + scores recorded
- Trainer approves compliance; admin pushes completion notifications
- Certificate:
  - Unique non-sequential Certificate ID
  - QR -> public verification `/verify/{certificate_id}`
  - Public verification shows: name, IC masked last 4 digits, attended date, issued date, trainer name+ID, status VALID/REVOKED

### Revocation
- Admin can revoke individual or batch by trainer/class
- Requires reason + audit log

### Physical Certificate & Shipping
- Shipment states: Pending Print -> Printed -> Posted -> Tracking Assigned -> Delivered(optional)
- EasyParcel tracking sync job updates status

### Move vs Transfer Integrity
- Move allowed **before class start** (re-link booking), verification resets
- After start: Move blocked; Admin Transfer creates **new booking**, marks original as “No Show (Admin Approved Transfer)”

---

## Module 3 — Class Lifecycle & Trainer Assignment

### Lifecycle
- Class is **Confirmed immediately** when created (no auto-cancel)
- Low enrolment flag if enrolled < min threshold (visible to ops + assigned trainer)
- States: Draft(optional), Confirmed, Ongoing, Completed, Cancelled, Archived

### Capacity & Minimum Threshold
- Capacity configurable by admin per program/class settings
- Minimum threshold configurable per class
- Decreasing capacity below current enrollment should be blocked or explicit admin override

### Trainer Assignment
- Manual assignment by Ops Admin
- Validate language match
- Warn on conflicts
- Admin can override with reason

### Corporate Scheduling
- Corporate selects from active classes
- Corporate can request custom date/time (admin decision; does not auto-create class)

### Refund
- No refunds by default
- Admin can manually refund with reason

### Moves/Transfers
- Admin can move participants pre-start; resets verification
- Post-start: transfer only (new booking), preserve history
