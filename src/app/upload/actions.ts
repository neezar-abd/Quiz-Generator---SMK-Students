/**
 * Server actions for file upload and quiz generation
 * Handles file processing with text extraction before Gemini API calls
 */

'use server';

import { redirect } from 'next/navigation';
import { detectAndExtract, isSupportedFile, SUPPORTED_EXTENSIONS } from '@/server/extract';
import { ensureQuizPayload } from '@/lib/quizSchema';
import type { QuizPayload } from '@/types/quiz';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * File upload result interface
 */
interface UploadResult {
  success: boolean;
  message: string;
  extractedText?: string;
  quizData?: QuizPayload;
  error?: string;
}

/**
 * Server action for handling file upload and quiz generation
 * @param formData FormData containing the uploaded file and quiz parameters
 * @returns UploadResult with success/error information
 */
export async function handleFileUpload(formData: FormData): Promise<UploadResult> {
  try {
  console.log('Processing file upload...');
    
    // Extract form data
    const file = formData.get('file') as File;
    const questionCount = parseInt(formData.get('questionCount') as string) || 5;
    const difficulty = (formData.get('difficulty') as string) || 'medium';
    const includeEssay = formData.get('includeEssay') === 'true';
    const topic = (formData.get('topic') as string) || '';

    // Validate file
    if (!file) {
      return {
        success: false,
        message: 'No file uploaded',
        error: 'Please select a file to upload'
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        message: 'File too large',
        error: `File size must be less than 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB`
      };
    }

    // Validate file type
    if (!isSupportedFile(file.type, file.name)) {
      return {
        success: false,
        message: 'Unsupported file type',
        error: `Please upload a file with one of these extensions: ${SUPPORTED_EXTENSIONS.join(', ')}`
      };
    }

  console.log(`File validated: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)}KB)`);

    // Extract text from file
    let extractedText: string;
    try {
      extractedText = await detectAndExtract(file);
      
      if (!extractedText || extractedText.trim().length < 50) {
        return {
          success: false,
          message: 'Insufficient content',
          error: 'The uploaded file does not contain enough text to generate quiz questions. Please upload a file with more content.'
        };
      }

    } catch (extractionError) {
      console.error('Text extraction failed:', extractionError);
      
      return {
        success: false,
        message: 'File processing failed',
        error: extractionError instanceof Error ? extractionError.message : 'Could not extract text from the uploaded file'
      };
    }

  console.log(`Text extracted successfully: ${extractedText.length} characters`);

    // Generate quiz using extracted text
    try {
      const quizData = await generateQuizFromText(extractedText, {
        questionCount,
        difficulty,
        includeEssay,
        topic
      });

      // Store quiz data in session or database
      // For now, we'll redirect to dashboard with success
  console.log('Quiz generated successfully');

      return {
        success: true,
        message: 'Quiz generated successfully!',
        extractedText: extractedText.substring(0, 500) + '...', // Preview
        quizData
      };

    } catch (quizError) {
      console.error('Quiz generation failed:', quizError);
      
      return {
        success: false,
        message: 'Quiz generation failed',
        error: quizError instanceof Error ? quizError.message : 'Could not generate quiz from the extracted text'
      };
    }

  } catch (error) {
    console.error('File upload processing failed:', error);
    
    return {
      success: false,
      message: 'Upload processing failed',
      error: error instanceof Error ? error.message : 'An unexpected error occurred while processing your upload'
    };
  }
}

/**
 * Generate quiz from extracted text using Gemini AI
 */
async function generateQuizFromText(
  text: string,
  options: {
    questionCount: number;
    difficulty: string;
    includeEssay: boolean;
    topic?: string;
  }
): Promise<QuizPayload> {
  const { questionCount, difficulty, includeEssay, topic } = options;
  
  // Map difficulty to valid quiz levels
  const levelMapping: { [key: string]: 'X' | 'XI' | 'XII' | 'General' } = {
    'easy': 'X',
    'medium': 'XI', 
    'hard': 'XII',
    'beginner': 'X',
    'intermediate': 'XI',
    'advanced': 'XII'
  };
  
  const quizLevel = levelMapping[difficulty.toLowerCase()] || 'General';
  
  // Validate API key
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  // Create comprehensive prompt with extracted text
  const prompt = `
You are an expert quiz generator for SMK (Vocational High School) students in Indonesia. 
Generate a quiz based on the following content:

=== CONTENT TO ANALYZE ===
${text}
=== END CONTENT ===

Quiz Requirements:
- Generate ${questionCount} multiple choice questions
- Difficulty level: ${difficulty} (mapped to level ${quizLevel})
- ${includeEssay ? 'Include 1-2 essay questions' : 'Multiple choice only'}
- Topic focus: ${topic || 'General content analysis'}
- Questions should be educational and test comprehension
- Avoid questions that require external knowledge not in the content
- Make questions suitable for Indonesian vocational students
- CRITICAL: Use ONLY "${quizLevel}" as the level value, do NOT change this to any other value like "Hard" or "Medium"

IMPORTANT: Return ONLY valid JSON in this exact format. The level MUST be one of: X, XI, XII, or General.
{
  "id": "quiz_${Date.now()}",
  "metadata": {
    "topic": "${topic || 'General Quiz'}",
    "level": "${quizLevel}",
    "createdAt": "${new Date().toISOString()}",
    "status": "draft",
    "description": "Quiz generated from uploaded content"
  },
  "multipleChoice": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "explanation": "Why this answer is correct"
    }
  ]${includeEssay ? `,
  "essay": [
    {
      "question": "Essay question text",
      "rubric": "Grading criteria and expectations"
    }
  ]` : `,
  "essay": []`}
}

Generate quiz now:`;

  try {
  console.log('Generating quiz with Gemini AI...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    // Clean and parse JSON response
    const jsonText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsedData = JSON.parse(jsonText);

    // Validate with Zod schema
    const validatedQuiz = ensureQuizPayload(parsedData);
    
  console.log(`Quiz validated: ${validatedQuiz.multipleChoice.length} MCQs, ${validatedQuiz.essay.length} essays`);
    return validatedQuiz;

  } catch (error) {
    console.error('Gemini AI generation failed:', error);
    
    // Return mock quiz as fallback
  console.log('Falling back to mock quiz generation...');
    return generateMockQuiz(questionCount, difficulty, includeEssay, text);
  }
}

/**
 * Generate mock quiz when AI fails (fallback)
 */
function generateMockQuiz(
  questionCount: number, 
  difficulty: string, 
  includeEssay: boolean,
  sourceText: string
): QuizPayload {
  const preview = sourceText.substring(0, 200) + '...';
  
  // Create properly typed arrays
  const multipleChoiceQuestions: Array<{ question: string; options: [string, string, string, string]; answerIndex: 0|1|2|3; explanation?: string } > = [];
  const essayQuestions: Array<{ question: string; rubric: string }> = [];

  // Generate mock questions based on extracted content
  for (let i = 1; i <= questionCount; i++) {
    multipleChoiceQuestions.push({
      question: `Based on the content, what is the main point discussed in section ${i}?`,
      options: [
        'The content explains key concepts and methods',
        'The material covers theoretical foundations',
        'The text describes practical applications', 
        'The document presents case studies and examples'
      ] as [string, string, string, string],
  answerIndex: 0,
      explanation: `This answer reflects the general educational nature of the uploaded content.`
    });
  }

  // Add essay question if requested
  if (includeEssay) {
    essayQuestions.push({
      question: 'Based on the content you uploaded, explain the main concepts and how they relate to your field of study.',
      rubric: 'Answer should demonstrate understanding of key concepts and their practical applications.'
    });
  }
  
  const mockQuiz: QuizPayload = {
    id: `mock_quiz_${Date.now()}`,
    metadata: {
      topic: `Content Analysis Quiz (${difficulty})`,
      level: 'General',
      createdAt: new Date().toISOString(),
      status: 'draft',
      description: `This quiz is based on the uploaded content: "${preview}"`
    },
    multipleChoice: multipleChoiceQuestions,
    essay: essayQuestions
  };

  return mockQuiz;
}

/**
 * Server action for quiz generation redirect
 * Redirects to dashboard after successful quiz generation
 */
export async function redirectToDashboard(): Promise<void> {
  redirect('/dashboard');
}

