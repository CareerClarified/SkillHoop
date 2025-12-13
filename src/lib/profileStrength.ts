import type { ResumeData } from '../types/resume';

export interface ProfileStrengthResult {
  score: number;
  suggestions: string[];
}

/**
 * Calculate profile strength based on resume completeness
 * Scoring Logic (Total 100):
 * - Basics: +10 points (Name, Email, Phone)
 * - Summary: +15 points (Must be > 50 characters)
 * - Experience: +30 points (Must have at least 1 item)
 * - Education: +15 points (Must have at least 1 item)
 * - Skills: +15 points (Must have at least 3 skills)
 * - Projects: +15 points
 */
export function calculateProfileStrength(resumeData: ResumeData): ProfileStrengthResult {
  const suggestions: string[] = [];
  let score = 0;

  // Basics: +10 points (Name, Email, Phone)
  const hasName = !!resumeData.personalInfo?.fullName?.trim();
  const hasEmail = !!resumeData.personalInfo?.email?.trim();
  const hasPhone = !!resumeData.personalInfo?.phone?.trim();

  if (hasName && hasEmail && hasPhone) {
    score += 10;
  } else {
    const missingBasics: string[] = [];
    if (!hasName) missingBasics.push('name');
    if (!hasEmail) missingBasics.push('email');
    if (!hasPhone) missingBasics.push('phone');
    suggestions.push(`Add your ${missingBasics.join(', ')} to complete basic information`);
  }

  // Summary: +15 points (Must be > 50 characters)
  const summary = resumeData.personalInfo?.summary?.trim() || '';
  if (summary.length > 50) {
    score += 15;
  } else {
    suggestions.push('Add a professional summary (at least 50 characters)');
  }

  // Experience: +30 points (Must have at least 1 item)
  const experienceSection = resumeData.sections?.find(section => section.id === 'experience' || section.type === 'experience');
  const experienceItems = experienceSection?.items || [];
  if (experienceItems.length >= 1) {
    score += 30;
  } else {
    suggestions.push('Add at least one work experience');
  }

  // Education: +15 points (Must have at least 1 item)
  const educationSection = resumeData.sections?.find(section => section.id === 'education' || section.type === 'education');
  const educationItems = educationSection?.items || [];
  if (educationItems.length >= 1) {
    score += 15;
  } else {
    suggestions.push('Add at least one education entry');
  }

  // Skills: +15 points (Must have at least 3 skills)
  const skillsSection = resumeData.sections?.find(section => section.id === 'skills' || section.type === 'skills');
  const skillsItems = skillsSection?.items || [];
  if (skillsItems.length >= 3) {
    score += 15;
  } else {
    const needed = 3 - skillsItems.length;
    suggestions.push(`Add ${needed} more skill${needed > 1 ? 's' : ''} (need at least 3 total)`);
  }

  // Projects: +15 points
  const hasProjects = (resumeData.projects && resumeData.projects.length > 0) || false;
  if (hasProjects) {
    score += 15;
  } else {
    suggestions.push('Add a project to showcase your work');
  }

  return {
    score: Math.min(score, 100), // Cap at 100
    suggestions,
  };
}

