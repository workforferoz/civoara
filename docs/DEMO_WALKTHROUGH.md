# CIVOARA — Hackathon Demo & Evaluation Walkthrough

Follow this step-by-step evaluation guide to test all 10 completed modules of CIVOARA.

---

## 🔑 Quick Demo Credentials (Pre-Configured)

Use the one-click demo selector on the [`/login`](/login) page:

| Role | Email | Password | Primary Portal |
|---|---|---|---|
| **Citizen** | `citizen@civoara.gov` | `GovSecure2026!` | [`/citizen/dashboard`](/citizen/dashboard) |
| **Field Officer** | `officer@civoara.gov` | `GovSecure2026!` | [`/officer/tasks`](/officer/tasks) |
| **Supervisor** | `supervisor@civoara.gov` | `GovSecure2026!` | [`/admin/sla`](/admin/sla) |
| **Commissioner** | `commissioner@civoara.gov` | `GovSecure2026!` | [`/public/performance`](/public/performance) |
| **Administrator** | `admin@civoara.gov` | `GovSecure2026!` | [`/admin/routing`](/admin/routing) |

---

## 🚀 5-Minute Live Demo Script

### Step 1: Public Landing Page & Radical Transparency
1. Open [`/`](/) to inspect the GovTech SaaS landing page.
2. Review the core civic accountability value proposition:
   - 48h Max Average Target SLA
   - PostGIS Automated Ward Boundary Resolution
   - Level 0-3 Multi-Tier Escalations
   - Zero PII Public Privacy Standard

### Step 2: Citizen Civic Issue Submission Wizard
1. Navigate to [`/report`](/report).
2. Select **Pothole & Road Defect** (indicates 48h SLA target).
3. Fill in title: `Hazardous crater near Indiranagar Metro Station`.
4. Fill in description: `Deep trench causing severe vehicle swerves during evening rush hour.`
5. In the **Photograph Evidence** section, drag & drop a sample image. Notice instant client-side preview, MIME check, and 5MB validator.
6. In the **Geographic Location** section, click **"Use My GPS Location"** or select the preset **"Indiranagar (100ft Rd)"**.
7. Notice the interactive Leaflet map pin movement and 6-decimal coordinate readout.
8. Click **"Submit & Start SLA Clock"**.
9. Observe the generated unique municipal reference code (e.g. `CIV-2026-XXXXX`), target SLA deadline, and copy button.

### Step 3: Citizen Dashboard & Live SLA Tracking
1. Navigate to [`/citizen/dashboard`](/citizen/dashboard).
2. Inspect the 4 real-time KPI cards: **Total Submitted**, **Open / Assigned**, **In Progress**, **Resolved**.
3. Locate your newly submitted ticket in the complaints table.
4. Click **"Inspect Details"** to open the modal showing photographic evidence, PostGIS ward location, and immutable status audit history.

### Step 4: Live Municipal Public Issue Map
1. Navigate to [`/public/map`](/public/map).
2. Toggle between **"Map View"** and **"Register List"**.
3. Filter by defect category (e.g., Pothole, Garbage, Water Leakage).
4. Click on any map marker to inspect public details. Notice that citizen names, phone numbers, and private contact info are completely redacted.

### Step 5: Field Officer Workstation
1. Navigate to [`/officer/tasks`](/officer/tasks).
2. Observe tasks ordered strictly by SLA deadline urgency.
3. Click **"Update Progress"** on an active task.
4. Advance the workflow to **"Mark In Progress"** or click **"Submit Resolution & Close"** with rectification notes and photo proof.

### Step 6: PostGIS Routing Engine & Conflict Rejection
1. Navigate to [`/admin/routing`](/admin/routing).
2. Test the **Interactive Routing Simulator**:
   - Select Category: `Pothole`. Coordinates: `12.9716, 77.5946` (Ward 101 CBD).
   - Click **"Test Routing Resolution"**. Notice it triggers **Priority 1 Exact Match** assigning the ticket to PWD with Inspector Ramesh Kumar.
   - Enter outside coordinates (`14.5, 79.1`). Notice it safely routes to the **Administrative Review Queue** rather than failing silently.

### Step 7: Deterministic SLA Engine & Idempotent Escalation Sweep
1. Navigate to [`/admin/sla`](/admin/sla).
2. Review the categorical service standards (Pothole 48h, Garbage 24h, Streetlight 72h, Water 12h, Other 96h).
3. Observe the **Live SLA Watchdog Table** displaying countdown timers and progress bars.
4. Click **"Run Escalation Sweep (Cron)"**.
5. Observe the execution summary: overdue tickets cascade to Level 1 (Supervisor), while already-escalated or on-track tickets are skipped with 100% idempotency.

### Step 8: Duplicate Issue Clustering & Sybil Protection
1. Navigate to [`/admin/clusters`](/admin/clusters).
2. Adjust the spatial proximity radius slider (default 60m) or auto-merge threshold slider.
3. Test the **Duplicate Detection Workbench**:
   - Click preset **"High Match (~94% Auto-Merge)"**. Notice that reports 5 meters apart with similar descriptions are automatically grouped.
   - Observe the **Sybil Guard**: 4 citizen reports by only 2 unique citizens are detected, preventing malicious priority inflation.

### Step 9: Department Restructuring Wizard & Fair SLA Migration
1. Navigate to [`/admin/restructuring`](/admin/restructuring).
2. Choose **"Transfer Ward Responsibility"** from Solid Waste Management to Public Works Department.
3. Click **"Inspect Impact & Preview Migration"**.
4. Notice that open tickets and overdue counts are calculated.
5. Click **"Confirm & Commit Reorganization"**.
6. Inspect the **Historical Ownership Segments Ledger**:
   - The old department's elapsed time is preserved.
   - The new department receives a clean segment SLA budget.
   - The total true age of the complaint is never erased.

### Step 10: Public Transparency & Performance Leaderboard
1. Navigate to [`/public/performance`](/public/performance).
2. Inspect the **Explainable Department Leaderboard**:
   - Review ranking scores with full sample size disclosures (`High Sample N>50` vs `Moderate Sample N>20`).
   - Inspect ward-by-ward comparisons and category breakdown.
   - Review the standard 5-stage public complaint lifecycle.
