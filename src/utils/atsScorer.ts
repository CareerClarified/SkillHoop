/**
 * ATS Scorer Utility
 * Calculates ATS score based on resume completeness and best practices
 */

import { ResumeData } from '../components/resume/ResumeControlPanel';

export interface ATSAnalysis {
  score: number;
  suggestions: string[];
}

// Action verbs commonly used in strong resume descriptions
const ACTION_VERBS = [
  'led', 'managed', 'created', 'developed', 'designed', 'implemented',
  'improved', 'increased', 'decreased', 'reduced', 'optimized', 'built',
  'established', 'launched', 'delivered', 'achieved', 'executed', 'coordinated',
  'supervised', 'trained', 'mentored', 'collaborated', 'initiated', 'streamlined',
  'transformed', 'enhanced', 'generated', 'produced', 'facilitated', 'organized'
];

/**
 * Calculate ATS score for a resume
 * @param data - Resume data to analyze
 * @param templateString - Template type ('classic', 'modern', 'creative', etc.)
 * @returns ATS analysis with score and suggestions
 */
export function calculateATSScore(
  data: ResumeData,
  templateString?: string
): ATSAnalysis {
  let score = 0;
  const suggestions: string[] = [];

  // 1. Contact Info (20pts): Email (5), Phone (5), Location (5), LinkedIn/Link (5)
  if (data.personalInfo.email && data.personalInfo.email.trim() !== '') {
    score += 5;
  } else {
    suggestions.push('Add your email address');
  }

  if (data.personalInfo.phone && data.personalInfo.phone.trim() !== '') {
    score += 5;
  } else {
    suggestions.push('Add your phone number');
  }

  if (data.personalInfo.location && data.personalInfo.location.trim() !== '') {
    score += 5;
  } else {
    suggestions.push('Add your location');
  }

  // Check for LinkedIn or portfolio link
  // Check if personalInfo has linkedIn or portfolio fields (they may not be in the type definition)
  const personalInfoAny = data.personalInfo as any;
  const hasLinkedIn = personalInfoAny.linkedIn && personalInfoAny.linkedIn.trim() !== '';
  const hasPortfolio = personalInfoAny.portfolio && personalInfoAny.portfolio.trim() !== '';
  const hasWebsite = personalInfoAny.website && personalInfoAny.website.trim() !== '';
  
  if (hasLinkedIn || hasPortfolio || hasWebsite) {
    score += 5;
  } else {
    suggestions.push('Add your LinkedIn profile or portfolio link');
  }

  // 2. Summary (15pts): Present and longer than 50 characters
  if (data.summary && data.summary.trim().length > 50) {
    score += 15;
  } else if (data.summary && data.summary.trim().length > 0) {
    score += 5; // Partial credit for having a summary but too short
    suggestions.push('Expand your professional summary to at least 50 characters');
  } else {
    suggestions.push('Add a professional summary');
  }

  // 3. Experience (25pts): At least 1 job (10), Descriptions contain action verbs (15)
  if (data.experience && data.experience.length > 0) {
    score += 10;
    
    // Check for action verbs in experience descriptions
    let hasActionVerbs = false;
    for (const exp of data.experience) {
      if (exp.description) {
        const descriptionLower = exp.description.toLowerCase();
        for (const verb of ACTION_VERBS) {
          if (descriptionLower.includes(verb)) {
            hasActionVerbs = true;
            break;
          }
        }
        if (hasActionVerbs) break;
      }
    }
    
    if (hasActionVerbs) {
      score += 15;
    } else {
      suggestions.push('Use more action verbs in your experience descriptions (e.g., "Led", "Managed", "Created", "Developed")');
    }
  } else {
    suggestions.push('Add at least one work experience entry');
  }

  // 4. Education (15pts): At least 1 school listed
  if (data.education && data.education.length > 0) {
    score += 15;
  } else {
    suggestions.push('Add at least one education entry');
  }

  // 5. Skills (15pts): At least 5 skills listed
  if (data.skills && data.skills.length >= 5) {
    score += 15;
  } else if (data.skills && data.skills.length > 0) {
    const missing = 5 - data.skills.length;
    score += data.skills.length * 3; // 3 points per skill up to 15
    suggestions.push(`Add ${missing} more skill${missing > 1 ? 's' : ''} (currently have ${data.skills.length}, need 5)`);
  } else {
    suggestions.push('Add at least 5 skills');
  }

  // 6. Formatting (10pts): Profile picture present (if template is 'modern' or 'creative')
  const requiresPhoto = templateString === 'modern' || templateString === 'creative';
  if (requiresPhoto) {
    if (data.profilePicture && data.profilePicture.trim() !== '') {
      score += 10;
    } else {
      suggestions.push('Add a profile picture (required for modern/creative templates)');
    }
  } else {
    // If template doesn't require photo, give full points for formatting
    score += 10;
  }

  return {
    score: Math.min(100, Math.max(0, score)), // Ensure score is between 0 and 100
    suggestions,
  };
}

