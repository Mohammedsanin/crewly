💼 Crewly — Premium Enterprise Intelligent Workspace & Company ERP
A modern, highly aesthetic, real-time enterprise management platform and team collaboration workspace built with React 18, Vite, TypeScript, and Supabase. Crewly streamlines task tracking, visualizes project schedules via Gantt charts, calculates ARR trends under dynamic simulations, and connects employees through a privacy-first direct messaging handshake network.

🌟 Key Features

🔄 Real-Time Synced Database:
- **Supabase Cloud Sync**: Live cloud syncing for task tracking, client directories, invoices, and messaging logs.
- **Local-First Fallback**: Automatically preserves state in `localStorage` when offline, ensuring 100% application resilience.

👁️ CSS-Based Logo Intro & Light Theme:
- **CSS Logo Intro**: A lightweight, pure CSS animated brand presentation featuring merging color circles (sage, blush, lavender), staggered letter-fade animations, and tagline triggers.
- **Sleek Light Aesthetics**: Glassmorphic slate/white panels, responsive sidebar drawers, and vibrant high-contrast visual cues that look professional and premium.

🔥 Private DM Handshake (Anti-Stalking):
- **Privacy Handshake Model**: Direct messages between team members are disabled until a mutual connection request is accepted.
- **Impersonation System**: Developer debugging utility next to roster profiles allows instant profile switching to test request acceptance immediately.

📊 ARR projection & Financials:
- **Interactive ARR Slider**: Growth projection simulation sliders update MRR, quarterly aggregates, and net margin trendlines in real time.
- **Invoice Statement Printer**: High-fidelity `@media print` invoice sheets designed for downloading corporate statements directly.

📅 Timeline View (Gantt Chart):
- **Gantt Deliverables Range**: Interactive horizontal calendar charts displaying task duration ranges, active progression tracks, and assignees.

📁 Repository Structure

```
crewly/
├── public/                 # Static brand assets & graphics
│   ├── logo.png            # Primary brand mark
│   └── crewly_animation.mp4# Loop logo motion graphic
├── src/                    # React frontend source directory
│   ├── components/         # Reusable dashboard widgets & pages
│   │   ├── ai/             # AIAssistantDrawer copilot component
│   │   ├── auth/           # LoginPage security & workspace creation
│   │   ├── chat/           # TeamChatDrawer, connection invitation cards
│   │   ├── clients/        # Client directory lists & summaries
│   │   ├── common/         # Sidebar, header, & Supabase setup modal
│   │   ├── company/        # Organization metadata & backup exports
│   │   ├── dashboard/      # Activity feeds & KPI metrics
│   │   ├── employees/      # Team roster directory list
│   │   ├── financials/     # Invoice prints, ARR simulator charts
│   │   └── tasks/          # Draggable KanbanBoard, Gantt chart, modal forms
│   ├── context/            # ERPContext state engine
│   ├── services/           # SupabaseClient API sync calls
│   ├── theme/              # Color constants & visual style tokens
│   ├── types/              # Unified TypeScript definitions & schemas
│   ├── utils/              # Data aggregations & currency formatters
│   ├── App.tsx             # Application routes & layout templates
│   ├── index.css           # Global design system & custom scrollbar properties
│   └── main.tsx            # Application DOM entry point
├── supabase_schema.sql     # Database tables, RLS policy setups, & seeds
├── package.json            # Scripts & project dependencies
├── tsconfig.json           # TypeScript configuration details
└── vite.config.ts          # Vite build parameters & compiler settings
```

⚙️ Mathematical Model: ARR Multiplier Projections

The financials dashboard monitors annual recurring revenue (ARR) projections dynamically using custom growth multipliers set by the user:

1. Projected ARR Formula
The projected Annual Recurring Revenue (\(ARR_{projected}\)) is modeled as:
\[ARR_{projected} = \left( \sum_{i=1}^{N} C_i \right) \times 12 \times M\]

Where:
- \(C_i\) is the monthly contract value of active client \(i\).
- \(N\) is the total count of active clients in the directory.
- \(M\) is the growth projection multiplier scale (ranging from \(1.0\times\) to \(3.0\times\)) selected via the slider.

2. Net Margin Projections
The projected Net Profit (\(P_{projected}\)) and margin percentages are derived after subtracting the fixed overhead operating burn rate:
\[P_{projected} = ARR_{projected} - (Burn_{monthly} \times 12)\]
\[Margin_{net} = \left( \frac{P_{projected}}{ARR_{projected}} \right) \times 100\]

🚀 Quick Setup & Installation

Prerequisites
- Node.js 18+ & npm installed

1. Installation
Clone the repository and install project dependencies:
```bash
npm install
```

2. Database Setup (Supabase)
Import the sql script found in [supabase_schema.sql](file:///d:/projects/syncwave-flow-main/supabase_schema.sql) into your Supabase SQL editor to initialize tables, row-level security (RLS) policies, and triggers.

3. Running in Development
Start the local server:
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** to access the dashboard.

4. Building Production Bundle
Compile assets for production distribution:
```bash
npm run build
```

Developed with ❤️ using React 18, Vite, TypeScript, and Supabase.
