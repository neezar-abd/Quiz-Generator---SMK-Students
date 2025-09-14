'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { QuizPayload } from '@/types/quiz';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizPayload | null;
}

export default function ShareDialog({ isOpen, onClose, quiz }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  
  if (!quiz) return null;
  
  // Generate shareable link (placeholder)
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/take/${quiz.id}`;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Quiz"
      className="max-w-md"
    >
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-black mb-2">Quiz Details</h4>
          <div className="text-sm text-black/60 space-y-1">
            <p><strong>Topic:</strong> {quiz.metadata.topic}</p>
            <p><strong>Level:</strong> {quiz.metadata.level}</p>
            <p><strong>Questions:</strong> {quiz.multipleChoice.length + quiz.essay.length}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Shareable Link
          </label>
          <div className="flex space-x-2">
            <Input
              value={shareUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={handleCopy}
              variant={copied ? 'default' : 'outline'}
              size="sm"
              className="shrink-0"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-black mb-4">QR Code</h4>
          <div className="w-32 h-32 border-2 border-dashed border-black/30 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-black/40 text-sm">QR Placeholder</span>
          </div>
          <p className="text-xs text-black/60 text-center mt-2">
            Scan to access quiz on mobile
          </p>
        </div>

        <div className="border-t border-black/10 pt-4">
          <h4 className="font-medium text-black mb-2">Share Options</h4>
          <div className="space-y-2 text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              Allow answer key viewing
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              Allow printing
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Allow retaking
            </label>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button className="flex-1">
            Update Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
}