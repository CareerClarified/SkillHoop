/**
 * LoadingScreen
 * Full-screen loading state using the SkillHoop logo with arrow-flow and glint animation.
 * Use for app-level and page-level loading (Suspense fallback, auth check, data fetch).
 */

import React from 'react';
import SkillHoopLogo from './SkillHoopLogo';

export interface LoadingScreenProps {
  /** Primary message under the logo */
  message?: string;
  /** Optional secondary line (e.g. "Loading Application") */
  subMessage?: string;
  /** Logo size (default 120) */
  logoSize?: number;
  /** Optional className for the outer container */
  className?: string;
  /** If true, use min-h-screen and center; if false, just center content in available space */
  fullScreen?: boolean;
}

const defaultMessage = 'Just a moment...';
const defaultSubMessage = 'Loading';

export default function LoadingScreen({
  message = defaultMessage,
  subMessage = defaultSubMessage,
  logoSize = 120,
  className = '',
  fullScreen = true,
}: LoadingScreenProps) {
  const containerClass = fullScreen
    ? 'flex min-h-screen items-center justify-center bg-[#FDFDFD]'
    : 'flex items-center justify-center bg-[#FDFDFD] py-12';

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <SkillHoopLogo iconOnly animated width={logoSize} height={logoSize} />
        </div>
        <p className="text-slate-600 font-medium mb-1">{message}</p>
        {subMessage && (
          <p className="text-slate-400 text-sm">{subMessage}</p>
        )}
      </div>
    </div>
  );
}
