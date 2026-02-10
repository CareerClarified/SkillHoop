/**
 * Native PDF document for the resume using @react-pdf/renderer.
 * Uses only Document, Page, View, Text, Image — no HTML (div, span, p).
 * Produces selectable, ATS-friendly PDFs.
 */

import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Link,
  pdf,
} from '@react-pdf/renderer';
import type { ResumeData, ResumeSection, SectionItem, PersonalInfo } from '../../types/resume';
import { getPdfStyles } from './resumePdfStyles';

export interface ResumePDFDocumentProps {
  resume: ResumeData;
}

/** Build full sections list including projects, certifications, languages, volunteer, custom (match ResumePreview). */
function getAllSections(resume: ResumeData): ResumeSection[] {
  const { sections, projects, certifications, languages, volunteer, customSections } = resume;
  const result = [...sections];

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

function ContactRow({ personalInfo, styles }: { personalInfo: PersonalInfo; styles: ReturnType<typeof getPdfStyles> }) {
  const hasAny =
    personalInfo.email ||
    personalInfo.phone ||
    personalInfo.linkedin ||
    personalInfo.website ||
    personalInfo.location;
  if (!hasAny) return null;
  return (
    <View style={styles.headerContact}>
      {personalInfo.email ? <Text>{personalInfo.email}</Text> : null}
      {personalInfo.phone ? <Text>{personalInfo.phone}</Text> : null}
      {personalInfo.linkedin ? (
        <Link src={personalInfo.linkedin}>LinkedIn</Link>
      ) : null}
      {personalInfo.website ? (
        <Link src={personalInfo.website}>Website</Link>
      ) : null}
      {personalInfo.location ? <Text>{personalInfo.location}</Text> : null}
    </View>
  );
}

function SectionItemBlock({
  item,
  styles,
  wrap,
}: {
  item: SectionItem;
  styles: ReturnType<typeof getPdfStyles>;
  wrap: boolean;
}) {
  return (
    <View style={styles.itemBlock} wrap={wrap}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.title || ''}</Text>
        {item.date ? (
          <Text style={styles.itemDate}>{item.date}</Text>
        ) : null}
      </View>
      {item.subtitle ? (
        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
      ) : null}
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
  styles: ReturnType<typeof getPdfStyles>;
}) {
  const isExperience = section.type === 'experience' || section.type === 'education' || section.type === 'projects' || section.type === 'volunteer' || section.type === 'custom';
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
            {item.subtitle ? <Text style={styles.itemSubtitle}>{item.subtitle}</Text> : null}
          </View>
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

export default function ResumePDFDocument({ resume }: ResumePDFDocumentProps) {
  const { personalInfo, settings } = resume;
  const allSections = getAllSections(resume);
  const styles = getPdfStyles({
    accentColor: settings.accentColor || '#3B82F6',
    fontSize: settings.fontSize || 11,
    lineHeight: settings.lineHeight || 1.5,
    fontFamily: settings.fontFamily || 'Helvetica',
  });

  const visibleSections = allSections.filter((s) => s.isVisible);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {personalInfo.profilePicture ? (
            <Image src={personalInfo.profilePicture} style={styles.profileImage} />
          ) : null}
          {personalInfo.fullName ? (
            <Text style={styles.headerName}>{personalInfo.fullName}</Text>
          ) : null}
          {personalInfo.jobTitle ? (
            <Text style={styles.headerJobTitle}>{personalInfo.jobTitle}</Text>
          ) : null}
          <ContactRow personalInfo={personalInfo} styles={styles} />
        </View>

        {/* Professional Summary */}
        {personalInfo.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>{personalInfo.summary}</Text>
          </View>
        ) : null}

        {/* Sections */}
        {visibleSections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <ResumeSectionContent section={section} styles={styles} />
          </View>
        ))}
      </Page>
    </Document>
  );
}

/** Generate PDF blob for programmatic download (e.g. from ExportModal). */
export async function getResumePdfBlob(resume: ResumeData): Promise<Blob> {
  const doc = <ResumePDFDocument resume={resume} />;
  return pdf(doc).toBlob();
}
