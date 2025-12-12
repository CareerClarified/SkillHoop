import { useState } from 'react';
import { X, Target, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ResumeData } from '../../types/resume';
import { scanResume, type ATSScanResult } from '../../lib/atsScanner';

interface ATSScannerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
}

export default function ATSScannerPanel({ isOpen, onClose, resume }: ATSScannerPanelProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [scanResult, setScanResult] = useState<ATSScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    if (!jobDescription.trim()) {
      alert('Please paste a job description to scan');
      return;
    }

    setIsScanning(true);
    try {
      // Small delay to show loading state
      setTimeout(() => {
        const result = scanResume(resume, jobDescription);
        setScanResult(result);
        setIsScanning(false);
      }, 300);
    } catch (error) {
      console.error('Error scanning resume:', error);
      alert('Failed to scan resume. Please try again.');
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    setJobDescription('');
    setScanResult(null);
    onClose();
  };

  if (!isOpen) return null;

  // Calculate score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  // Calculate gauge rotation (0-180 degrees for 0-100 score)
  const gaugeRotation = scanResult ? (scanResult.score / 100) * 180 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">ATS Resume Scanner</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close scanner"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Job Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm"
              />
              <button
                onClick={handleScan}
                disabled={isScanning || !jobDescription.trim()}
                className="mt-3 flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Scan Resume</span>
                  </>
                )}
              </button>
            </div>

            {/* Results */}
            {scanResult && (
              <div className="space-y-6">
                {/* Score Gauge */}
                <div className={`p-6 rounded-lg border-2 ${getScoreBgColor(scanResult.score)}`}>
                  <div className="flex items-center justify-center">
                    <div className="relative w-64 h-32">
                      {/* Gauge Background (Semi-circle) */}
                      <svg className="w-64 h-32 overflow-hidden" viewBox="0 0 200 100">
                        {/* Background arc */}
                        <path
                          d="M 20 80 A 80 80 0 0 1 180 80"
                          stroke="#e5e7eb"
                          strokeWidth="12"
                          fill="none"
                          strokeLinecap="round"
                        />
                        {/* Score arc */}
                        <path
                          d="M 20 80 A 80 80 0 0 1 180 80"
                          stroke={scanResult.score >= 80 ? '#10b981' : scanResult.score >= 60 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="12"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${(scanResult.score / 100) * 502.65} 502.65`}
                          transform="rotate(180 100 100)"
                        />
                      </svg>
                      {/* Score Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={`text-5xl font-bold ${getScoreColor(scanResult.score)}`}>
                          {scanResult.score}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Match Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Missing Keywords */}
                {scanResult.missingKeywords.length > 0 && (
                  <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-red-900">
                        Missing Keywords ({scanResult.missingKeywords.length})
                      </h3>
                    </div>
                    <p className="text-sm text-red-700 mb-3">
                      These keywords from the job description were not found in your resume. Consider adding them if relevant:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {scanResult.missingKeywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white border border-red-300 text-red-700 rounded-full text-sm font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formatting Issues */}
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    {scanResult.formattingIssues.length === 0 ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Formatting Checks</h3>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Formatting Issues ({scanResult.formattingIssues.length})
                        </h3>
                      </>
                    )}
                  </div>

                  {scanResult.formattingIssues.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">All formatting checks passed!</span>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {scanResult.formattingIssues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Score Interpretation */}
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-indigo-900 mb-2">Score Interpretation</h4>
                  <p className="text-sm text-indigo-700">
                    {scanResult.score >= 80 
                      ? 'Excellent match! Your resume aligns well with the job description.'
                      : scanResult.score >= 60
                      ? 'Good match. Consider adding more relevant keywords and addressing formatting issues.'
                      : 'Your resume needs improvement. Focus on adding missing keywords and fixing formatting issues to improve your ATS compatibility.'
                    }
                  </p>
                </div>
              </div>
            )}

            {!scanResult && !isScanning && (
              <div className="text-center py-12 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm">Paste a job description above and click "Scan Resume" to see how well your resume matches.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

