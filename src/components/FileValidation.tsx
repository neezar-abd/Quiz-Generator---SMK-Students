/**
 * File validation utilities and error display components
 */

'use client';

import React from 'react';
import { SUPPORTED_EXTENSIONS } from '@/lib/fileConstants';

interface FileValidationErrorProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function FileValidationError({ 
  error, 
  onRetry, 
  className = '' 
}: FileValidationErrorProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
  <span className="text-red-500 text-lg">ERROR</span>
        <div className="flex-1">
          <h4 className="font-medium text-red-800 mb-1">File Upload Error</h4>
          <p className="text-red-700 text-sm mb-3">{error}</p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-sm rounded-md transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface FileValidationWarningProps {
  warnings: string[];
  onProceed?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function FileValidationWarning({ 
  warnings, 
  onProceed, 
  onCancel,
  className = '' 
}: FileValidationWarningProps) {
  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
  <span className="text-yellow-500 text-lg">WARNING</span>
        <div className="flex-1">
          <h4 className="font-medium text-yellow-800 mb-1">File Validation Warnings</h4>
          <ul className="text-yellow-700 text-sm mb-3 space-y-1">
            {warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
          
          {(onProceed || onCancel) && (
            <div className="flex gap-2">
              {onProceed && (
                <button
                  onClick={onProceed}
                  className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm rounded-md transition-colors"
                >
                  Proceed Anyway
                </button>
              )}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-3 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 text-sm rounded-md border border-yellow-200 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FileValidationSuccessProps {
  fileName: string;
  fileSize: number;
  extractionPreview?: string;
  className?: string;
}

export function FileValidationSuccess({ 
  fileName, 
  fileSize, 
  extractionPreview,
  className = '' 
}: FileValidationSuccessProps) {
  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
  <span className="text-green-500 text-lg">OK</span>
        <div className="flex-1">
          <h4 className="font-medium text-green-800 mb-1">File Ready for Processing</h4>
          <div className="text-green-700 text-sm space-y-1">
            <p><strong>File:</strong> {fileName}</p>
            <p><strong>Size:</strong> {(fileSize / 1024 / 1024).toFixed(2)} MB</p>
            {extractionPreview && (
              <div className="mt-2">
                <p className="font-medium">Content Preview:</p>
                <p className="bg-green-100 rounded p-2 text-xs font-mono">
                  {extractionPreview.substring(0, 150)}
                  {extractionPreview.length > 150 ? '...' : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FileValidationGuideProps {
  className?: string;
}

export function FileValidationGuide({ className = '' }: FileValidationGuideProps) {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
  <span className="text-blue-500 text-lg">INFO</span>
        <div className="flex-1">
          <h4 className="font-medium text-blue-800 mb-2">File Upload Guidelines</h4>
          <div className="text-blue-700 text-sm space-y-2">
            <div>
              <p className="font-medium">Supported Formats:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {SUPPORTED_EXTENSIONS.map((ext) => (
                  <span 
                    key={ext} 
                    className="px-2 py-1 bg-blue-100 rounded text-xs font-mono uppercase"
                  >
                    .{ext}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <p className="font-medium">File Requirements:</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Maximum size: 10MB</li>
                <li>• Must contain readable text (not image-based PDFs)</li>
                <li>• Minimum content: 50+ characters for meaningful quiz generation</li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium">Common Issues:</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Scanned PDFs without text layer</li>
                <li>• Password-protected documents</li>
                <li>• Files with only images or diagrams</li>
                <li>• Corrupted or incomplete files</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Processing status component
interface FileProcessingStatusProps {
  stage: 'uploading' | 'extracting' | 'generating' | 'complete' | 'error';
  fileName?: string;
  progress?: number;
  error?: string;
  className?: string;
}

export function FileProcessingStatus({ 
  stage, 
  fileName, 
  progress = 0,
  error,
  className = '' 
}: FileProcessingStatusProps) {
  const getStageInfo = (): { icon: string; label: string; color: 'blue' | 'green' | 'red' | 'gray' } => {
    switch (stage) {
      case 'uploading':
        return { icon: 'UPLOAD', label: 'Uploading file...', color: 'blue' };
      case 'extracting':
        return { icon: 'EXTRACT', label: 'Extracting text content...', color: 'blue' };
      case 'generating':
        return { icon: 'AI', label: 'Generating quiz with AI...', color: 'blue' };
      case 'complete':
        return { icon: 'DONE', label: 'Quiz generated successfully!', color: 'green' };
      case 'error':
        return { icon: 'ERROR', label: 'Processing failed', color: 'red' };
      default:
        return { icon: 'WAIT', label: 'Processing...', color: 'gray' };
    }
  };

  const stageInfo = getStageInfo();
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    gray: 'bg-gray-50 border-gray-200 text-gray-800'
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[stageInfo.color]} ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{stageInfo.icon}</span>
        <div className="flex-1">
          <p className="font-medium">{stageInfo.label}</p>
          {fileName && (
            <p className="text-sm opacity-75 mt-1">File: {fileName}</p>
          )}
          {error && (
            <p className="text-sm mt-1">{error}</p>
          )}
        </div>
      </div>
      
      {/* Progress bar for ongoing processes */}
      {['uploading', 'extracting', 'generating'].includes(stage) && (
        <div className="mt-3">
          <div className="w-full bg-white/50 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                stageInfo.color === 'blue' ? 'bg-blue-500' : 'bg-gray-400'
              }`}
              style={{ width: `${Math.max(progress, 10)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}