import React, { useState } from 'react';
import { Layers, LayoutTemplate, Palette, Bot, GripVertical, ChevronRight, ChevronDown, Sparkles, FileText, Plus, Eye, EyeOff, Trash2 } from 'lucide-react';

type TabId = 'sections' | 'templates' | 'formatting' | 'copilot';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

// Type Definitions
export interface Section {
  id: string;
  label: string;
  isVisible: boolean;
}

export interface FormattingValues {
  font: string;
  lineSpacing: number;
  accentColor: string;
}

export interface ResumeControlPanelData {
  currentTemplateId: number | null;
  formatting: FormattingValues;
  sections: Section[];
  atsScore: number;
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  experience: ExperienceItem[];
}

export interface ResumeControlPanelProps {
  data: ResumeControlPanelData;
  resumeData: ResumeData;
  onTemplateChange: (id: number) => void;
  onFormattingChange: (key: string, value: string | number) => void;
  onSectionToggle: (id: string) => void;
  onAIAction: (action: string) => void;
  onContentChange: (path: string, value: string) => void;
  onAddExperience: () => void;
  onRemoveExperience: (id: string) => void;
  onUpdateExperience: (id: string, field: string, value: string) => void;
}

// Sections Tab Component
interface SectionsTabProps {
  sections: Section[];
  resumeData: ResumeData;
  onToggle: (id: string) => void;
  onContentChange: (path: string, value: string) => void;
  onAddExperience: () => void;
  onRemoveExperience: (id: string) => void;
  onUpdateExperience: (id: string, field: string, value: string) => void;
}

function SectionsTab({ sections, resumeData, onToggle, onContentChange, onAddExperience, onRemoveExperience, onUpdateExperience }: SectionsTabProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedExperienceId, setExpandedExperienceId] = useState<string | null>(null);

  const handleSectionClick = (sectionId: string) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  const handleVisibilityToggle = (e: React.MouseEvent, sectionId: string) => {
    e.stopPropagation();
    onToggle(sectionId);
  };

  return (
    <div className="p-6 space-y-3">
      {sections.map((section) => {
        const isExpanded = expandedSection === section.id;
        const isVisible = section.isVisible;

        return (
          <div
            key={section.id}
            className={`bg-white border rounded-lg transition-all ${
              isVisible ? 'border-gray-200' : 'border-gray-100 opacity-60'
            } ${isExpanded ? 'shadow-md' : 'hover:border-gray-300'}`}
          >
            {/* Section Header */}
            <div
              className="flex items-center gap-3 p-4 cursor-pointer"
              onClick={() => handleSectionClick(section.id)}
            >
              {/* Drag Handle */}
              <div 
                className="text-gray-400 cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-5 h-5" />
              </div>
              
              {/* Section Name */}
              <div className="flex-1 text-sm font-medium text-gray-900">
                {section.label}
              </div>
              
              {/* Visibility Toggle */}
              <button
                onClick={(e) => handleVisibilityToggle(e, section.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title={isVisible ? 'Hide section' : 'Show section'}
              >
                {isVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              
              {/* Expand/Collapse Icon */}
              <div className="text-gray-400">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </div>
            </div>

            {/* Expanded Form Content */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                {section.id === 'heading' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.fullName}
                        onChange={(e) => onContentChange('personalInfo.fullName', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.jobTitle}
                        onChange={(e) => onContentChange('personalInfo.jobTitle', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Product Designer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => onContentChange('personalInfo.email', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="hello@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => onContentChange('personalInfo.phone', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Location
                      </label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.location}
                        onChange={(e) => onContentChange('personalInfo.location', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </div>
                )}

                {section.id === 'profile' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Professional Summary
                    </label>
                    <textarea
                      value={resumeData.summary}
                      onChange={(e) => onContentChange('summary', e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Passionate designer with 5+ years of experience..."
                    />
                  </div>
                )}

                {section.id === 'experience' && (
                  <div className="space-y-3">
                    {/* List of Experience Items */}
                    {resumeData.experience.map((exp) => {
                      const isExpanded = expandedExperienceId === exp.id;
                      return (
                        <div
                          key={exp.id}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          {/* Experience Item Header */}
                          <div className="flex items-center justify-between p-3 bg-gray-50">
                            <button
                              onClick={() => setExpandedExperienceId(isExpanded ? null : exp.id)}
                              className="flex-1 text-left"
                            >
                              <div className="text-sm font-medium text-gray-900">
                                {exp.jobTitle || "New Position"} {exp.company && `at ${exp.company}`}
                              </div>
                            </button>
                            <button
                              onClick={() => onRemoveExperience(exp.id)}
                              className="ml-2 p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Expanded Form */}
                          {isExpanded && (
                            <div className="p-4 space-y-4 bg-white">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                  Job Title
                                </label>
                                <input
                                  type="text"
                                  value={exp.jobTitle}
                                  onChange={(e) => onUpdateExperience(exp.id, 'jobTitle', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Senior Software Engineer"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                  Company
                                </label>
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => onUpdateExperience(exp.id, 'company', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Tech Company Inc."
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                  Location
                                </label>
                                <input
                                  type="text"
                                  value={exp.location}
                                  onChange={(e) => onUpdateExperience(exp.id, 'location', e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="San Francisco, CA"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Start Date
                                  </label>
                                  <input
                                    type="text"
                                    value={exp.startDate}
                                    onChange={(e) => onUpdateExperience(exp.id, 'startDate', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="2021"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    End Date
                                  </label>
                                  <input
                                    type="text"
                                    value={exp.endDate}
                                    onChange={(e) => onUpdateExperience(exp.id, 'endDate', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Present"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                  Description
                                </label>
                                <textarea
                                  value={exp.description}
                                  onChange={(e) => onUpdateExperience(exp.id, 'description', e.target.value)}
                                  rows={6}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                  placeholder="Describe your responsibilities and achievements..."
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add Position Button */}
                    <button
                      onClick={onAddExperience}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Position
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Templates Tab Component
interface TemplatesTabProps {
  currentTemplateId: number | null;
  onSelect: (id: number) => void;
}

function TemplatesTab({ currentTemplateId, onSelect }: TemplatesTabProps) {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const filters = ['All', 'Classic', 'Photo', 'Modern'];
  
  const templates = [
    { id: 1, name: 'Professional Classic', category: 'Classic' },
    { id: 2, name: 'Tech Modern', category: 'Modern' },
    { id: 3, name: 'Executive Photo', category: 'Photo' },
    { id: 4, name: 'Creative Classic', category: 'Classic' },
    { id: 5, name: 'Minimalist Modern', category: 'Modern' },
    { id: 6, name: 'Portrait Photo', category: 'Photo' },
  ];

  const filteredTemplates = activeFilter === 'All' 
    ? templates 
    : templates.filter(t => t.category === activeFilter);

  return (
    <div className="p-6 space-y-6">
      {/* Filter Row */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const isSelected = currentTemplateId === template.id;
          return (
            <div
              key={template.id}
              onClick={() => onSelect(template.id)}
              className={`border rounded-lg overflow-hidden transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-400'
              }`}
              style={{ aspectRatio: '16/9' }}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <LayoutTemplate className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">{template.name}</p>
                  {isSelected && (
                    <p className="text-xs text-blue-600 font-semibold mt-1">Selected</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Formatting Tab Component
interface FormattingTabProps {
  values: FormattingValues;
  onChange: (key: string, value: string | number) => void;
}

function FormattingTab({ values, onChange }: FormattingTabProps) {
  const fonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'];
  const colors = [
    { name: 'Blue', value: '#3B82F6', class: 'bg-blue-500' },
    { name: 'Green', value: '#10B981', class: 'bg-green-500' },
    { name: 'Purple', value: '#8B5CF6', class: 'bg-purple-500' },
    { name: 'Red', value: '#EF4444', class: 'bg-red-500' },
    { name: 'Orange', value: '#F97316', class: 'bg-orange-500' },
    { name: 'Indigo', value: '#6366F1', class: 'bg-indigo-500' },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Typography Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Typography</h3>
        <div>
          <label htmlFor="font-family" className="block text-xs text-gray-600 mb-2">
            Font Family
          </label>
          <select
            id="font-family"
            value={values.font}
            onChange={(e) => onChange('font', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {fonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Spacing Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Spacing</h3>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="line-spacing" className="block text-xs text-gray-600">
              Line Spacing
            </label>
            <span className="text-xs text-gray-500">{values.lineSpacing.toFixed(1)}</span>
          </div>
          <input
            id="line-spacing"
            type="range"
            min="1"
            max="2.5"
            step="0.1"
            value={values.lineSpacing}
            onChange={(e) => onChange('lineSpacing', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* Colors Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Colors</h3>
        <div className="flex gap-3 flex-wrap">
          {colors.map((color) => {
            const isSelected = values.accentColor === color.value;
            return (
              <button
                key={color.name}
                onClick={() => onChange('accentColor', color.value)}
                className="group relative"
                title={color.name}
              >
                <div className={`w-10 h-10 rounded-full ${color.class} ring-2 ring-offset-2 transition-all cursor-pointer ${
                  isSelected ? 'ring-blue-400 ring-offset-1' : 'ring-gray-200 hover:ring-blue-400'
                }`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// AI Copilot Tab Component
interface AICopilotTabProps {
  atsScore: number;
  onAIAction: (action: string) => void;
}

function AICopilotTab({ atsScore, onAIAction }: AICopilotTabProps) {
  const actions = [
    { id: 'ats', label: 'ATS Optimization', icon: <FileText className="w-4 h-4" /> },
    { id: 'enhance', label: 'Enhance Text', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'gap', label: 'Gap Justification', icon: <Plus className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ATS Score Card */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-gray-600 mb-2">ATS Score</div>
        <div className="text-4xl font-bold text-blue-600 mb-1">{atsScore}%</div>
        <div className="text-xs text-gray-500">Run optimization to improve</div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAIAction(action.id)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
          >
            <div className="text-gray-600">{action.icon}</div>
            <span className="text-sm font-medium text-gray-900">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ResumeControlPanel({
  data,
  resumeData,
  onTemplateChange,
  onFormattingChange,
  onSectionToggle,
  onAIAction,
  onContentChange,
  onAddExperience,
  onRemoveExperience,
  onUpdateExperience,
}: ResumeControlPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('sections');

  const tabs: Tab[] = [
    { id: 'sections', label: 'Sections', icon: <Layers className="w-5 h-5" /> },
    { id: 'templates', label: 'Templates', icon: <LayoutTemplate className="w-5 h-5" /> },
    { id: 'formatting', label: 'Formatting', icon: <Palette className="w-5 h-5" /> },
    { id: 'copilot', label: 'AI Copilot', icon: <Bot className="w-5 h-5" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sections':
        return (
          <SectionsTab
            sections={data.sections}
            resumeData={resumeData}
            onToggle={onSectionToggle}
            onContentChange={onContentChange}
            onAddExperience={onAddExperience}
            onRemoveExperience={onRemoveExperience}
            onUpdateExperience={onUpdateExperience}
          />
        );
      case 'templates':
        return <TemplatesTab currentTemplateId={data.currentTemplateId} onSelect={onTemplateChange} />;
      case 'formatting':
        return <FormattingTab values={data.formatting} onChange={onFormattingChange} />;
      case 'copilot':
        return <AICopilotTab atsScore={data.atsScore} onAIAction={onAIAction} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar - Fixed Width */}
      <aside className="w-[72px] bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2 shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative w-full flex flex-col items-center justify-center py-3 transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
              )}
              
              {/* Icon */}
              <div
                className={`transition-colors duration-200 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {tab.icon}
              </div>
              
              {/* Label */}
              <span
                className={`text-[10px] mt-1.5 font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </aside>

      {/* Content Area */}
      <div className="flex-1 bg-white overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}

