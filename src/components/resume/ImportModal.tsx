import { useState } from 'react';
import { X, Loader2, FileText, Upload } from 'lucide-react';
import { parseResumeFromText } from '../../lib/resumeParser';
import type { ResumeData } from '../../types/resume';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Partial<ResumeData>) => void;
}

type TabType = 'paste' | 'upload';

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('paste');
  const [pastedText, setPastedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!pastedText.trim()) {
      setError('Please paste your resume text');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parsedData = await parseResumeFromText(pastedText);
      onImport(parsedData);
      // Reset form
      setPastedText('');
      onClose();
    } catch (err: any) {
      console.error('Error parsing resume:', err);
      setError(err.message || 'Failed to parse resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For now, we'll just read text files
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      setIsLoading(true);
      setError(null);

      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target?.result as string;
          if (text) {
            setPastedText(text);
            // Auto-parse after reading
            const parsedData = await parseResumeFromText(text);
            onImport(parsedData);
            setPastedText('');
            onClose();
          }
        };
        reader.onerror = () => {
          setError('Failed to read file');
          setIsLoading(false);
        };
        reader.readAsText(file);
      } catch (err: any) {
        console.error('Error reading file:', err);
        setError(err.message || 'Failed to read file');
        setIsLoading(false);
      }
    } else {
      setError('Please upload a .txt file. PDF support coming soon.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Import Resume</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'paste'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            disabled={isLoading}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Paste Text</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            disabled={isLoading}
          >
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'paste' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste your resume text or LinkedIn profile
                </label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your resume content here... You can copy from Word, PDF, or LinkedIn profile."
                  className="w-full h-64 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm"
                  disabled={isLoading}
                />
                <p className="mt-2 text-xs text-gray-500">
                  The AI will extract your personal information, experience, education, skills, and more.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload a text file (.txt)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                      Choose a file
                    </span>
                    <input
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                  <p className="mt-2 text-sm text-gray-500">
                    Currently supports .txt files. PDF support coming soon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          {activeTab === 'paste' && (
            <button
              onClick={handleParse}
              disabled={isLoading || !pastedText.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing resume...</span>
                </>
              ) : (
                <span>Parse & Import</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

