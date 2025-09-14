'use client';

import React from 'react';
import { MCQ, Essay } from '@/types/quiz';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Badge from './ui/Badge';

interface MCQEditorProps {
  mcq: MCQ;
  index: number;
  onUpdate: (mcq: MCQ) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  showAnswers: boolean;
}

function MCQEditor({ 
  mcq, 
  index, 
  onUpdate, 
  onDelete, 
  onMoveUp, 
  onMoveDown, 
  canMoveUp, 
  canMoveDown,
  showAnswers 
}: MCQEditorProps) {
  const updateQuestion = (question: string) => {
    onUpdate({ ...mcq, question });
  };

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...mcq.options] as [string, string, string, string];
    newOptions[optionIndex] = value;
    onUpdate({ ...mcq, options: newOptions });
  };

  const updateAnswer = (answerIndex: 0 | 1 | 2 | 3) => {
    onUpdate({ ...mcq, answerIndex });
  };

  const updateExplanation = (explanation: string) => {
    onUpdate({ ...mcq, explanation });
  };

  return (
    <div className="border border-black/15 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-black">Multiple Choice #{index + 1}</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            disabled={!canMoveUp}
          >
            ↑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            disabled={!canMoveDown}
          >
            ↓
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      </div>

      <Textarea
        label="Question"
        value={mcq.question}
        onChange={(e) => updateQuestion(e.target.value)}
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mcq.options.map((option, optionIndex) => (
          <div key={optionIndex} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-black">
                Option {String.fromCharCode(65 + optionIndex)}
              </label>
              {showAnswers && mcq.answerIndex === optionIndex && (
                <Badge variant="default" size="sm">Correct</Badge>
              )}
            </div>
            <div className="flex space-x-2">
              <input
                type="radio"
                name={`mcq-${index}-answer`}
                checked={mcq.answerIndex === optionIndex}
                onChange={() => updateAnswer(optionIndex as 0 | 1 | 2 | 3)}
                className="mt-1"
              />
              <Input
                value={option}
                onChange={(e) => updateOption(optionIndex, e.target.value)}
                placeholder={`Enter option ${String.fromCharCode(65 + optionIndex)}`}
              />
            </div>
          </div>
        ))}
      </div>

      <Textarea
        label="Explanation (Optional)"
        value={mcq.explanation || ''}
        onChange={(e) => updateExplanation(e.target.value)}
        placeholder="Explain why this is the correct answer..."
        rows={2}
      />
    </div>
  );
}

interface EssayEditorProps {
  essay: Essay;
  index: number;
  onUpdate: (essay: Essay) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function EssayEditor({ 
  essay, 
  index, 
  onUpdate, 
  onDelete, 
  onMoveUp, 
  onMoveDown, 
  canMoveUp, 
  canMoveDown 
}: EssayEditorProps) {
  const updateQuestion = (question: string) => {
    onUpdate({ ...essay, question });
  };

  const updateRubric = (rubric: string) => {
    onUpdate({ ...essay, rubric });
  };

  return (
    <div className="border border-black/15 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-black">Essay Question #{index + 1}</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            disabled={!canMoveUp}
          >
            ↑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            disabled={!canMoveDown}
          >
            ↓
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      </div>

      <Textarea
        label="Question"
        value={essay.question}
        onChange={(e) => updateQuestion(e.target.value)}
        placeholder="Enter your essay question here..."
        rows={3}
      />

      <Textarea
        label="Grading Rubric"
        value={essay.rubric}
        onChange={(e) => updateRubric(e.target.value)}
        placeholder="Describe how this question should be graded..."
        rows={3}
      />
    </div>
  );
}

interface QuizEditorProps {
  mcqs: MCQ[];
  essays: Essay[];
  onUpdateMCQ: (index: number, mcq: MCQ) => void;
  onUpdateEssay: (index: number, essay: Essay) => void;
  onDeleteMCQ: (index: number) => void;
  onDeleteEssay: (index: number) => void;
  onMoveMCQ: (index: number, direction: 'up' | 'down') => void;
  onMoveEssay: (index: number, direction: 'up' | 'down') => void;
  onAddMCQ: () => void;
  onAddEssay: () => void;
  showAnswers: boolean;
}

export default function QuizEditor({
  mcqs,
  essays,
  onUpdateMCQ,
  onUpdateEssay,
  onDeleteMCQ,
  onDeleteEssay,
  onMoveMCQ,
  onMoveEssay,
  onAddMCQ,
  onAddEssay,
  showAnswers
}: QuizEditorProps) {
  return (
    <div className="space-y-8">
      {/* Multiple Choice Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-black">
            Multiple Choice Questions ({mcqs.length})
          </h2>
          <Button onClick={onAddMCQ} variant="outline">
            Add MCQ
          </Button>
        </div>

        <div className="space-y-6">
          {mcqs.map((mcq, index) => (
            <MCQEditor
              key={`mcq-${index}`}
              mcq={mcq}
              index={index}
              onUpdate={(updatedMCQ) => onUpdateMCQ(index, updatedMCQ)}
              onDelete={() => onDeleteMCQ(index)}
              onMoveUp={() => onMoveMCQ(index, 'up')}
              onMoveDown={() => onMoveMCQ(index, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < mcqs.length - 1}
              showAnswers={showAnswers}
            />
          ))}

          {mcqs.length === 0 && (
            <div className="text-center py-8 text-black/60">
              <p>No multiple choice questions yet.</p>
              <Button onClick={onAddMCQ} className="mt-4">
                Add Your First MCQ
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Essay Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-black">
            Essay Questions ({essays.length})
          </h2>
          <Button onClick={onAddEssay} variant="outline">
            Add Essay
          </Button>
        </div>

        <div className="space-y-6">
          {essays.map((essay, index) => (
            <EssayEditor
              key={`essay-${index}`}
              essay={essay}
              index={index}
              onUpdate={(updatedEssay) => onUpdateEssay(index, updatedEssay)}
              onDelete={() => onDeleteEssay(index)}
              onMoveUp={() => onMoveEssay(index, 'up')}
              onMoveDown={() => onMoveEssay(index, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < essays.length - 1}
            />
          ))}

          {essays.length === 0 && (
            <div className="text-center py-8 text-black/60">
              <p>No essay questions yet.</p>
              <Button onClick={onAddEssay} className="mt-4">
                Add Your First Essay Question
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}