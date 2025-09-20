import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { ensureQuizPayload } from '@/lib/quizSchema';

// Enhanced request schema with minimum text length requirement
const GenerateQuizApiRequestSchema = z.object({
  text: z.string()
    .min(50, "Text content must be at least 50 characters for meaningful quiz generation")
    .max(10000, "Text content too long (max 10,000 characters)"),
  topic: z.string()
    .min(1, "Topic cannot be empty")
    .max(100, "Topic too long (max 100 characters)"),
  level: z.enum(["X", "XI", "XII", "General"]),
  mcqCount: z.number()
    .int("MCQ count must be an integer")
    .min(1, "Must generate at least 1 MCQ")
    .max(20, "Cannot generate more than 20 MCQs per request"),
  essayCount: z.number()
    .int("Essay count must be an integer")
    .min(0, "Essay count cannot be negative")
    .max(5, "Cannot generate more than 5 essays per request")
}).strict();

// Initialize Gemini AI (will be null if no API key)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

/**
 * Sanitize user input to prevent prompt injection
 */
function sanitizeInput(text: string): string {
  // Remove potential prompt injection patterns while preserving educational content
  return text
    .replace(/```/g, '') // Remove code fences
    .replace(/\n{3,}/g, '\n\n') // Normalize excessive newlines
    .trim();
}

/**
 * Generate strict JSON prompt for Gemini
 */
function createQuizPrompt(text: string, topic: string, level: string, mcqCount: number, essayCount: number): string {
  const sanitizedText = sanitizeInput(text);
  
  return `You are an expert educational content creator for Indonesian SMK (Vocational High School) students. 

TASK: Create a quiz based on the provided learning material.

LEARNING MATERIAL:
${sanitizedText}

REQUIREMENTS:
- Topic: ${topic}
- Level: ${level} (Indonesian SMK level)
- Generate exactly ${mcqCount} multiple choice questions
- Generate exactly ${essayCount} essay questions
- Questions must be relevant to the provided material
- Use Indonesian language for questions
- MCQ options must be exactly 4 choices each
- Answer index must be 0, 1, 2, or 3 (zero-based)
- Essay questions should include detailed rubrics for grading

CRITICAL: Respond with ONLY a valid JSON object matching this exact structure. No explanations, no markdown code fences, no additional text.

{
  "id": "quiz_[timestamp]",
  "metadata": {
    "topic": "${topic}",
    "level": "${level}",
    "createdAt": "[current_iso_datetime]",
    "status": "draft"
  },
  "multipleChoice": [
    {
      "question": "Your question here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "explanation": "Why this answer is correct"
    }
  ],
  "essay": [
    {
      "question": "Your essay question here?",
      "rubric": "Detailed grading criteria and expected key points"
    }
  ]
}

JSON ONLY - NO OTHER TEXT:`;
}

/**
 * Generate mock quiz for development (when no API key is set)
 */
function generateMockQuiz(topic: string, level: string, mcqCount: number, essayCount: number): unknown {
  const mockMCQs = Array.from({ length: mcqCount }, (_, i) => ({
    question: `Sample MCQ ${i + 1} about ${topic}?`,
    options: [
      "Option A - Correct answer",
      "Option B - Incorrect",
      "Option C - Incorrect", 
      "Option D - Incorrect"
    ],
    answerIndex: 0,
    explanation: `This explains why Option A is correct for ${topic}.`
  }));

  const mockEssays = Array.from({ length: essayCount }, (_, i) => ({
    question: `Sample essay question ${i + 1}: Explain the key concepts of ${topic}.`,
    rubric: `Student should demonstrate understanding of ${topic} fundamentals, provide clear examples, and show practical application knowledge.`
  }));

  return {
    id: `quiz-${Date.now()}`,
    metadata: {
      topic,
      level,
      createdAt: new Date().toISOString(),
      status: "draft"
    },
    multipleChoice: mockMCQs,
    essay: mockEssays
  };
}

/**
 * Clean and parse Gemini response
 */
function cleanAndParseResponse(response: string): unknown {
  let cleaned = response.trim();
  
  // Remove common markdown artifacts
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  
  // Remove any text before first { or after last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error('No valid JSON object found in response');
  }
  
  cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn('JSON parse error:', error);
    console.warn('Cleaned response:', cleaned.substring(0, 500) + '...');
    throw new Error('Invalid JSON format in AI response');
  }
}

/**
 * POST /api/generate-quiz
 * Generate quiz using Gemini AI
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI service not available' },
        { status: 500 }
      );
    }
    
    // 2. Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // 3. Validate request structure
    let validatedRequest;
    try {
      validatedRequest = GenerateQuizApiRequestSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((issue: z.ZodIssue) => 
          `${issue.path.join('.')}: ${issue.message}`
        ).join('; ');
        
        return NextResponse.json(
          { error: `Validation failed: ${errorMessages}` },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Request validation failed' },
        { status: 400 }
      );
    }
    
    // 4. Generate quiz (with Gemini AI or mock)
    console.log(`Generating quiz: ${validatedRequest.topic} (${validatedRequest.level}) - ${validatedRequest.mcqCount} MCQ + ${validatedRequest.essayCount} Essay`);
    
    let parsedResponse: unknown;
    
    if (genAI) {
      // Use real Gemini AI
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      });
      
      const prompt = createQuizPrompt(
        validatedRequest.text,
        validatedRequest.topic,
        validatedRequest.level,
        validatedRequest.mcqCount,
        validatedRequest.essayCount
      );
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      if (!responseText) {
        console.warn('Empty response from Gemini AI');
        return NextResponse.json(
          { error: 'AI service returned empty response' },
          { status: 500 }
        );
      }
      
      // Parse AI response
      try {
        parsedResponse = cleanAndParseResponse(responseText);
      } catch (error) {
        console.warn('Failed to parse AI response:', error);
        console.warn('Raw response (first 200 chars):', responseText.substring(0, 200));
        
        return NextResponse.json(
          { error: 'Invalid response format from AI service' },
          { status: 500 }
        );
      }
    } else {
      // Use mock data for development
  console.log('Using mock data (no GEMINI_API_KEY provided)');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      parsedResponse = generateMockQuiz(
        validatedRequest.topic,
        validatedRequest.level,
        validatedRequest.mcqCount,
        validatedRequest.essayCount
      );
    }
    
    // 5. Validate response against quiz schema
    let validatedQuiz;
    try {
      validatedQuiz = ensureQuizPayload(parsedResponse);
    } catch (error) {
      console.warn('Quiz validation failed:', error);
      console.warn('Parsed response:', JSON.stringify(parsedResponse, null, 2).substring(0, 500));
      
      return NextResponse.json(
        { error: 'AI generated invalid quiz format' },
        { status: 500 }
      );
    }
    
    // 6. Success response
    const processingTime = Date.now() - startTime;
    console.log(`Quiz generated successfully in ${processingTime}ms: ${validatedQuiz.id}`);
    
    return NextResponse.json(validatedQuiz, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    // 7. Handle unexpected errors
    const processingTime = Date.now() - startTime;
    console.error(`Quiz generation failed after ${processingTime}ms:`, error);
    
    // Don't leak internal error details to client
    return NextResponse.json(
      { error: 'Internal server error during quiz generation' },
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate quiz.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate quiz.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate quiz.' },
    { status: 405 }
  );
}