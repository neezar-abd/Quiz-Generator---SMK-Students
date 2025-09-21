---

# Soalin – AI Quiz Generator

A modern web application that transforms study materials into intelligent quizzes using AI.
Designed specifically for SMK (Vocational High School) students and teachers, this platform makes assessment more efficient, interactive, and personalized.

Built with a clean, minimalist UI and a robust backend powered by Next.js, Supabase, and Prisma, Soalin demonstrates production-ready engineering and strong developer experience.

---

## Key Features

* Clean Black & White UI: Minimalist, professional, distraction-free design
* File Upload System: Drag & drop interface supporting PDF, DOC, and DOCX
* AI-Powered Quiz Generation: Automatically converts documents into structured quizzes
* Persistent Database: Quizzes saved with Supabase PostgreSQL + Prisma ORM
* Dashboard Management: Track, edit, and organize quizzes with real-time CRUD
* Responsive by Design: Optimized for mobile, tablet, and desktop
* Modern Developer Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma ORM

---

## Tech Stack

* Framework: Next.js 14 (App Router)
* Language: TypeScript
* Database: Supabase PostgreSQL + Prisma ORM
* Styling: Tailwind CSS
* Validation: Zod schema validation
* Linting: ESLint with pre-configured rules

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx             # Homepage with hero section
│   ├── upload/page.tsx      # File upload interface
│   ├── dashboard/page.tsx   # Quiz management dashboard
│   ├── layout.tsx           # Root layout with navigation
│   └── globals.css          # Global styles
└── components/
    ├── Navbar.tsx           # Navigation bar
    └── Footer.tsx           # Footer section
```

---

## Pages Overview

### Home Page

* Hero section with call-to-action
* Feature highlights with icons
* User-friendly onboarding

### Upload Page

* Drag & drop upload for PDF/DOC/DOCX
* AI analysis preview
* Real-time progress feedback

### Dashboard Page

* Quiz statistics overview
* Status indicators (Published / Draft)
* Quick actions: View, Edit, Share, Export

---

## Getting Started

### Prerequisites

* Node.js (v18+)
* npm or yarn
* Supabase account

### Installation

```bash
# Clone repository
git clone <repository-url>
cd soalin

# Copy environment variables
cp .env.example .env.local

# Install dependencies
npm install

# Setup database
npx prisma db push

# Start development server
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## Database Setup

Uses Supabase PostgreSQL with Prisma ORM.
Schema includes:

* `User` → linked with Google login
* `Quiz` → metadata + ownership
* `Question` → multiple-choice & essay items

See detailed setup guide in [`docs/DATABASE_PERSISTENCE.md`](./docs/DATABASE_PERSISTENCE.md).

---

## Design Principles

* Minimalist black/white palette
* Mobile-first responsive design
* Clean typography (variable font via next/font)
* Consistent spacing (Tailwind utilities)
* Accessible contrast and keyboard navigation

---

## Current Status

* [x] Google Login with Supabase Auth
* [x] File Upload (PDF, DOC, DOCX)
* [x] AI-powered quiz generation
* [x] Dashboard CRUD with persistence
* [x] Responsive UI and clean styling

---

## Roadmap

* [ ] Adaptive practice quizzes
* [ ] Real-time collaboration
* [ ] Import/export quizzes
* [ ] Analytics and insights
* [ ] WebSocket-powered live updates
* [ ] Advanced search and filtering

---

## Developer

* Name: Neezar Abdurrahman Ahnaf Abiyyi
* Role: Fullstack Developer (SMKN 1 Probolinggo – RPL)
* Contact: [neezzar.dev@gmail.com](mailto:neezzar.dev@gmail.com) • [Portfolio](https://neezar.tech)

---

## License

MIT License.
Built for educational purposes and open collaboration.

---

## Environment Variables

Add the following to your environment (Vercel Project Settings or `.env.local`):

- `NEXT_PUBLIC_SITE_URL` – canonical site URL (e.g., https://soalin.ai)
- `NEXT_PUBLIC_APP_URL` – fallback app URL if different
- `NEXTAUTH_URL` – NextAuth base URL
- `GEMINI_API_KEY` – Google Gemini key
- `NEXT_PUBLIC_UMAMI_SCRIPT_URL` – Umami script URL (e.g., https://umami.yourdomain.com/script.js)
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` – Umami website ID (UUID)
- `SENTRY_DSN` – Sentry DSN for server/edge
- `NEXT_PUBLIC_SENTRY_DSN` – Sentry DSN for client

### Analytics & Monitoring

Umami loads automatically when `NEXT_PUBLIC_UMAMI_SCRIPT_URL` and `NEXT_PUBLIC_UMAMI_WEBSITE_ID` are present. You can track a custom event with:

```js
window.umami?.track('quiz_generated', { topic: '...', level: '...' })
```

Sentry is integrated via `@sentry/nextjs`. It initializes only if DSN envs are present. Adjust sample rates in `sentry.*.config.ts` as needed.
