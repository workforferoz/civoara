# CIVOARA — Next-Generation Municipal Issue & Accountability SaaS

CIVOARA is an enterprise civic technology platform designed for municipal governments, field officers, administrative leadership, and citizens. It streamlines civic issue reporting, geospatial routing, SLA-driven resolution tracking, automated multi-tier escalations, duplicate issue clustering, and organizational restructuring without losing accountability history.

---

## 🏛️ Key Features

- **Citizen Civic Issue Reporting**: Real-time geolocation pin selection, photograph upload with client-side preview and size validation, automated reference number generation, and personal dashboard tracking.
- **Geospatial & Ward Boundary Routing**: PostGIS-compatible spatial point-in-polygon queries for automatic municipal ward assignment and routing rules.
- **Deterministic SLA Engine & Escalation**: Configurable service level agreements by issue category with multi-level automated escalation (Assigned Officer → Supervisor → Commissioner → Administrator).
- **Spatial Clustering & Duplicate Detection**: Automated grouping of nearby complaints concerning the same physical issue, preserving individual citizen tracking while establishing canonical municipal tickets.
- **Fair Restructuring & SLA Segment Tracking**: Non-destructive organizational versioning (`ownership_segments`) preserving full issue age and past performance during ward reassignments and department mergers.
- **Public Transparency & Performance Analytics**: Real-time public dashboards with ward comparisons, department leaderboards, and SLA compliance metrics without exposing private citizen data.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript (Strict Mode)
- **Styling**: Tailwind CSS, Lucide React icons
- **Form Management**: React Hook Form, Zod schema validation
- **Backend & Database**: Supabase (PostgreSQL, PostGIS, Storage, Auth with Row Level Security)
- **Mapping**: OpenStreetMap & Leaflet with responsive geospatial views

---

## 📁 Project Architecture

```
src/
├── app/                  # Next.js App Router pages and API routes
│   ├── (auth)/           # Authentication routes (login, register, reset)
│   ├── citizen/          # Citizen dashboard and report tracker
│   ├── officer/          # Field officer worklist and task management
│   ├── admin/            # Administrative routing, SLA, and org restructuring
│   ├── public/           # Public issue explorer and performance leaderboard
│   └── report/           # Citizen civic issue submission wizard
├── components/
│   ├── ui/               # Core design system primitives (buttons, inputs, modals, badges)
│   ├── layout/           # Shared topbars, sidebars, footer, and navigation
│   ├── citizen/          # Citizen-specific components (report forms, status cards)
│   ├── officer/          # Officer resolution cards, proof uploader
│   ├── admin/            # Routing rule builder, SLA policy manager, restructuring wizard
│   ├── dashboard/        # Metrics widgets, leaderboard tables, charts
│   └── maps/             # Geospatial location picker, interactive public issue maps
├── lib/
│   ├── supabase/         # Browser, server, and service-role clients
│   ├── auth/             # Role verification, session handlers, middleware helpers
│   ├── validation/       # Zod schemas for forms, issues, and API requests
│   ├── routing/          # Automatic ward and category routing engine
│   ├── sla/              # SLA calculation, countdown timers, escalation processor
│   ├── clustering/       # Spatial duplicate clustering and scoring logic
│   ├── notifications/    # Citizen and officer alert dispatcher
│   └── services/         # Core business logic service layer
├── hooks/                # Custom React hooks (auth, location, notifications)
└── types/                # Strict TypeScript domain interfaces and database definitions

supabase/
├── migrations/           # Versioned PostgreSQL DDL migrations with RLS policies
└── seed/                 # Controlled development seed data (departments, wards, demo users)

docs/
└── ARCHITECTURE.md       # Comprehensive system architecture specification
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10
- Supabase project or local Supabase CLI instance

### 1. Installation

```bash
git clone <repository-url>
cd civoara
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and configure your credentials:

```bash
cp .env.example .env.local
```

### 3. Verification & Development

```bash
# Type check TypeScript codebase
npm run type-check

# Run ESLint
npm run lint

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
