import type { ResumeSection } from './resume';

/**
 * Stable identifier for a resume template.
 * Mirrors values like resume.settings.templateId ('classic', 'modern', etc.).
 *
 * Explicit union for first-class templates, plus an open string extension so
 * experimental/legacy ids still type-check.
 */
export type ResumeTemplateId =
  | 'classic'
  | 'modern'
  | 'minimal'
  | 'professional'
  | 'photo'
  | (string & {});

/**
 * High-level layout archetypes understood by the PDF renderer.
 *
 * - 'single-column'  → classic stacked sections
 * - 'sidebar-left'   → narrow left column + main content on the right
 * - 'sidebar-right'  → mirror of sidebar-left
 * - 'two-column'     → balanced two-column layout (future-friendly)
 */
export type ResumeLayoutType =
  | 'single-column'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'two-column';

/**
 * Known structural regions that a template can define.
 * Custom region ids are allowed via the string extension.
 */
export type TemplateRegionId =
  | 'header'
  | 'main'
  | 'sidebar'
  | 'footer'
  | (string & {});

/**
 * Semantic sections that can be rendered inside regions.
 *
 * This combines:
 * - synthetic sections derived from personal info (header, summary, contact, photo)
 * - typed resume sections (experience, education, skills, projects, etc.)
 */
export type TemplateSectionKey =
  | 'header'
  | 'summary'
  | 'contact'
  | 'photo'
  | ResumeSection['type']; // 'personal' | 'experience' | 'education' | 'skills' | 'projects' | ...

/**
 * Simple 4-side spacing shorthand in PDF points.
 */
export interface TemplateSpacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Structural definition of a single region on the page.
 *
 * This controls the layout behavior of that region (flow direction, width,
 * background, padding, etc.). It does NOT decide *what* content goes there —
 * see TemplateRegionContentMap for that.
 */
export interface TemplateRegionDefinition {
  /** Region identifier, e.g. 'header', 'sidebar', 'main'. */
  id: TemplateRegionId;

  /**
   * High-level slot this region occupies.
   * - 'header' → full-width at the top of the page
   * - 'body'   → participates in the main row/column body layout
   * - 'footer' → full-width at the bottom of the page
   */
  slot: 'header' | 'body' | 'footer';

  /**
   * Flex direction for content inside the region.
   * The master renderer will translate this to <View style={{ flexDirection }} />.
   */
  direction: 'row' | 'column';

  /**
   * Optional width fraction (0–1) for body regions when the body flows in a row.
   * Example: sidebar: 0.3, main: 0.7.
   * For full-width regions (header/footer or single-column main), this can be omitted.
   */
  widthFraction?: number;

  /** Background color for the entire region block (e.g. sidebar background). */
  backgroundColor?: string;

  /** Inner padding for the region (in PDF points). */
  padding?: TemplateSpacing;

  /** Gap between stacked section blocks inside this region (in PDF points). */
  gap?: number;
}

/**
 * Mapping from region id → ordered list of semantic sections rendered there.
 *
 * Example (modern layout):
 * {
 *   header: ['header', 'contact'],
 *   sidebar: ['photo', 'contact', 'skills'],
 *   main: ['summary', 'experience', 'education', 'projects']
 * }
 */
export type TemplateRegionContentMap = Partial<
  Record<TemplateRegionId, TemplateSectionKey[]>
>;

/**
 * Design tokens that control the visual appearance of a template.
 *
 * These are intentionally abstract so the master renderer can translate them
 * into @react-pdf/renderer StyleSheet definitions without hardcoding per-template
 * styles. Resume-level settings (font size, accent color overrides, etc.) can
 * still be merged on top of these defaults.
 */
export interface ResumeTemplateTokens {
  fonts: {
    /**
     * Base text font family name, e.g. 'Helvetica' or 'Inter'.
     * This should correspond to a registered @react-pdf/renderer font family.
     */
    baseFamily: string;
    /**
     * Optional heading font family; falls back to baseFamily when omitted.
     * Useful when you want headings in a serif and body in a sans-serif, etc.
     */
    headingFamily?: string;
    /** Base font size for body text. */
    baseSize: number;
    /** Line height multiplier for body text. */
    lineHeight: number;
  };
  colors: {
    /** Primary accent color (section titles, dividers, etc.). */
    accent: string;
    /** Default text color. */
    textPrimary: string;
    /** Muted text color for subtitles, metadata, etc. */
    textSecondary: string;
    /** Page background color. */
    background: string;
    /** Optional dedicated background for the sidebar region. */
    sidebarBackground?: string;
    /** Optional dedicated background for the header region. */
    headerBackground?: string;
  };
  spacing: {
    /** Page margin in PDF points. */
    pageMargin: TemplateSpacing;
    /** Vertical spacing between top-level sections within a region. */
    sectionSpacing: number;
    /** Vertical spacing between items inside a section. */
    blockSpacing: number;
  };
}

/**
 * Master configuration object for a resume template.
 *
 * This is what the MasterPDFRenderer will consume:
 * - layout: describes the high-level layout archetype
 * - regions.structure: defines which regions exist and how they are laid out
 * - regions.content: decides which sections render in which region and in what order
 * - tokens: visual design tokens used to build @react-pdf/renderer styles
 */
export interface ResumeTemplateConfig {
  /** Stable id (e.g. 'classic', 'modern'). Should match ResumeTemplateId when possible. */
  id: ResumeTemplateId;

  /** Human-friendly label for display in the UI (e.g. "Classic", "Modern Sidebar"). */
  label: string;

  /** High-level layout archetype (single column, sidebar left, etc.). */
  layout: ResumeLayoutType;

  /** Structural and content configuration per region. */
  regions: {
    /** Structural definition of each available region. */
    structure: TemplateRegionDefinition[];
    /** Mapping from region id to the sections that appear there, in order. */
    content: TemplateRegionContentMap;
  };

  /** Visual design tokens (fonts, colors, spacing, margins, region backgrounds). */
  tokens: ResumeTemplateTokens;
}

