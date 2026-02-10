/**
 * Download Resume as PDF using @react-pdf/renderer (native, selectable, ATS-friendly).
 * Uses PDFDownloadLink to generate the file on the client and trigger download.
 */

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import type { ResumeData } from '../../types/resume';
import ResumePDFDocument from './ResumePDFDocument';

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s\-_.]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

export interface DownloadResumeButtonProps {
  resume: ResumeData;
  className?: string;
  children?: React.ReactNode;
  /** Optional filename (without .pdf). Defaults to resume.title */
  fileName?: string;
}

export default function DownloadResumeButton({
  resume,
  className = '',
  children,
  fileName,
}: DownloadResumeButtonProps) {
  const name = fileName ?? resume.title ?? 'Resume';
  const filename = `${sanitizeFilename(name)}.pdf`;

  return (
    <PDFDownloadLink
      document={<ResumePDFDocument resume={resume} />}
      fileName={filename}
      className={className}
    >
      {({ loading }) =>
        children ?? (
          <span className="flex items-center gap-2">
            {loading ? (
              <>Generating PDF…</>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </span>
        )
      }
    </PDFDownloadLink>
  );
}
