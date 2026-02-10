import type {
  ResumeTemplateConfig,
  ResumeTemplateId,
  TemplateSpacing,
} from '../types/template';

const pageMargin: TemplateSpacing = {
  top: 24,
  right: 32,
  bottom: 24,
  left: 32,
};

const classicTemplate: ResumeTemplateConfig = {
  id: 'classic',
  label: 'Classic',
  layout: 'single-column',
  regions: {
    structure: [
      {
        id: 'main',
        slot: 'body',
        direction: 'column',
        widthFraction: 1,
        gap: 16,
      },
    ],
    content: {
      main: ['header', 'summary', 'experience', 'education', 'skills'],
    },
  },
  tokens: {
    fonts: {
      baseFamily: 'Georgia',
      headingFamily: 'Georgia-Bold',
      baseSize: 11,
      lineHeight: 1.5,
    },
    colors: {
      accent: '#374151',
      textPrimary: '#111827',
      textSecondary: '#4B5563',
      background: '#ffffff',
    },
    spacing: {
      pageMargin,
      sectionSpacing: 16,
      blockSpacing: 10,
    },
  },
};

const modernTemplate: ResumeTemplateConfig = {
  id: 'modern',
  label: 'Modern Sidebar',
  layout: 'sidebar-left',
  regions: {
    structure: [
      {
        id: 'sidebar',
        slot: 'body',
        direction: 'column',
        widthFraction: 0.3,
        backgroundColor: '#f3f4f6',
        padding: { top: 0, right: 12, bottom: 0, left: 12 },
        gap: 12,
      },
      {
        id: 'main',
        slot: 'body',
        direction: 'column',
        widthFraction: 0.7,
        padding: { top: 0, right: 0, bottom: 0, left: 16 },
        gap: 16,
      },
    ],
    content: {
      sidebar: ['contact', 'skills', 'languages'],
      main: ['header', 'summary', 'experience', 'projects'],
    },
  },
  tokens: {
    fonts: {
      baseFamily: 'Inter',
      headingFamily: 'Inter',
      baseSize: 11,
      lineHeight: 1.5,
    },
    colors: {
      accent: '#3B82F6',
      textPrimary: '#334155',
      textSecondary: '#64748b',
      background: '#ffffff',
      sidebarBackground: '#f3f4f6',
    },
    spacing: {
      pageMargin,
      sectionSpacing: 16,
      blockSpacing: 10,
    },
  },
};

const minimalTemplate: ResumeTemplateConfig = {
  id: 'minimal',
  label: 'Minimal',
  layout: 'single-column',
  regions: {
    structure: [
      {
        id: 'main',
        slot: 'body',
        direction: 'column',
        widthFraction: 1,
        gap: 14,
      },
    ],
    content: {
      main: ['header', 'summary', 'skills', 'experience', 'education'],
    },
  },
  tokens: {
    fonts: {
      baseFamily: 'Inter',
      headingFamily: 'Inter',
      baseSize: 10,
      lineHeight: 1.5,
    },
    colors: {
      accent: '#6B7280',
      textPrimary: '#374151',
      textSecondary: '#9CA3AF',
      background: '#ffffff',
    },
    spacing: {
      pageMargin,
      sectionSpacing: 14,
      blockSpacing: 8,
    },
  },
};

const professionalTemplate: ResumeTemplateConfig = {
  id: 'professional',
  label: 'Professional',
  layout: 'two-column',
  regions: {
    structure: [
      {
        id: 'header',
        slot: 'header',
        direction: 'column',
        backgroundColor: '#111827',
        padding: { top: 16, right: 24, bottom: 12, left: 24 },
        gap: 8,
      },
      {
        id: 'sidebar',
        slot: 'body',
        direction: 'column',
        widthFraction: 0.4,
        backgroundColor: '#F9FAFB',
        padding: { top: 12, right: 12, bottom: 12, left: 12 },
        gap: 10,
      },
      {
        id: 'main',
        slot: 'body',
        direction: 'column',
        widthFraction: 0.6,
        padding: { top: 12, right: 0, bottom: 12, left: 16 },
        gap: 14,
      },
    ],
    content: {
      header: ['header'],
      sidebar: ['contact', 'skills', 'languages', 'certifications'],
      main: ['summary', 'experience', 'education', 'projects'],
    },
  },
  tokens: {
    fonts: {
      baseFamily: 'Inter',
      headingFamily: 'Inter',
      baseSize: 11,
      lineHeight: 1.5,
    },
    colors: {
      accent: '#F9FAFB',
      textPrimary: '#111827',
      textSecondary: '#6B7280',
      background: '#ffffff',
      headerBackground: '#111827',
      sidebarBackground: '#F9FAFB',
    },
    spacing: {
      pageMargin,
      sectionSpacing: 16,
      blockSpacing: 10,
    },
  },
};

const photoTemplate: ResumeTemplateConfig = {
  id: 'photo',
  label: 'Photo Sidebar',
  layout: 'sidebar-left',
  regions: {
    structure: [
      {
        id: 'sidebar',
        slot: 'body',
        direction: 'column',
        widthFraction: 0.35,
        backgroundColor: '#EFF6FF',
        padding: { top: 12, right: 12, bottom: 12, left: 12 },
        gap: 10,
      },
      {
        id: 'main',
        slot: 'body',
        direction: 'column',
        widthFraction: 0.65,
        padding: { top: 12, right: 0, bottom: 12, left: 16 },
        gap: 14,
      },
    ],
    content: {
      // Ensure photo is always first in the sidebar
      sidebar: ['photo', 'contact', 'skills', 'languages'],
      main: ['header', 'summary', 'experience', 'education', 'projects'],
    },
  },
  tokens: {
    fonts: {
      baseFamily: 'Inter',
      headingFamily: 'Inter',
      baseSize: 10,
      lineHeight: 1.5,
    },
    colors: {
      accent: '#2563EB',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280',
      background: '#ffffff',
      sidebarBackground: '#EFF6FF',
    },
    spacing: {
      pageMargin,
      sectionSpacing: 16,
      blockSpacing: 9,
    },
  },
};

export const templateRegistry: Record<ResumeTemplateId, ResumeTemplateConfig> = {
  classic: classicTemplate,
  modern: modernTemplate,
  minimal: minimalTemplate,
  professional: professionalTemplate,
  photo: photoTemplate,
};

export function getTemplateConfig(templateId: string): ResumeTemplateConfig {
  const id = (templateId || 'classic') as ResumeTemplateId;
  return templateRegistry[id] ?? classicTemplate;
}

