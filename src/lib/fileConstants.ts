/**
 * Shared constants for file validation
 * Can be safely imported by both client and server code
 */

/**
 * Supported file extensions for text extraction
 */
export const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'doc', 'txt'];

/**
 * Supported MIME types for file uploads
 */
export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'text/plain' // .txt
];

/**
 * Maximum file size in bytes (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * File type definitions
 */
export type SupportedFileType = typeof SUPPORTED_EXTENSIONS[number];
export type SupportedMimeType = typeof SUPPORTED_MIME_TYPES[number];