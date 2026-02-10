/**
 * PDF styles and font registration for @react-pdf/renderer.
 * Uses StyleSheet.create() — no Tailwind/HTML here.
 *
 * Fonts: @react-pdf/renderer supports TTF and WOFF (not WOFF2).
 * To use Inter or Roboto:
 * 1. Download Inter-Regular.ttf and Inter-Bold.ttf (e.g. from fontsource or Google Fonts)
 * 2. Place them in public/fonts/
 * 3. Uncomment and use the Font.register block below.
 * Until then, we use built-in Helvetica for reliable rendering.
 */

import { StyleSheet } from '@react-pdf/renderer';

// Optional: Register Inter from public/fonts (add the files to your project first)
// Font.register({
//   family: 'Inter',
//   fonts: [
//     { src: '/fonts/Inter-Regular.ttf', fontWeight: 400 },
//     { src: '/fonts/Inter-Bold.ttf', fontWeight: 700 },
//   ],
// });

// Alternative: Register Roboto from a CDN (TTF; ensure CORS allows it)
// Font.register({
//   family: 'Roboto',
//   fonts: [
//     { src: 'https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.0/files/roboto-latin-400-normal.woff', fontWeight: 400 },
//     { src: 'https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.0/files/roboto-latin-700-normal.woff', fontWeight: 700 },
//   ],
// });

const accentColor = '#3B82F6'; // default; overridden per-document via props
const slate900 = '#0f172a';
const slate700 = '#334155';
const slate600 = '#475569';
const slate500 = '#64748b';

export const getPdfStyles = (options: {
  accentColor?: string;
  fontSize?: number;
  lineHeight?: number;
  fontFamily?: string;
}) => {
  const {
    accentColor: accent = accentColor,
    fontSize = 11,
    lineHeight = 1.5,
    fontFamily = 'Helvetica',
  } = options;

  return StyleSheet.create({
    page: {
      paddingTop: 24,
      paddingBottom: 24,
      paddingLeft: 32,
      paddingRight: 32,
      fontFamily,
      fontSize,
      lineHeight,
      color: slate700,
    },
    header: {
      textAlign: 'center',
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 2,
      borderBottomColor: accent,
    },
    headerName: {
      fontSize: 24,
      fontWeight: 700,
      color: accent,
      marginBottom: 6,
    },
    headerJobTitle: {
      fontSize: 14,
      color: slate600,
      marginBottom: 8,
    },
    headerContact: {
      fontSize: 10,
      color: slate600,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 700,
      color: accent,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 10,
      paddingBottom: 4,
      borderBottomWidth: 2,
      borderBottomColor: accent,
    },
    summaryText: {
      fontSize,
      color: slate700,
      lineHeight,
      marginBottom: 4,
    },
    itemBlock: {
      marginBottom: 14,
      // Keep each experience/education item together when possible (page break control)
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    itemTitle: {
      fontSize: 12,
      fontWeight: 700,
      color: slate900,
    },
    itemDate: {
      fontSize: 10,
      color: slate600,
      flexShrink: 0,
      marginLeft: 8,
    },
    itemSubtitle: {
      fontSize: 10,
      color: slate600,
      fontStyle: 'italic',
      marginBottom: 4,
    },
    itemDescription: {
      fontSize: 10,
      color: slate700,
      lineHeight,
      marginTop: 2,
      whiteSpace: 'pre-wrap',
    },
    skillsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4,
    },
    skillTag: {
      backgroundColor: '#f1f5f9',
      color: slate700,
      paddingVertical: 4,
      paddingHorizontal: 10,
      fontSize: 10,
      fontWeight: 500,
    },
    emptySection: {
      fontSize: 10,
      color: slate500,
      fontStyle: 'italic',
    },
    profileImage: {
      width: 64,
      height: 64,
      borderRadius: 32,
      marginBottom: 8,
      objectFit: 'cover',
    },
  });
};

export type PdfStyles = ReturnType<typeof getPdfStyles>;
