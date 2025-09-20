# AI Quiz Generator

A clean, minimalist frontend for an AI-powered quiz generation system designed for SMK (Vocational High School) students and teachers. Upload study materials and generate intelligent quizzes with AI assistance.

## Features

- **Clean Black & White UI**: Minimalist, professional design focused on usability
- **File Upload System**: Drag & drop interface for PDF, DOC, and DOCX files
- **AI-Powered Quiz Generation**: Transform documents into intelligent quizzes
- **Database Persistence**: Save and manage quizzes with Supabase PostgreSQL + Prisma
- **Quiz Management Dashboard**: Track, edit, and organize generated quizzes
- **Real-time CRUD Operations**: Create, read, update, and delete quizzes seamlessly
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Built with Modern Stack**: Next.js 14, TypeScript, Tailwind CSS, Prisma ORM

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Supabase PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS
- **Validation**: Zod schema validation
- **Code Quality**: ESLint configuration
- **Architecture**: Full-stack with API routes and database persistence

## Project Structure

```
src/
├── app/
│   ├── dashboard/page.tsx    # Quiz management dashboard
│   ├── upload/page.tsx       # File upload interface
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx             # Homepage with hero section
│   └── globals.css          # Global styles
└── components/
    ├── Navbar.tsx           # Navigation component
    └── Footer.tsx           # Footer component
```

## Pages Overview

### Home Page
- Hero section with compelling title and CTA
- Feature showcase with icons
- Clean, centered layout encouraging user engagement

### Upload Page
- Drag & drop file upload interface
- Support for PDF, DOC, DOCX formats
- AI analysis placeholder sections
- Real-time upload feedback

### Dashboard Page  
- Quiz statistics overview
- List of generated quizzes with status indicators
- Quick action buttons
- Progress tracking capabilities

## Getting Started

### Prerequisites

- Node.js (version 18+)
- npm or yarn package manager
- Supabase account (for database)

### Installation Steps

1. Clone the repository:

```bash
git clone <repository-url>
cd ai-quiz-generator
```

2. Create environment file:

```bash
cp .env.example .env.local
```

3. Add your database URL to `.env.local`:

```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

4. Install dependencies:

```bash
npm install
```

5. Set up the database:

```bash
node scripts/setup-db.js
```

6. Run the development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) to view the application

### Database Setup

The application uses Supabase PostgreSQL with Prisma ORM. For detailed setup instructions, see [DATABASE_PERSISTENCE.md](./docs/DATABASE_PERSISTENCE.md).

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Design Principles

- **Minimalist Aesthetic**: Black and white color scheme only
- **Mobile-First**: Responsive design starting from mobile devices  
- **Clean Typography**: System fonts with clear hierarchy
- **Consistent Spacing**: Tailwind's spacing system for uniformity
- **Accessible UI**: High contrast and keyboard navigation support

## Features Completed

- **Database Persistence**: Full CRUD operations with Supabase + Prisma
- **AI Quiz Generation**: Transform PDFs/documents into intelligent quizzes
- **Real-time Dashboard**: Save, edit, delete, and manage quizzes
- **API Routes**: RESTful endpoints for quiz operations
- **Type Safety**: Full TypeScript integration with Zod validation
- **Atomic Transactions**: Data integrity with database transactions

## Future Enhancements 🔮

- User authentication and multi-tenancy
- Quiz sharing and collaboration features
- Import/export functionality
- Analytics and usage tracking
- Real-time updates with WebSockets
- Advanced search and filtering

## Contributing 🤝

This is a frontend skeleton ready for backend integration. The codebase is structured for easy extension:

- Components are modular and reusable
- Pages use TypeScript for type safety
- Styling is consistent with Tailwind utilities
- Code is ESLint compliant

## License

Built for educational purposes as a frontend skeleton for AI quiz generation systems.
