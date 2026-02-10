import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Link,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type {
  ResumeData,
  ResumeSection,
  SectionItem,
  PersonalInfo,
  FormattingSettings,
} from '../../../types/resume';
import type {
  ResumeTemplateConfig,
  TemplateRegionDefinition,
  TemplateSectionKey,
  ResumeTemplateTokens,
} from '../../../types/template';
import { getTemplateConfig } from '../../../lib/templateRegistry';

export interface MasterPDFRendererProps {
  resumeData: ResumeData;
  templateId: string;
}

type TemplateStyles = ReturnType<typeof createTemplateStyles>;

// Register Inter from a CDN so templates that specify it as a base font
// render correctly in the PDF output.
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://rsms.me/inter/font-files/Inter-Regular.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://rsms.me/inter/font-files/Inter-Bold.woff2',
      fontWeight: 700,
    },
  ],
});

function createTemplateStyles(
  config: ResumeTemplateConfig,
  settings: FormattingSettings
) {
  const tokens: ResumeTemplateTokens = config.tokens;

  const userAccent =
    settings.themeColor || settings.color || settings.accentColor;

  const baseFontFamily = settings.fontFamily || tokens.fonts.baseFamily;
  const baseFontSize = settings.fontSize || tokens.fonts.baseSize;
  const lineHeight = settings.lineHeight || tokens.fonts.lineHeight;
  const accent = userAccent || tokens.colors.accent;

  const { pageMargin, sectionSpacing, blockSpacing } = tokens.spacing;

  return StyleSheet.create({
    page: {
      paddingTop: pageMargin.top,
      paddingRight: pageMargin.right,
      paddingBottom: pageMargin.bottom,
      paddingLeft: pageMargin.left,
      fontFamily: baseFontFamily,
      fontSize: baseFontSize,
      lineHeight,
      color: tokens.colors.textPrimary,
      backgroundColor: tokens.colors.background,
    },
    bodyRow: {
      flexDirection: 'row',
      width: '100%',
    },
    bodyColumn: {
      flexDirection: 'column',
      width: '100%',
    },
    regionBase: {
      flexDirection: 'column',
    },
    sectionWrapper: {
      marginBottom: sectionSpacing,
    },
    sectionTitle: {
      fontSize: baseFontSize + 1,
      fontWeight: 700,
      color: accent,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 6,
      paddingBottom: 3,
      borderBottomWidth: 1.5,
      borderBottomColor: accent,
    },
    section: {
      marginBottom: blockSpacing,
    },
    summaryText: {
      fontSize: baseFontSize,
      color: tokens.colors.textPrimary,
      lineHeight,
    },
    itemBlock: {
      marginBottom: blockSpacing,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 3,
    },
    itemTitle: {
      fontSize: baseFontSize + 1,
      fontWeight: 700,
      color: '#0f172a',
    },
    itemDate: {
      fontSize: baseFontSize - 1,
      color: tokens.colors.textSecondary,
      flexShrink: 0,
      marginLeft: 8,
    },
    itemSubtitle: {
      fontSize: baseFontSize - 1,
      color: tokens.colors.textSecondary,
      fontStyle: 'italic',
      marginBottom: 3,
    },
    itemDescription: {
      fontSize: baseFontSize - 1,
      color: tokens.colors.textPrimary,
      lineHeight,
      marginTop: 1,
    },
    skillsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 4,
    },
    skillTag: {
      backgroundColor: '#f1f5f9',
      color: tokens.colors.textPrimary,
      paddingVertical: 3,
      paddingHorizontal: 8,
      fontSize: baseFontSize - 1,
      marginRight: 4,
      marginBottom: 4,
    },
    emptySection: {
      fontSize: baseFontSize - 1,
      color: tokens.colors.textSecondary,
      fontStyle: 'italic',
    },
    headerContainer: {
      alignItems: 'flex-start',
      marginBottom: sectionSpacing / 1.5,
      borderBottomWidth: 2,
      borderBottomColor: accent,
      paddingBottom: 6,
      width: '100%',
    },
    headerTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    headerName: {
      fontSize: baseFontSize + 7,
      fontWeight: 700,
      color: accent,
      marginBottom: 2,
    },
    headerJobTitle: {
      fontSize: baseFontSize + 1,
      color: tokens.colors.textSecondary,
      marginBottom: 4,
    },
    headerContact: {
      fontSize: baseFontSize - 1,
      color: tokens.colors.textSecondary,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    profileImage: {
      width: 54,
      height: 54,
      borderRadius: 27,
      marginLeft: 8,
    },
    photoWrapper: {
      alignItems: 'center',
      marginBottom: sectionSpacing / 2,
    },
    photoImage: {
      width: 88,
      height: 88,
      borderRadius: 44,
      marginBottom: 6,
    },
    link: {
      color: accent,
    },
    contactSeparator: {
      marginHorizontal: 4,
    },
  });
}

function getAllSections(resume: ResumeData): ResumeSection[] {
  const { sections, projects, certifications, languages, volunteer, customSections } = resume;
  const result: ResumeSection[] = [...sections];

  if (projects?.length) {
    result.push({
      id: 'projects',
      title: 'Projects',
      type: 'projects',
      isVisible: true,
      items: projects.map((p) => ({
        id: p.id,
        title: p.title || 'Untitled Project',
        subtitle: p.role || p.company || '',
        date: [p.startDate, p.endDate].filter(Boolean).join(' - '),
        description: p.description || '',
      })),
    });
  }

  if (certifications?.length) {
    result.push({
      id: 'certifications',
      title: 'Certifications',
      type: 'certifications',
      isVisible: true,
      items: certifications.map((c) => ({
        id: c.id,
        title: c.name || '',
        subtitle: c.issuer || '',
        date: c.date || '',
        description: c.url || '',
      })),
    });
  }

  if (languages?.length) {
    result.push({
      id: 'languages',
      title: 'Languages',
      type: 'languages',
      isVisible: true,
      items: languages.map((l) => ({
        id: l.id,
        title: l.language || '',
        subtitle: l.proficiency || '',
        date: '',
        description: '',
      })),
    });
  }

  if (volunteer?.length) {
    result.push({
      id: 'volunteer',
      title: 'Volunteer Work',
      type: 'volunteer',
      isVisible: true,
      items: volunteer.map((v) => ({
        id: v.id,
        title: v.organization || '',
        subtitle: v.role || '',
        date: [v.startDate, v.endDate].filter(Boolean).join(' - '),
        description: v.description || '',
      })),
    });
  }

  if (customSections?.length) {
    customSections.forEach((cs) => {
      result.push({
        id: cs.id,
        title: cs.title || '',
        type: 'custom',
        isVisible: true,
        items: cs.items || [],
      });
    });
  }

  return result;
}

function ContactRow({
  personalInfo,
  styles,
}: {
  personalInfo: PersonalInfo;
  styles: TemplateStyles;
}) {
  const parts: React.ReactNode[] = [];

  if (personalInfo.email) {
    parts.push(<Text key="email">{personalInfo.email}</Text>);
  }
  if (personalInfo.phone) {
    parts.push(<Text key="phone">{personalInfo.phone}</Text>);
  }
  if (personalInfo.linkedin) {
    parts.push(
      <Link key="linkedin" src={personalInfo.linkedin} style={styles.link}>
        LinkedIn
      </Link>
    );
  }
  if (personalInfo.website) {
    parts.push(
      <Link key="website" src={personalInfo.website} style={styles.link}>
        Website
      </Link>
    );
  }
  if (personalInfo.location) {
    parts.push(<Text key="location">{personalInfo.location}</Text>);
  }

  if (!parts.length) return null;

  return (
    <View style={styles.headerContact}>
      {parts.map((node, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 ? <Text style={styles.contactSeparator}>•</Text> : null}
          {node}
        </React.Fragment>
      ))}
    </View>
  );
}

function PDFHeader({
  personalInfo,
  styles,
}: {
  personalInfo: PersonalInfo;
  styles: TemplateStyles;
}) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTopRow}>
        <View>
          {personalInfo.fullName ? (
            <Text style={styles.headerName}>{personalInfo.fullName}</Text>
          ) : null}
          {personalInfo.jobTitle ? (
            <Text style={styles.headerJobTitle}>{personalInfo.jobTitle}</Text>
          ) : null}
        </View>
        {personalInfo.profilePicture ? (
          <Image src={personalInfo.profilePicture} style={styles.profileImage} />
        ) : null}
      </View>
      <ContactRow personalInfo={personalInfo} styles={styles} />
    </View>
  );
}

function PDFSummary({
  personalInfo,
  styles,
}: {
  personalInfo: PersonalInfo;
  styles: TemplateStyles;
}) {
  if (!personalInfo.summary) return null;
  return (
    <View style={styles.sectionWrapper}>
      <Text style={styles.sectionTitle}>Professional Summary</Text>
      <Text style={styles.summaryText}>{personalInfo.summary}</Text>
    </View>
  );
}

function PDFContact({
  personalInfo,
  styles,
}: {
  personalInfo: PersonalInfo;
  styles: TemplateStyles;
}) {
  return (
    <View style={styles.sectionWrapper}>
      <Text style={styles.sectionTitle}>Contact</Text>
      <ContactRow personalInfo={personalInfo} styles={styles} />
    </View>
  );
}

function PDFPhoto({
  personalInfo,
  styles,
}: {
  personalInfo: PersonalInfo;
  styles: TemplateStyles;
}) {
  if (!personalInfo.profilePicture) return null;
  return (
    <View style={styles.photoWrapper}>
      <Image src={personalInfo.profilePicture} style={styles.photoImage} />
    </View>
  );
}

function SectionItemBlock({
  item,
  styles,
  wrap,
}: {
  item: SectionItem;
  styles: TemplateStyles;
  wrap: boolean;
}) {
  return (
    <View style={styles.itemBlock} wrap={wrap}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.title || ''}</Text>
        {item.date ? <Text style={styles.itemDate}>{item.date}</Text> : null}
      </View>
      {item.subtitle ? <Text style={styles.itemSubtitle}>{item.subtitle}</Text> : null}
      {item.description ? (
        <Text style={styles.itemDescription}>{item.description}</Text>
      ) : null}
    </View>
  );
}

function ResumeSectionContent({
  section,
  styles,
}: {
  section: ResumeSection;
  styles: TemplateStyles;
}) {
  const isExperience =
    section.type === 'experience' ||
    section.type === 'education' ||
    section.type === 'projects' ||
    section.type === 'volunteer' ||
    section.type === 'custom';
  const isSkills = section.type === 'skills';
  const isLanguages = section.type === 'languages';
  const isCertifications = section.type === 'certifications';

  if (isSkills && section.items?.length) {
    return (
      <View style={styles.skillsRow}>
        {section.items.map((item, idx) => (
          <View key={item.id || idx} style={styles.skillTag}>
            <Text>
              {item.title}
              {item.subtitle ? ` (${item.subtitle})` : ''}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  if ((isLanguages || isCertifications) && section.items?.length) {
    return (
      <>
        {section.items.map((item, idx) => (
          <View key={item.id || idx} style={styles.itemBlock} wrap={false}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item.title || ''}</Text>
              {item.date ? <Text style={styles.itemDate}>{item.date}</Text> : null}
            </View>
            {item.subtitle ? (
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            ) : null}
          </View>
        ))}
      </>
    );
  }

  if (isExperience && section.items && section.items.length > 0) {
    return (
      <>
        {section.items.map((item, idx) => (
          <SectionItemBlock
            key={item.id || idx}
            item={item}
            styles={styles}
            wrap={false}
          />
        ))}
      </>
    );
  }

  if (section.items && section.items.length > 0) {
    return (
      <>
        {section.items.map((item, idx) => (
          <SectionItemBlock
            key={item.id || idx}
            item={item}
            styles={styles}
            wrap={false}
          />
        ))}
      </>
    );
  }

  return <Text style={styles.emptySection}>No items in this section yet.</Text>;
}

function renderSection(
  key: TemplateSectionKey,
  resume: ResumeData,
  sections: ResumeSection[],
  styles: TemplateStyles
): React.ReactNode {
  if (key === 'header') {
    return <PDFHeader personalInfo={resume.personalInfo} styles={styles} />;
  }

  if (key === 'summary') {
    return <PDFSummary personalInfo={resume.personalInfo} styles={styles} />;
  }

  if (key === 'contact') {
    return <PDFContact personalInfo={resume.personalInfo} styles={styles} />;
  }

  if (key === 'photo') {
    return <PDFPhoto personalInfo={resume.personalInfo} styles={styles} />;
  }

  // Map section types to actual ResumeSection instances (may be multiple for 'custom', etc.)
  const matchingSections = sections.filter(
    (section) => section.type === key && section.isVisible
  );

  // Empty section safety: if there are no visible sections with items, render nothing.
  const nonEmptySections = matchingSections.filter(
    (section) => Array.isArray(section.items) && section.items.length > 0
  );

  if (!nonEmptySections.length) {
    return null;
  }

  return (
    <>
      {nonEmptySections.map((section) => (
        <View key={section.id} style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <ResumeSectionContent section={section} styles={styles} />
        </View>
      ))}
    </>
  );
}

function RegionView({
  region,
  config,
  styles,
  resume,
  sections,
  isLastInRow,
}: {
  region: TemplateRegionDefinition;
  config: ResumeTemplateConfig;
  styles: TemplateStyles;
  resume: ResumeData;
  sections: ResumeSection[];
  isLastInRow: boolean;
}) {
  const contentKeys =
    getOrderedSectionKeysForRegion(config, region.id, resume, sections);

  // Compute flex-based width distribution for body regions in row layouts.
  const isBodyRow =
    region.slot === 'body' && (config.layout === 'sidebar-left' || config.layout === 'sidebar-right' || config.layout === 'two-column');

  const flexGrow = isBodyRow ? region.widthFraction ?? 1 : 1;

  const padding = region.padding;

  const regionStyle: any = {
    ...styles.regionBase,
    backgroundColor: region.backgroundColor,
    paddingTop: padding?.top,
    paddingRight: padding?.right,
    paddingBottom: padding?.bottom,
    paddingLeft: padding?.left,
    flexGrow,
    flexShrink: isBodyRow ? 0 : 1,
    flexBasis: isBodyRow ? 0 : 'auto',
    flexDirection: region.direction,
    marginRight: isBodyRow && !isLastInRow ? 12 : 0,
  };

  return (
    <View style={regionStyle}>
      {contentKeys.map((key, index) => (
        <View
          key={`${region.id}-${key}-${index}`}
          style={index > 0 && region.gap ? { marginTop: region.gap } : undefined}
        >
          {renderSection(key, resume, sections, styles)}
        </View>
      ))}
    </View>
  );
}

function getOrderedSectionKeysForRegion(
  config: ResumeTemplateConfig,
  regionId: TemplateRegionDefinition['id'],
  resume: ResumeData,
  sections: ResumeSection[]
): TemplateSectionKey[] {
  const regionConfigKeys = config.regions.content[regionId] || [];
  if (!regionConfigKeys.length) return [];

  const allowed = new Set<TemplateSectionKey>(regionConfigKeys);
  const ordered: TemplateSectionKey[] = [];

  // User-driven section order derived from the actual sections array (which
  // reflects drag-and-drop reordering in the editor), plus any derived sections
  // we added in getAllSections.
  const typeOrder: TemplateSectionKey[] = [];
  sections.forEach((section) => {
    const type = section.type as TemplateSectionKey;
    if (!typeOrder.includes(type)) {
      typeOrder.push(type);
    }
  });

  // Synthetic keys have a fixed logical ordering relative to each other.
  const syntheticOrder: TemplateSectionKey[] = ['header', 'summary', 'contact', 'photo'];

  const combinedOrder: TemplateSectionKey[] = [...syntheticOrder, ...typeOrder];

  combinedOrder.forEach((key) => {
    if (allowed.has(key) && !ordered.includes(key)) {
      ordered.push(key);
    }
  });

  // Fallback: ensure any regionConfigKeys not already included still show up,
  // preserving registry defaults when no user preference exists.
  regionConfigKeys.forEach((key) => {
    if (!ordered.includes(key)) {
      ordered.push(key);
    }
  });

  return ordered;
}

export default function MasterPDFRenderer({
  resumeData,
  templateId,
}: MasterPDFRendererProps) {
  const config = getTemplateConfig(templateId || resumeData.settings.templateId || 'classic');
  const allSections = getAllSections(resumeData).filter((s) => s.isVisible);
  const styles = createTemplateStyles(config, resumeData.settings);

  const headerRegions = config.regions.structure.filter((r) => r.slot === 'header');
  const bodyRegions = config.regions.structure.filter((r) => r.slot === 'body');
  const footerRegions = config.regions.structure.filter((r) => r.slot === 'footer');

  const bodyWrapperStyle =
    config.layout === 'single-column' ? styles.bodyColumn : styles.bodyRow;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {headerRegions.map((region) => (
          <RegionView
            key={region.id}
            region={region}
            config={config}
            styles={styles}
            resume={resumeData}
            sections={allSections}
            isLastInRow
          />
        ))}

        {bodyRegions.length > 0 && (
          <View style={bodyWrapperStyle}>
            {bodyRegions.map((region, idx) => (
              <RegionView
                key={region.id}
                region={region}
                config={config}
                styles={styles}
                resume={resumeData}
                sections={allSections}
                isLastInRow={idx === bodyRegions.length - 1}
              />
            ))}
          </View>
        )}

        {footerRegions.map((region) => (
          <RegionView
            key={region.id}
            region={region}
            config={config}
            styles={styles}
            resume={resumeData}
            sections={allSections}
            isLastInRow
          />
        ))}
      </Page>
    </Document>
  );
}

