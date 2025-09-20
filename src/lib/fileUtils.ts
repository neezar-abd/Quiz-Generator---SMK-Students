/**
 * Client-side file validation utilities
 * These functions run in the browser and don't require server actions
 */

import { SUPPORTED_EXTENSIONS, SUPPORTED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/fileConstants';

/**
 * Check if file is supported for text extraction (client-side version)
 * @param mimeType File MIME type
 * @param filename File name with extension
 * @returns boolean True if supported
 */
function isSupportedFileClient(mimeType: string, filename: string): boolean {
  // Check MIME type first
  const normalizedMime = mimeType.toLowerCase();
  const isValidMimeType = SUPPORTED_MIME_TYPES.some(supportedType => 
    normalizedMime === supportedType.toLowerCase()
  );

  if (isValidMimeType) {
    return true;
  }

  // Fallback to file extension
  const extension = filename.toLowerCase().split('.').pop();
  return extension ? SUPPORTED_EXTENSIONS.includes(extension) : false;
}

/**
 * Validate file before upload (client-side helper)
 * @param file File object to validate
 * @returns Validation result with success status and optional error message
 */
export function validateFileClient(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is 10MB, but your file is ${(file.size / 1024 / 1024).toFixed(1)}MB`
    };
  }

  // Check file type
  if (!isSupportedFileClient(file.type, file.name)) {
    return {
      valid: false,
      error: `Unsupported file type. Please use: ${SUPPORTED_EXTENSIONS.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Get file type icon based on extension
 */
export function getFileIcon(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop();
  switch (extension) {
    case 'pdf': return 'PDF';
    case 'doc':
    case 'docx': return 'DOC';
    case 'txt': return 'TXT';
    default: return 'FILE';
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file extension is supported
 */
export function isValidFileExtension(fileName: string): boolean {
  const extension = fileName.toLowerCase().split('.').pop() || '';
  return SUPPORTED_EXTENSIONS.includes(extension);
}