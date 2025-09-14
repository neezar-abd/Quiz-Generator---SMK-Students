# Database Persistence Documentation

## Overview
The AI Quiz Generator now includes comprehensive database persistence using **Supabase PostgreSQL** and **Prisma ORM**. This allows users to save, manage, and retrieve quizzes across sessions.

## Architecture

### Database Schema
```prisma
// User model for multi-tenancy
model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  name      String?
  createdAt DateTime @default(now())
  quizzes   Quiz[]
}

// Main Quiz model
model Quiz {
  id                String       @id @default(cuid())
  userId            String
  title             String
  description       String?
  topic             String
  level             QuizLevel
  status            QuizStatus   @default(DRAFT)
  totalQuestions    Int
  estimatedDuration Int?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  mcqQuestions      QuestionMCQ[]
  essayQuestions    QuestionEssay[]
}

// Multiple Choice Questions
model QuestionMCQ {
  id          String   @id @default(cuid())
  quizId      String
  question    String
  options     String[] // Array of 4 options
  answerIndex Int      // 0, 1, 2, or 3
  explanation String?
  createdAt   DateTime @default(now())
  
  quiz        Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
}

// Essay Questions
model QuestionEssay {
  id        String   @id @default(cuid())
  quizId    String
  question  String
  rubric    String
  createdAt DateTime @default(now())
  
  quiz      Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
}
```

### API Endpoints

#### Quiz CRUD Operations
- `POST /api/quizzes` - Create new quiz
- `GET /api/quizzes` - List all quizzes (with filtering)
- `GET /api/quizzes/[id]` - Get specific quiz
- `PUT /api/quizzes/[id]` - Update quiz
- `DELETE /api/quizzes/[id]` - Delete quiz

#### Request/Response Examples

**Create Quiz (POST /api/quizzes)**
```json
{
  "metadata": {
    "topic": "Electronics Basics",
    "level": "XI",
    "status": "draft"
  },
  "multipleChoice": [
    {
      "question": "What is Ohm's Law?",
      "options": ["V=IR", "P=VI", "Q=CV", "F=ma"],
      "answerIndex": 0,
      "explanation": "Ohm's Law states that voltage equals current times resistance."
    }
  ],
  "essay": [
    {
      "question": "Explain the working principle of a transistor.",
      "rubric": "Should cover: amplification, switching, base-collector-emitter structure"
    }
  ]
}
```

**List Quizzes (GET /api/quizzes?level=XI&status=published&page=1&limit=10)**
```json
{
  "success": true,
  "data": [
    {
      "id": "quiz_123",
      "metadata": {
        "topic": "Electronics Basics",
        "level": "XI",
        "status": "published",
        "createdAt": "2024-01-15T10:30:00Z"
      },
      "multipleChoice": [...],
      "essay": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

## Implementation Components

### 1. Database Client (`src/server/db.ts`)
- Prisma client configuration
- Connection management
- Transaction helpers
- Health check utilities

### 2. Quiz Mapper (`src/server/quizMapper.ts`)
- QuizPayload ↔ Database model transformations
- Atomic CRUD operations
- Data validation and sanitization
- Relationship management

### 3. API Routes (`src/app/api/quizzes/`)
- RESTful endpoints with proper error handling
- Request validation using Zod schemas
- Pagination and filtering support
- Atomic transactions for data integrity

### 4. Quiz Store (`src/hooks/useQuizStore.tsx`)
- React Context for state management
- API integration methods
- Local state synchronization
- Error handling and loading states

### 5. API Client (`src/lib/api/quizApi.ts`)
- Centralized HTTP client for quiz operations
- Type-safe API calls
- Error handling and response parsing
- Helper functions for common operations

## Features

### Data Persistence
- ✅ Save quizzes to database after generation
- ✅ Load quizzes in dashboard from database
- ✅ Edit and update existing quizzes
- ✅ Delete quizzes with cascade deletion
- ✅ Filter and search quizzes

### Data Integrity
- ✅ Atomic transactions for quiz + questions creation
- ✅ Foreign key constraints with cascade deletion
- ✅ Data validation at API and database levels
- ✅ Type-safe operations throughout the stack

### Performance
- ✅ Efficient queries with proper indexing
- ✅ Pagination for large datasets
- ✅ Connection pooling through Supabase
- ✅ Optimistic updates in UI

## Usage Examples

### Saving a Quiz After Generation
```typescript
// In upload page after quiz generation
const handleSaveToDashboard = async () => {
  try {
    await actions.saveQuiz(generatedQuiz);
    router.push('/dashboard');
  } catch (error) {
    console.error('Failed to save quiz:', error);
  }
};
```

### Loading Quizzes in Dashboard
```typescript
// In dashboard page
useEffect(() => {
  actions.loadQuizzes();
}, []);
```

### Filtering Quizzes
```typescript
// Get quizzes by level
const quizzes = await QuizApiClient.getQuizzes({ 
  level: 'XI',
  status: 'published',
  page: 1,
  limit: 10
});
```

### Updating a Quiz
```typescript
// Update quiz metadata
await actions.updateQuiz({
  ...existingQuiz,
  metadata: {
    ...existingQuiz.metadata,
    status: 'published'
  }
});
```

## Database Setup

### Prerequisites
1. Supabase account and project
2. Database URL in environment variables
3. Prisma CLI installed

### Setup Steps
```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL

# 3. Run database setup script
node scripts/setup-db.js

# 4. Start development server
npm run dev
```

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Optional: Prisma Studio
PRISMA_STUDIO_PORT=5555
```

## Migration Guide

### From Mock Data to Database
If upgrading from the mock data version:

1. **Backup existing quizzes**: Export any important quizzes from the dashboard
2. **Run database setup**: Follow setup steps above
3. **Update environment**: Add DATABASE_URL to .env
4. **Test functionality**: Verify CRUD operations work
5. **Import data**: Re-create important quizzes through the UI

### Schema Updates
For future schema changes:
```bash
# Create migration
npx prisma migrate dev --name add_new_feature

# Push to production
npx prisma migrate deploy
```

## Error Handling

### Common Issues
1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Verify network connectivity
   - Ensure database is running

2. **Migration Errors**
   - Check Prisma schema syntax
   - Resolve schema conflicts
   - Use `prisma db push` for development

3. **API Errors**
   - Check request payload format
   - Verify authentication (if implemented)
   - Review server logs for details

### Debugging Tools
- **Prisma Studio**: Visual database browser (`npx prisma studio`)
- **Database Logs**: Check Supabase dashboard logs
- **API Testing**: Use Postman or curl for API endpoint testing
- **Network Tab**: Browser dev tools for client-side debugging

## Performance Considerations

### Database Optimization
- Proper indexing on frequently queried fields
- Connection pooling through Supabase
- Efficient query patterns with Prisma

### API Optimization
- Pagination for large result sets
- Selective field loading
- Caching strategies (future enhancement)

### Client Optimization
- Optimistic updates for better UX
- Local state management with React Context
- Debounced search and filtering

## Security

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention through Prisma
- Proper error message sanitization
- Environment variable protection

### Access Control
- User-based data isolation (multi-tenancy ready)
- API endpoint validation
- Cascade deletion for data cleanup

## Future Enhancements

### Planned Features
- [ ] User authentication and authorization
- [ ] Quiz sharing and collaboration
- [ ] Import/export functionality
- [ ] Analytics and usage tracking
- [ ] Caching layer for improved performance
- [ ] Real-time updates with WebSockets
- [ ] Backup and restore functionality

### Scalability Improvements
- [ ] Database sharding strategies
- [ ] CDN integration for static assets
- [ ] Microservices architecture
- [ ] Queue-based processing for large files

## Troubleshooting

### Database Issues
```bash
# Reset database (development only)
npx prisma migrate reset

# Force push schema changes
npx prisma db push --force-reset

# Check database connection
npx prisma db seed
```

### API Issues
```bash
# Check API endpoints
curl -X GET http://localhost:3000/api/quizzes

# Test database connection
npm run dev
# Check console for connection logs
```

### Build Issues
```bash
# Generate Prisma client
npx prisma generate

# Check TypeScript errors
npm run build

# Fix linting issues
npm run lint -- --fix
```