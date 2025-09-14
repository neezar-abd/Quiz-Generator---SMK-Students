/**
 * Enhanced file upload component with validation for supported file types
 * Provides detailed error messages and file preview
 */

'use client';

import React, { useState, useCallback } from 'react';
import { SUPPORTED_EXTENSIONS, SUPPORTED_MIME_TYPES } from '@/lib/fileConstants';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileError: (error: string) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

interface FileValidation {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export default function FileUpload({ 
  onFileSelect, 
  onFileError,
  acceptedTypes = SUPPORTED_EXTENSIONS,
  maxSize = 10, // 10MB default
  className = '',
  disabled = false
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<FileValidation | null>(null);

  // Validate file against our criteria
  const validateFile = useCallback((file: File): FileValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      errors.push(`File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum allowed size (${maxSize}MB)`);
    }

    // Check file type by MIME type first
    const isValidMimeType = SUPPORTED_MIME_TYPES.some(mimeType => 
      file.type.toLowerCase() === mimeType.toLowerCase()
    );
    
    // Check file extension
    const fileExtension = file.name.toLowerCase().split('.').pop() || '';
    const isValidExtension = acceptedTypes.some(ext => 
      ext.toLowerCase() === fileExtension
    );

    if (!isValidMimeType && !isValidExtension) {
      errors.push(`Unsupported file type. Please use: ${acceptedTypes.join(', ')}`);
    } else if (!isValidMimeType && isValidExtension) {
      warnings.push(`File type detection may be unreliable. Ensure this is a valid ${fileExtension.toUpperCase()} file.`);
    }

    // Additional validations based on file type
    if (fileExtension === 'pdf' && file.size < 1024) {
      warnings.push('PDF file seems very small. Ensure it contains readable text, not just images.');
    }

    if (fileExtension === 'txt' && file.size > 5 * 1024 * 1024) {
      warnings.push('Large text files may take longer to process.');
    }

    if (['doc', 'docx'].includes(fileExtension) && file.size < 5 * 1024) {
      warnings.push('Word document seems very small. Ensure it contains substantial content.');
    }

    return {
      valid: errors.length === 0,
      error: errors.length > 0 ? errors.join(' ') : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }, [acceptedTypes, maxSize]);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const validation = validateFile(file);
    setValidationResult(validation);
    
    if (validation.valid) {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      setSelectedFile(null);
      onFileError(validation.error || 'File validation failed');
    }
  }, [validateFile, onFileSelect, onFileError]);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragActive(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]); // Only handle first file
    }
  }, [disabled, handleFileSelect]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  // Clear selected file
  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setValidationResult(null);
  }, []);

  // Get file icon based on type
  const getFileIcon = (fileName: string): string => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'txt': return '📋';
      default: return '📁';
    }
  };

  return (
    <div className={`file-upload-container ${className}`}>
      {/* Drop zone */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${dragActive 
            ? 'border-black bg-black/5 scale-105' 
            : 'border-black/20 hover:border-black/40'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-black/5'}
          ${selectedFile ? 'border-green-500 bg-green-50' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept={SUPPORTED_MIME_TYPES.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
        />

        {selectedFile ? (
          // File selected state
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-100 mx-auto rounded-lg flex items-center justify-center">
              <span className="text-2xl">{getFileIcon(selectedFile.name)}</span>
            </div>
            <div>
              <p className="text-lg font-medium text-black">{selectedFile.name}</p>
              <p className="text-sm text-black/60">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            
            {/* Validation warnings */}
            {validationResult?.warnings && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
                <p className="text-yellow-800 font-medium text-sm">⚠️ Warnings:</p>
                <ul className="text-yellow-700 text-xs mt-1 space-y-1">
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="px-4 py-2 text-sm text-black/60 hover:text-black transition-colors"
              disabled={disabled}
            >
              Choose different file
            </button>
          </div>
        ) : (
          // Empty state
          <div className="space-y-4">
            <div className="w-16 h-16 bg-black/10 mx-auto rounded-lg flex items-center justify-center">
              <span className="text-2xl">📁</span>
            </div>
            <div>
              <p className="text-lg font-medium text-black">
                {dragActive ? 'Drop your file here' : 'Upload study material'}
              </p>
              <p className="text-sm text-black/60 mt-2">
                Drag & drop or click to select
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File type information */}
      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap gap-2 text-xs text-black/60">
          <span>Supported formats:</span>
          {acceptedTypes.map((type) => (
            <span 
              key={type} 
              className="px-2 py-1 bg-black/5 rounded-md font-mono uppercase"
            >
              .{type}
            </span>
          ))}
        </div>
        <p className="text-xs text-black/50">
          Maximum file size: {maxSize}MB
        </p>
      </div>
    </div>
  );
}

// File validation hook for use in other components
export function useFileValidation() {
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds 10MB limit`
      };
    }

    // Check file type
    const fileExtension = file.name.toLowerCase().split('.').pop() || '';
    const isValidExtension = SUPPORTED_EXTENSIONS.includes(fileExtension);
    const isValidMimeType = SUPPORTED_MIME_TYPES.includes(file.type);

    if (!isValidExtension && !isValidMimeType) {
      return {
        valid: false,
        error: `Unsupported file type. Please use: ${SUPPORTED_EXTENSIONS.join(', ')}`
      };
    }

    return { valid: true };
  }, []);

  return { validateFile };
}

// File type checker component
export function FileTypeInfo({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-black/5 rounded-lg p-4 ${className}`}>
      <h4 className="font-medium text-black mb-3">📋 Supported File Types</h4>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span>📄</span>
          <span className="font-medium">PDF</span>
          <span className="text-black/60">- Portable Document Format</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📝</span>
          <span className="font-medium">DOCX/DOC</span>
          <span className="text-black/60">- Microsoft Word documents</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📋</span>
          <span className="font-medium">TXT</span>
          <span className="text-black/60">- Plain text files</span>
        </div>
      </div>
      <p className="text-xs text-black/50 mt-3 border-t border-black/10 pt-2">
        💡 Tip: Ensure your files contain readable text content for best quiz generation results.
      </p>
    </div>
  );
}