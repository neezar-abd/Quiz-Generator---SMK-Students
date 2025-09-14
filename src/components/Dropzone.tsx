'use client';

import React, { useRef } from 'react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function Dropzone({ 
  onFileSelect, 
  accept = '.pdf,.doc,.docx,.txt',
  className = '',
  children 
}: DropzoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`
        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
        ${isDragOver 
          ? 'border-black bg-black/5' 
          : 'border-black/30 hover:border-black hover:bg-black/5'
        }
        ${className}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {children || (
        <div className="space-y-4">
          <div className="w-12 h-12 bg-black/10 mx-auto rounded-lg flex items-center justify-center">
            <span className="text-black/60 text-xl">📁</span>
          </div>
          <div>
            <p className="text-lg font-medium text-black">
              {isDragOver ? 'Drop your file here' : 'Drag & drop your file here'}
            </p>
            <p className="text-sm text-black/60 mt-2">
              or click to browse files
            </p>
          </div>
          <p className="text-xs text-black/40">
            Supports: PDF, DOC, DOCX, TXT (Max 10MB)
          </p>
        </div>
      )}
    </div>
  );
}