import { z } from 'zod';

/**
 * Zod Schema for Multiple Choice Question (MCQ)
 * Strict validation: exactly 4 options, answerIndex 0-3
 */
export const MCQSchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
  options: z.array(z.string().min(1, "Option cannot be empty"))
    .length(4, "MCQ must have exactly 4 options"),
  answerIndex: z.number()
    .int("Answer index must be an integer")
    .min(0, "Answer index must be 0-3")
    .max(3, "Answer index must be 0-3"),
  explanation: z.string().optional()
});

/**
 * Zod Schema for Essay Question
 * Includes rubric for grading guidelines
 */
export const EssaySchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
  rubric: z.string().min(1, "Rubric cannot be empty")
});

/**
 * Zod Schema for Quiz Metadata
 * Level restricted to specific SMK grade levels
 */
export const QuizMetadataSchema = z.object({
  topic: z.string().min(1, "Topic cannot be empty"),
  level: z.enum(["X", "XI", "XII", "General"], {
    message: "Level must be X, XI, XII, or General"
  }),
  createdAt: z.string().datetime("Invalid datetime format"),
  updatedAt: z.string().datetime("Invalid datetime format").optional(),
  author: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft")
});

/**
 * Complete Quiz Payload Schema
 * Validates entire quiz structure from Gemini API
 */
export const QuizPayloadSchema = z.object({
  id: z.string().min(1, "Quiz ID cannot be empty"),
  metadata: QuizMetadataSchema,
  multipleChoice: z.array(MCQSchema)
    .min(1, "Quiz must have at least 1 MCQ")
    .max(50, "Quiz cannot have more than 50 MCQs"),
  essay: z.array(EssaySchema)
    .min(0, "Essay count cannot be negative")
    .max(10, "Quiz cannot have more than 10 essays")
}).strict(); // Reject unknown properties

/**
 * Creation schema: allow missing id (server generates) and ignore unknown keys
 * Useful for validating client payloads before save
 */
export const QuizCreateSchema = QuizPayloadSchema.omit({ id: true }).passthrough();

/**
 * Schema for Generate Quiz Request
 * Input validation for API calls
 */
export const GenerateQuizRequestSchema = z.object({
  text: z.string().min(10, "Text content must be at least 10 characters"),
  topic: z.string().min(1, "Topic cannot be empty"),
  level: z.enum(["X", "XI", "XII", "General"]),
  mcqCount: z.number()
    .int("MCQ count must be an integer")
    .min(1, "Must generate at least 1 MCQ")
    .max(50, "Cannot generate more than 50 MCQs"),
  essayCount: z.number()
    .int("Essay count must be an integer")
    .min(0, "Essay count cannot be negative")
    .max(10, "Cannot generate more than 10 essays")
}).strict();

// Export TypeScript types derived from Zod schemas
export type MCQ = z.infer<typeof MCQSchema>;
export type Essay = z.infer<typeof EssaySchema>;
export type QuizMetadata = z.infer<typeof QuizMetadataSchema>;
export type QuizPayload = z.infer<typeof QuizPayloadSchema>;
export type GenerateQuizRequest = z.infer<typeof GenerateQuizRequestSchema>;

/**
 * Helper function to ensure JSON data matches QuizPayload schema
 * Provides clean error messages for debugging Gemini API responses
 * 
 * @param json - Unknown JSON data from API response
 * @returns Validated QuizPayload object
 * @throws ZodError with detailed validation messages
 */
export function ensureQuizPayload(json: unknown): QuizPayload {
  try {
    return QuizPayloadSchema.parse(json);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Create detailed error message for debugging
      const errorMessages = error.issues.map(issue => {
        const path = issue.path.join('.');
        return `${path || 'root'}: ${issue.message}`;
      });
      
      throw new Error(
        `Quiz validation failed:\n${errorMessages.join('\n')}\n\n` +
        `Received data: ${JSON.stringify(json, null, 2)}`
      );
    }
    throw error;
  }
}

/**
 * Helper: validate payload when creating a quiz (id may be absent)
 */
export function ensureQuizPayloadForCreate(json: unknown): Omit<QuizPayload, 'id'> {
  try {
    return QuizCreateSchema.parse(json) as Omit<QuizPayload, 'id'>;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(issue => {
        const path = issue.path.join('.');
        return `${path || 'root'}: ${issue.message}`;
      });
      throw new Error(
        `Quiz (create) validation failed:\n${errorMessages.join('\n')}\n\n` +
        `Received data: ${JSON.stringify(json, null, 2)}`
      );
    }
    throw error;
  }
}

/**
 * Helper function to validate Generate Quiz Request
 * 
 * @param data - Request data to validate
 * @returns Validated GenerateQuizRequest object
 * @throws ZodError with detailed validation messages
 */
export function ensureGenerateQuizRequest(data: unknown): GenerateQuizRequest {
  try {
    return GenerateQuizRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(issue => {
        const path = issue.path.join('.');
        return `${path || 'root'}: ${issue.message}`;
      });
      
      throw new Error(
        `Request validation failed:\n${errorMessages.join('\n')}`
      );
    }
    throw error;
  }
}

/**
 * Helper function to validate partial quiz updates
 * Allows partial validation for quiz editing scenarios
 */
export const PartialQuizPayloadSchema = QuizPayloadSchema.partial({
  id: true,
  metadata: true
}).extend({
  metadata: QuizMetadataSchema.partial()
});

export type PartialQuizPayload = z.infer<typeof PartialQuizPayloadSchema>;

/**
 * Helper to validate quiz updates
 */
export function ensurePartialQuizPayload(json: unknown): PartialQuizPayload {
  try {
    return PartialQuizPayloadSchema.parse(json);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(issue => {
        const path = issue.path.join('.');
        return `${path || 'root'}: ${issue.message}`;
      });
      
      throw new Error(
        `Partial quiz validation failed:\n${errorMessages.join('\n')}`
      );
    }
    throw error;
  }
}

// Utility schemas for common validations
export const QuizIdSchema = z.string().min(1, "Quiz ID cannot be empty");
export const TopicSchema = z.string().min(1, "Topic cannot be empty").max(100, "Topic too long");
export const LevelSchema = z.enum(["X", "XI", "XII", "General"]);

// Export validation helpers
export const validateQuizId = (id: unknown) => QuizIdSchema.parse(id);
export const validateTopic = (topic: unknown) => TopicSchema.parse(topic);
export const validateLevel = (level: unknown) => LevelSchema.parse(level);