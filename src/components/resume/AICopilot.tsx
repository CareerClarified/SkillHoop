import { useResume } from '../../context/ResumeContext';
import { Target, Shield, TrendingUp } from '../ui/Icons';

export default function AICopilot() {
  const { state, dispatch } = useResume();
  const { atsScore, targetJob } = state;

  const handleTargetJobChange = (field: keyof typeof targetJob, value: string) => {
    dispatch({
      type: 'UPDATE_TARGET_JOB',
      payload: { [field]: value },
    });
  };

  const handleAnalyzeResume = () => {
    // Mock function for now
    console.log('Analyzing resume...', { targetJob, atsScore });
    alert('Resume analysis feature coming soon!');
  };

  // Determine ATS score color based on value
  const getScoreColor = () => {
    if (atsScore < 50) {
      return 'text-red-600 bg-red-50 border-red-200';
    } else if (atsScore >= 70) {
      return 'text-green-600 bg-green-50 border-green-200';
    } else {
      return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  const getProgressBarColor = () => {
    if (atsScore < 50) {
      return 'bg-red-500';
    } else if (atsScore >= 70) {
      return 'bg-green-500';
    } else {
      return 'bg-orange-500';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">AI Career Copilot</h2>
        <p className="text-sm text-slate-600">
          Get AI-powered insights to optimize your resume for your target job
        </p>
      </div>

      {/* ATS Score Card */}
      <div className={`rounded-lg border-2 p-6 ${getScoreColor()}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <h3 className="text-lg font-semibold">ATS Score</h3>
          </div>
          <span className="text-3xl font-bold">{atsScore}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/50 rounded-full h-3 mb-2 overflow-hidden">
          <div
            className={`h-full ${getProgressBarColor()} transition-all duration-300`}
            style={{ width: `${atsScore}%` }}
          />
        </div>
        
        <p className="text-sm opacity-80">
          {atsScore < 50
            ? 'Your resume needs improvement to pass ATS filters'
            : atsScore >= 70
            ? 'Your resume is well-optimized for ATS systems'
            : 'Your resume is getting there, but could be improved'}
        </p>
      </div>

      {/* Job Targeting Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-900">Job Targeting</h3>
        </div>

        {/* Target Job Title */}
        <div>
          <label htmlFor="targetJobTitle" className="block text-sm font-medium text-slate-700 mb-2">
            Target Job Title
          </label>
          <input
            type="text"
            id="targetJobTitle"
            value={targetJob.title || ''}
            onChange={(e) => handleTargetJobChange('title', e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-slate-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white px-3 py-2"
            placeholder="e.g., Senior Software Engineer"
          />
        </div>

        {/* Job Description */}
        <div>
          <label htmlFor="jobDescription" className="block text-sm font-medium text-slate-700 mb-2">
            Job Description
          </label>
          <textarea
            id="jobDescription"
            value={targetJob.description || ''}
            onChange={(e) => handleTargetJobChange('description', e.target.value)}
            rows={8}
            className="w-full rounded-md border border-slate-300 bg-slate-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white px-3 py-2 resize-none"
            placeholder="Paste the full job description here..."
          />
        </div>

        {/* Industry (optional field) */}
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-2">
            Industry
          </label>
          <input
            type="text"
            id="industry"
            value={targetJob.industry || ''}
            onChange={(e) => handleTargetJobChange('industry', e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-slate-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white px-3 py-2"
            placeholder="e.g., Technology, Healthcare, Finance"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4">
        <button
          onClick={handleAnalyzeResume}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          <TrendingUp className="h-5 w-5" />
          Analyze Resume
        </button>
      </div>
    </div>
  );
}

