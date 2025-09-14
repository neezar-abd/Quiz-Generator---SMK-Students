/**
 * Server-side text extraction utilities for PDF, DOCX, and TXT files
 * Supports file upload processing before sending to Gemini AI
 */

import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

import { SUPPORTED_EXTENSIONS, SUPPORTED_MIME_TYPES, SupportedFileType } from '@/lib/fileConstants';

/**
 * File input interface for extraction
 */
export interface FileInput {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

/**
 * Extract text from PDF buffer using pdf-parse
 * @param buffer PDF file buffer
 * @returns Promise<string> Extracted plain text
 */
export async function extractPdf(buffer: Buffer): Promise<string> {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error('PDF buffer is empty or invalid');
    }

    console.log(`📄 Extracting text from PDF (${buffer.length} bytes)`);
    const data = await pdfParse(buffer);
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('PDF contains no extractable text (may be image-based)');
    }

    console.log(`✅ PDF extraction successful: ${data.numpages} pages, ${data.text.length} characters`);
    return data.text;

  } catch (error) {
    console.error('PDF extraction failed:', error);
    
    if (error instanceof Error) {
      // Provide specific error messages for common PDF issues
      if (error.message.includes('Invalid PDF')) {
        throw new Error('Invalid or corrupted PDF file');
      }
      if (error.message.includes('password')) {
        throw new Error('PDF is password protected and cannot be processed');
      }
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
    
    throw new Error('Unknown error occurred during PDF extraction');
  }
}

/**
 * Extract text from DOCX buffer using mammoth
 * Falls back to simple parsing if mammoth fails
 * @param buffer DOCX file buffer  
 * @returns Promise<string> Extracted plain text
 */
export async function extractDocx(buffer: Buffer): Promise<string> {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error('DOCX buffer is empty or invalid');
    }

    console.log(`📝 Extracting text from DOCX (${buffer.length} bytes)`);
    
    // Try mammoth first (best quality extraction)
    try {
      const result = await mammoth.extractRawText({ buffer });
      
      if (result.messages.length > 0) {
        console.warn('DOCX extraction warnings:', result.messages.map(m => m.message));
      }
      
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('DOCX contains no extractable text');
      }

      console.log(`✅ DOCX extraction successful: ${result.value.length} characters`);
      return result.value;

    } catch (mammothError) {
      console.warn('Mammoth extraction failed, attempting fallback:', mammothError);
      
      // TODO: Implement simple DOCX parsing fallback
      // For now, we'll try a basic approach for .doc files or corrupted .docx
      const text = await extractDocxFallback(buffer);
      
      if (text && text.trim().length > 0) {
        console.log('⚠️ DOCX fallback extraction successful');
        return text;
      }
      
      throw mammothError;
    }

  } catch (error) {
    console.error('DOCX extraction failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not a valid')) {
        throw new Error('Invalid or corrupted Word document');
      }
      throw new Error(`DOCX extraction failed: ${error.message}`);
    }
    
    throw new Error('Unknown error occurred during DOCX extraction');
  }
}

/**
 * Fallback DOCX extraction for legacy .doc files or corrupted .docx
 * Simple text extraction from binary data (limited functionality)
 * TODO: Implement more robust parsing or use additional library
 */
async function extractDocxFallback(buffer: Buffer): Promise<string> {
  try {
    console.log('🔄 Attempting DOCX fallback extraction...');
    
    // Convert buffer to string and try to extract readable text
    // This is a very basic approach and may not work for all files
    const text = buffer.toString('utf8');
    
    // Remove control characters and extract readable text
    const cleanText = text
      .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Remove control chars
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ' ') // Keep printable chars
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Check if we got meaningful text (at least some alphabetic characters)
    const meaningfulText = cleanText.match(/[a-zA-Z]{3,}/g);
    
    if (meaningfulText && meaningfulText.length > 5) {
      console.log('⚠️ Fallback extraction found some text, but quality may be poor');
      return cleanText.substring(0, 5000); // Limit to reasonable length
    }
    
    throw new Error('Fallback extraction found no meaningful text');
    
  } catch (error) {
    console.warn('Fallback DOCX extraction failed:', error);
    throw new Error('Both primary and fallback DOCX extraction methods failed');
  }
}

/**
 * Extract text from TXT buffer with UTF-8 encoding
 * @param buffer TXT file buffer
 * @returns Promise<string> Extracted plain text
 */
export async function extractTxt(buffer: Buffer): Promise<string> {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error('TXT buffer is empty or invalid');
    }

    console.log(`📄 Extracting text from TXT (${buffer.length} bytes)`);
    
    // Try UTF-8 first
    let text = buffer.toString('utf8');
    
    // Check for invalid UTF-8 sequences (replacement characters)
    if (text.includes('�')) {
      console.warn('Invalid UTF-8 detected, trying latin1 encoding');
      text = buffer.toString('latin1');
    }
    
    if (!text || text.trim().length === 0) {
      throw new Error('TXT file is empty or contains no readable text');
    }

    console.log(`✅ TXT extraction successful: ${text.length} characters`);
    return text;

  } catch (error) {
    console.error('TXT extraction failed:', error);
    
    if (error instanceof Error) {
      throw new Error(`TXT extraction failed: ${error.message}`);
    }
    
    throw new Error('Unknown error occurred during TXT extraction');
  }
}

/**
 * Detect file type and extract text accordingly
 * @param file File object or FileInput with buffer, mimeType, and filename
 * @returns Promise<string> Normalized and extracted text
 */
export async function detectAndExtract(file: File | FileInput): Promise<string> {
  try {
    let buffer: Buffer;
    let mimeType: string;
    let filename: string;
    
    // Handle different input types
    if (file instanceof File) {
      // Convert File to Buffer for server-side processing
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      mimeType = file.type;
      filename = file.name;
    } else {
      // FileInput interface
      buffer = file.buffer;
      mimeType = file.mimeType;
      filename = file.filename;
    }

    console.log(`🔍 Detecting file type: ${filename} (${mimeType})`);
    
    // Detect file type by MIME type first, then by extension
    const fileType = detectFileType(mimeType, filename);
    
    let extractedText: string;
    
    switch (fileType) {
      case 'pdf':
        extractedText = await extractPdf(buffer);
        break;
        
      case 'docx':
      case 'doc':
        extractedText = await extractDocx(buffer);
        break;
        
      case 'txt':
        extractedText = await extractTxt(buffer);
        break;
        
      default:
        throw new Error(`Unsupported file type: ${fileType} (${mimeType})`);
    }
    
    // Normalize whitespace and clean up text
    const normalizedText = normalizeText(extractedText);
    
    if (normalizedText.length < 10) {
      throw new Error('Extracted text is too short to generate meaningful quiz questions');
    }
    
    console.log(`✅ Text extraction complete: ${normalizedText.length} characters`);
    return normalizedText;

  } catch (error) {
    console.error('File extraction failed:', error);
    
    if (error instanceof Error) {
      throw error; // Re-throw with original message
    }
    
    throw new Error('Unknown error occurred during file extraction');
  }
}

/**
 * Detect file type based on MIME type and filename extension
 */
function detectFileType(mimeType: string, filename: string): SupportedFileType {
  // Normalize MIME type
  const normalizedMime = mimeType.toLowerCase();
  
  // Check MIME type first
  if (normalizedMime.includes('pdf')) {
    return 'pdf';
  }
  
  if (normalizedMime.includes('wordprocessingml') || 
      normalizedMime.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) {
    return 'docx';
  }
  
  if (normalizedMime.includes('msword') || 
      normalizedMime.includes('vnd.ms-word')) {
    return 'doc';
  }
  
  if (normalizedMime.includes('text/plain')) {
    return 'txt';
  }
  
  // Fallback to file extension
  const extension = filename.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'docx':
      return 'docx';
    case 'doc':
      return 'doc';
    case 'txt':
      return 'txt';
    default:
      throw new Error(`Unsupported file extension: .${extension}`);
  }
}

/**
 * Normalize extracted text for better processing
 * @param text Raw extracted text
 * @returns Cleaned and normalized text
 */
function normalizeText(text: string): string {
  return text
    // Replace multiple whitespace with single space
    .replace(/\s+/g, ' ')
    // Remove excessive line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace
    .trim()
    // Ensure reasonable length (max 10,000 chars for API limits)
    .substring(0, 10000);
}

/**
 * Validate if file is supported for text extraction
 * @param mimeType File MIME type
 * @param filename File name with extension
 * @returns boolean True if supported
 */
export function isSupportedFile(mimeType: string, filename: string): boolean {
  try {
    detectFileType(mimeType, filename);
    return true;
  } catch {
    return false;
  }
}

// Re-export constants from shared module for backward compatibility
export { SUPPORTED_MIME_TYPES, SUPPORTED_EXTENSIONS } from '@/lib/fileConstants';