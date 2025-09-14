'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuizPayload } from '@/types/quiz';
import { useQuizStore } from '@/hooks/useQuizStore';
import { GenerateQuizRequest } from '@/types/quiz';
import { validateFileClient } from '@/lib/fileUtils';
import AIThinkingLoader from '@/components/AIThinkingLoader';

type InputMethod = 'file' | 'text';

export default function Upload() {
  const router = useRouter();
  const { state, actions } = useQuizStore();
  const [inputMethod, setInputMethod] = useState<InputMethod>('file');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [formData, setFormData] = useState({
    topic: '',
    level: 'XI' as 'X' | 'XI' | 'XII' | 'General',
    mcqCount: 8,
    essayCount: 2
  });
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizPayload | null>(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const levelOptions = [
    { value: 'X', label: 'Class X' },
    { value: 'XI', label: 'Class XI' },
    { value: 'XII', label: 'Class XII' },
    { value: 'General', label: 'General' }
  ];

  const handleFileSelect = (file: File) => {
    const validation = validateFileClient(file);
    
    if (!validation.valid) {
      alert(validation.error || 'Invalid file type');
      return;
    }
    
    setUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
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

  const handleSubmit = async () => {
    if (!formData.topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    if (inputMethod === 'file' && !uploadedFile) {
      alert('Please select a file');
      return;
    }

    if (inputMethod === 'text' && !textContent.trim()) {
      alert('Please enter text content');
      return;
    }

    try {
      let quiz: QuizPayload;
      
      if (inputMethod === 'text') {
        const request: GenerateQuizRequest = {
          text: textContent,
          topic: formData.topic,
          level: formData.level,
          mcqCount: formData.mcqCount,
          essayCount: formData.essayCount,
        };
        quiz = await actions.generateQuiz(request);
      } else {
        // Use file-based generation
        quiz = await actions.generateQuizFromFile(uploadedFile!, {
          topic: formData.topic,
          level: formData.level,
          mcqCount: formData.mcqCount,
          essayCount: formData.essayCount,
        });
      }
      
      setGeneratedQuiz(quiz);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/30 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left Panel - Upload Section */}
          <div className="lg:col-span-7 space-y-8">
            {/* Header */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-black mb-4 tracking-tight">
                Create Your Quiz
              </h1>
              <p className="text-lg text-black/60 max-w-2xl">
                Upload your study materials or paste text content to generate intelligent quizzes powered by AI.
              </p>
            </div>

            {/* Input Method Tabs */}
            <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
              <div className="border-b border-black/10">
                <nav className="flex">
                  <button
                    onClick={() => setInputMethod('file')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                      inputMethod === 'file'
                        ? 'text-black bg-white border-b-2 border-black'
                        : 'text-black/60 hover:text-black hover:bg-black/5'
                    }`}
                  >
                    📁 Upload File
                  </button>
                  <button
                    onClick={() => setInputMethod('text')}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                      inputMethod === 'text'
                        ? 'text-black bg-white border-b-2 border-black'
                        : 'text-black/60 hover:text-black hover:bg-black/5'
                    }`}
                  >
                    📝 Paste Text
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {inputMethod === 'file' ? (
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
                      isDragOver
                        ? 'border-black/30 bg-black/5'
                        : 'border-black/20 hover:border-black/30'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        {uploadedFile ? uploadedFile.name : 'Drop your file here'}
                      </h3>
                      <p className="text-black/60 mb-4">
                        Support PDF, DOC, DOCX files up to 10MB
                      </p>
                      <label className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-black/90 transition-all duration-200 cursor-pointer">
                        Choose File
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Paste your content
                    </label>
                    <textarea
                      className="w-full h-64 p-4 border border-black/20 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30"
                      placeholder="Paste your study materials here..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quiz Options */}
            <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Quiz Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Topic</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-black/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30"
                    placeholder="Enter quiz topic"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Level</label>
                  <select
                    className="w-full p-3 border border-black/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30"
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                  >
                    {levelOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Multiple Choice Questions</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className="w-full p-3 border border-black/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30"
                    value={formData.mcqCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, mcqCount: parseInt(e.target.value) || 1 }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Essay Questions</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="w-full p-3 border border-black/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30"
                    value={formData.essayCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, essayCount: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>

            {/* Guidelines (Collapsible) */}
            <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowGuidelines(!showGuidelines)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-black/5 transition-colors duration-200 border-0"
              >
                <h3 className="text-lg font-semibold text-black">📋 Upload Guidelines</h3>
                <svg
                  className={`w-5 h-5 text-black/60 transition-transform duration-200 ${
                    showGuidelines ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showGuidelines && (
                <div className="px-6 pb-6 pt-0 space-y-3 text-sm text-black/70">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-black/30 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Upload PDF, DOC, or DOCX files containing your study materials</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-black/30 rounded-full mt-2 flex-shrink-0"></div>
                    <p>File size should not exceed 10MB for optimal processing</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-black/30 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Ensure text is clear and readable for better AI analysis</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-black/30 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Provide a specific topic for more relevant quiz generation</p>
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleSubmit}
              disabled={state.isLoading}
              className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              {state.isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Generating Quiz...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Generate Quiz</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* Right Panel - Sticky Preview */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-20 space-y-6">
              <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-black/10">
                  <h3 className="text-lg font-semibold text-black">Quiz Preview</h3>
                </div>
                
                <div className="p-6 min-h-[400px]">
                  {state.isLoading ? (
                    <AIThinkingLoader />
                  ) : generatedQuiz ? (
                    <div className="space-y-6">
                      <div className="text-center pb-4 border-b border-black/10">
                        <h4 className="text-xl font-semibold text-black mb-2">
                          {generatedQuiz.metadata.topic}
                        </h4>
                        <div className="flex justify-center space-x-4 text-sm text-black/60">
                          <span>{generatedQuiz.multipleChoice?.length || 0} MCQ</span>
                          <span>•</span>
                          <span>{generatedQuiz.essay?.length || 0} Essay</span>
                          <span>•</span>
                          <span>Level {generatedQuiz.metadata.level}</span>
                        </div>
                      </div>

                      {generatedQuiz.multipleChoice?.[0] && (
                        <div>
                          <h5 className="font-medium text-black mb-3">Sample Multiple Choice:</h5>
                          <div className="p-4 bg-gray-50/50 rounded-xl">
                            <p className="text-sm font-medium text-black mb-3">
                              1. {generatedQuiz.multipleChoice[0].question}
                            </p>
                            <div className="space-y-2">
                              {generatedQuiz.multipleChoice[0].options.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <div className="w-3 h-3 border border-black/20 rounded-full"></div>
                                  <span className="text-sm text-black/70">{option}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <button
                          onClick={() => generatedQuiz && actions.saveQuiz(generatedQuiz)}
                          className="flex-1 bg-black text-white py-2 px-4 rounded-lg font-medium hover:bg-black/90 transition-colors"
                        >
                          Save Quiz
                        </button>
                        <button
                          onClick={() => generatedQuiz && router.push(`/quiz/${generatedQuiz.id}`)}
                          className="flex-1 border border-black/20 text-black py-2 px-4 rounded-lg font-medium hover:bg-black/5 transition-colors"
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-medium text-black/60 mb-2">Quiz Preview</h4>
                        <p className="text-sm text-black/40">
                          Your generated quiz will appear here
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}