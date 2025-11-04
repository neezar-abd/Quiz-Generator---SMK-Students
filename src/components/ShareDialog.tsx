'use client';

import React, { useState, useEffect } from 'react';
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
  const [publishing, setPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (quiz) {
      // Check if quiz is already published
      const published = quiz.metadata.status === 'published';
      setIsPublished(published);
      
      if (published) {
        const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/take/${quiz.id}`;
        setShareUrl(url);
      }
    }
  }, [quiz]);
  
  if (!quiz) return null;
  
  const handlePublish = async () => {
    try {
      setPublishing(true);
      setError(null);
      
      const response = await fetch(`/api/quizzes/${quiz.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publish: !isPublished }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update quiz');
      }
      
      if (data.success) {
        setIsPublished(data.data.isPublic);
        if (data.data.shareUrl) {
          setShareUrl(data.data.shareUrl);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish quiz');
      console.error('Publish error:', err);
    } finally {
      setPublishing(false);
    }
  };

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
            <p>
              <strong>Status:</strong>{' '}
              <span className={isPublished ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                {isPublished ? '🌐 Published (Public)' : '🔒 Draft (Private)'}
              </span>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Publish Toggle */}
        <div className="border border-black/10 rounded-lg p-4 bg-black/5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-black">Public Access</h4>
            <Button
              onClick={handlePublish}
              disabled={publishing}
              size="sm"
              variant={isPublished ? 'outline' : 'default'}
            >
              {publishing ? 'Updating...' : isPublished ? 'Unpublish' : 'Publish Quiz'}
            </Button>
          </div>
          <p className="text-xs text-black/60">
            {isPublished 
              ? 'Anyone with the link can access this quiz'
              : 'Publish this quiz to make it accessible via link'}
          </p>
        </div>

        {/* Share Link - Only show if published */}
        {isPublished && (
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
            <p className="text-xs text-black/60 mt-2">
              💡 Share this link with anyone to let them take the quiz
            </p>
          </div>
        )}

        {/* QR Code Placeholder */}
        {isPublished && (
          <div>
            <h4 className="font-medium text-black mb-4">QR Code</h4>
            <div className="w-32 h-32 border-2 border-dashed border-black/30 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-black/40 text-sm">QR Code</span>
            </div>
            <p className="text-xs text-black/60 text-center mt-2">
              Scan to access quiz on mobile
            </p>
          </div>
        )}

        <div className="flex space-x-3 pt-4 border-t border-black/10">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          {isPublished && (
            <Button 
              onClick={() => window.open(shareUrl, '_blank')} 
              className="flex-1"
            >
              Preview Quiz
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}