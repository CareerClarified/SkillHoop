import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { ResumeData } from '../../types/resume';

interface SaveResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  currentResume: ResumeData;
  isUpdating?: boolean;
}

export default function SaveResumeModal({
  isOpen,
  onClose,
  onSave,
  currentResume,
  isUpdating = false,
}: SaveResumeModalProps) {
  const [title, setTitle] = useState(currentResume.title || 'Untitled Resume');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(currentResume.title || 'Untitled Resume');
      setError('');
    }
  }, [isOpen, currentResume.title]);

  const handleSave = () => {
    if (!title.trim()) {
      setError('Please enter a resume title');
      return;
    }

    if (title.length > 100) {
      setError('Title must be less than 100 characters');
      return;
    }

    onSave(title.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Save className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {isUpdating ? 'Update Resume' : 'Save Resume'}
              </h2>
              <p className="text-sm text-slate-600">
                {isUpdating ? 'Update your resume with a new name' : 'Save your resume for later'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="resume-title" className="block text-sm font-medium text-slate-700 mb-2">
              Resume Title
            </label>
            <input
              id="resume-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Software Engineer Resume"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              autoFocus
            />
            {error && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            <p className="mt-2 text-xs text-slate-500">
              {title.length}/100 characters
            </p>
          </div>

          {/* Resume Info Preview */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="text-sm">
              <span className="text-slate-600">Template: </span>
              <span className="font-medium text-slate-900">
                {currentResume.settings.templateId || 'Classic'}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-slate-600">Sections: </span>
              <span className="font-medium text-slate-900">
                {currentResume.sections.filter(s => s.isVisible).length}
              </span>
            </div>
            {currentResume.atsScore > 0 && (
              <div className="text-sm">
                <span className="text-slate-600">ATS Score: </span>
                <span className="font-medium text-slate-900">
                  {currentResume.atsScore}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isUpdating ? 'Update' : 'Save Resume'}
          </button>
        </div>
      </div>
    </div>
  );
}

