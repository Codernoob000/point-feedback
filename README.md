# POINT.FEEDBACK

> **Point. Speak. Fix.**  
> Developer-grade visual feedback platform. Eliminate vague bug reports by pointing at any UI element and capturing pixel-accurate DOM hierarchy, query selectors, telemetry matrix, screenshots, and 10s voice notes.

---

## 🚀 Key Features

* **Point & Speak Inspection Mode**: Hover over any live DOM element on your website with an instant 2px indigo border and dynamic selector tooltip (`button#checkout`).
* **High-Density Developer Dashboard**: Linear & Vercel-inspired dark mode dashboard with master feed, real-time ingestion, and inspection panel.
* **Pixel-Accurate DOM Inspector**: Live syntax-highlighted element tag, attributes, and breadcrumb ancestry hierarchy (`html > body > main > button#checkout`).
* **Telemetry Matrix**: Automatically captures viewport dimensions, DPR (Retina / standard), user agent, browser, operating system, and current URL without manual input.
* **10-Second Voice Telemetry**: Integrated voice recorder using the `MediaRecorder` API with dynamic waveform visualization and automated transcription.
* **AI Bug Triage Engine**: Automatically analyzes element context, comment, and sentiment to generate developer issue summaries, categorize bugs (`UI Bug`, `Performance`, `Accessibility`, `Feature Request`), and assign priority levels.
* **One-Click Issue Exports**: Native export integrations to **Linear** (`PF-104`) and **Jira** (`BUG-104`).
* **Embeddable Widget SDK**: Standalone, framework-agnostic bundle with Shadow DOM encapsulation and floating launcher.
* **Realtime Analytics**: Visual feedback volume timelines, sentiment distribution ratios, top affected routes, and bottleneck DOM targets.

---

## 🏛️ Monorepo Architecture

```text
point-feedback/
├── apps/
│   ├── api/                 # FastAPI + SQLAlchemy backend with AI triage & upload storage
│   │   ├── main.py          # App entrypoint, CORS, static file mounts
│   │   ├── database.py      # SQLite & PostgreSQL configuration
│   │   ├── models.py        # Project and Feedback database schemas
│   │   ├── routes/          # Feedback, Analytics, and Projects API routers
│   │   ├── services/        # AI triage & screenshot/audio storage services
│   │   └── seed.py          # Realistic developer feedback seed data
│   │
│   ├── dashboard/           # Vite + React + TypeScript + Tailwind CSS
│   │   ├── src/components/  # BrandIcon, Feed, InspectionPanel, DomInspector, TelemetryGrid
│   │   ├── src/pages/       # FeedbackPage, AnalyticsPage, IntegrationsPage, SettingsPage, Sandbox
│   │   └── src/api/         # Typed API client
│   │
│   └── widget/              # Standalone TypeScript Widget SDK
│       ├── src/inspector.ts # Hover highlight, bounding boxes, DOM selector parser
│       ├── src/popover.ts   # Anchored floating dark-mode card with sentiment & voice
│       ├── src/audio-recorder.ts # MediaRecorder API, 10s timer, animated waveform
│       ├── src/screenshot.ts     # Canvas & html2canvas viewport capture
│       └── demo.html        # Interactive client application sandbox
│
└── packages/
    └── shared-types/        # Shared TypeScript contracts and interfaces
```

---

## 🛠️ Quickstart & Local Development

### 1. Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (3.10+)

### 2. Start the Backend API
```bash
cd apps/api
python main.py
```
*API will run at `http://localhost:8000` with interactive OpenAPI docs at `http://localhost:8000/docs`.*

### 3. Start the Admin Dashboard
```bash
cd apps/dashboard
npm install
npm run dev
```
*Dashboard will run at `http://localhost:5173`.*

### 4. Start the Standalone Widget SDK / Demo
```bash
cd apps/widget
npm install
npm run dev
```
*Widget demo sandbox will run at `http://localhost:5174/demo.html`.*

---

## 📦 Client SDK Embed

Add this script tag right before the closing `</body>` tag on any website:

```html
<script src="https://cdn.pointfeedback.dev/widget.js"></script>
<script>
  PointFeedback.init({
    apiKey: "pf_live_98a72b610c144e88",
    position: "bottom-right",
    apiUrl: "https://api.pointfeedback.dev/api/v1"
  });
</script>
```

---

## 🌐 API Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/feedback` | Ingest feedback (`multipart/form-data`) with screenshot, audio, selector, telemetry |
| `GET` | `/api/v1/feedback` | List paginated feedbacks with status/sentiment/priority filters |
| `GET` | `/api/v1/feedback/{id}` | Retrieve comprehensive feedback report |
| `PATCH` | `/api/v1/feedback/{id}` | Update status (`open`, `in_progress`, `resolved`, `archived`) |
| `POST` | `/api/v1/feedback/{id}/ai-analyze` | Re-run AI classification and ticket summarization |
| `POST` | `/api/v1/feedback/{id}/linear` | Export feedback to Linear backlog |
| `POST` | `/api/v1/feedback/{id}/jira` | Export feedback to Jira Software issue |
| `GET` | `/api/v1/analytics` | Aggregate feedback trends, sentiment breakdown, and DOM targets |
| `GET` | `/api/v1/projects` | List projects and API keys |

---

## 🚢 Production Deployment

### Backend (Docker / Cloud Run / Render)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY apps/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY apps/api .
ENV DATABASE_URL="postgresql://user:pass@db-host:5432/pointfeedback"
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Dashboard (Vercel / Cloudflare Pages)
```bash
cd apps/dashboard
npm run build
# Deploy 'dist/' folder to Vercel or Cloudflare Pages
```

### Widget (Cloudflare R2 / AWS CloudFront CDN)
```bash
cd apps/widget
npm run build
# Upload 'dist/widget.umd.js' and 'dist/widget.es.js' to CDN bucket
```
