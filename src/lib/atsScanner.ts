import { ResumeData } from '../types/resume';

export interface ATSScanResult {
  score: number;
  missingKeywords: string[];
  formattingIssues: string[];
}

/**
 * Convert ResumeData to plain text for scanning
 */
function resumeToText(resume: ResumeData): string {
  const parts: string[] = [];

  // Personal Info
  if (resume.personalInfo.fullName) parts.push(resume.personalInfo.fullName);
  if (resume.personalInfo.jobTitle) parts.push(resume.personalInfo.jobTitle);
  if (resume.personalInfo.email) parts.push(resume.personalInfo.email);
  if (resume.personalInfo.phone) parts.push(resume.personalInfo.phone);
  if (resume.personalInfo.location) parts.push(resume.personalInfo.location);
  if (resume.personalInfo.linkedin) parts.push(resume.personalInfo.linkedin);
  if (resume.personalInfo.website) parts.push(resume.personalInfo.website);
  if (resume.personalInfo.summary) parts.push(resume.personalInfo.summary);

  // Sections
  resume.sections
    .filter(section => section.isVisible)
    .forEach(section => {
      if (section.items && section.items.length > 0) {
        section.items.forEach(item => {
          if (item.title) parts.push(item.title);
          if (item.subtitle) parts.push(item.subtitle);
          if (item.description) parts.push(item.description);
          if (item.date) parts.push(item.date);
        });
      }
    });

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    resume.projects.forEach(project => {
      if (project.title) parts.push(project.title);
      if (project.role) parts.push(project.role);
      if (project.company) parts.push(project.company);
      if (project.description) parts.push(project.description);
    });
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    resume.certifications.forEach(cert => {
      if (cert.name) parts.push(cert.name);
      if (cert.issuer) parts.push(cert.issuer);
    });
  }

  // Languages
  if (resume.languages && resume.languages.length > 0) {
    resume.languages.forEach(lang => {
      if (lang.language) parts.push(lang.language);
      if (lang.proficiency) parts.push(lang.proficiency);
    });
  }

  // Custom Sections
  if (resume.customSections && resume.customSections.length > 0) {
    resume.customSections.forEach(section => {
      if (section.items && section.items.length > 0) {
        section.items.forEach(item => {
          if (item.title) parts.push(item.title);
          if (item.subtitle) parts.push(item.subtitle);
          if (item.description) parts.push(item.description);
        });
      }
    });
  }

  return parts.join(' ').toLowerCase();
}

/**
 * Extract keywords from job description
 * Looks for technical terms, skills, tools, technologies, etc.
 */
function extractKeywords(jobDescription: string): string[] {
  const text = jobDescription.toLowerCase();
  const keywords: Set<string> = new Set();

  // Common technical terms (2+ characters, alphanumeric with common separators)
  const techPattern = /\b[a-z]{2,}(?:\s*[+/.&]?\s*[a-z0-9]{2,})*\b/gi;
  const matches = text.match(techPattern) || [];

  // Filter and clean keywords
  matches.forEach(match => {
    const cleaned = match.trim()
      .replace(/[^\w\s+/.&-]/g, '')
      .toLowerCase();
    
    // Skip common words that aren't keywords
    const commonWords = new Set([
      'the', 'and', 'or', 'but', 'for', 'with', 'from', 'into', 'onto',
      'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were',
      'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'should', 'could', 'may', 'might', 'must',
      'can', 'cannot', 'about', 'above', 'after', 'before', 'during',
      'including', 'through', 'throughout', 'toward', 'towards', 'within',
      'more', 'most', 'some', 'any', 'each', 'every', 'all', 'both',
      'few', 'many', 'several', 'such', 'only', 'own', 'same', 'so',
      'than', 'too', 'very', 'just', 'now', 'then', 'here', 'there',
      'when', 'where', 'why', 'how', 'what', 'which', 'who', 'whom'
    ]);

    if (cleaned.length >= 2 && 
        cleaned.length <= 30 && 
        !commonWords.has(cleaned) &&
        !/^\d+$/.test(cleaned)) {
      keywords.add(cleaned);
    }
  });

  // Also look for capitalized terms (likely proper nouns, technologies)
  const capitalizedMatches = jobDescription.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  capitalizedMatches.forEach(match => {
    const cleaned = match.toLowerCase().trim();
    if (cleaned.length >= 2 && cleaned.length <= 30 && !commonWords.has(cleaned)) {
      keywords.add(cleaned);
    }
  });

  // Look for quoted phrases (often skills or requirements)
  const quotedMatches = jobDescription.match(/"([^"]+)"/g) || [];
  quotedMatches.forEach(match => {
    const phrase = match.replace(/"/g, '').toLowerCase().trim();
    if (phrase.length >= 2 && phrase.length <= 50) {
      // Split phrase into individual words
      phrase.split(/\s+/).forEach(word => {
        const cleaned = word.replace(/[^\w]/g, '').toLowerCase();
        if (cleaned.length >= 2 && !commonWords.has(cleaned)) {
          keywords.add(cleaned);
        }
      });
    }
  });

  // Convert to array and sort by relevance (longer keywords first, then alphabetical)
  return Array.from(keywords)
    .sort((a, b) => {
      // Prioritize longer keywords
      if (b.length !== a.length) return b.length - a.length;
      return a.localeCompare(b);
    })
    .slice(0, 50); // Limit to top 50 keywords
}

/**
 * Check formatting issues in resume
 */
function checkFormatting(resume: ResumeData, resumeText: string): string[] {
  const issues: string[] = [];

  // Check for missing contact info
  if (!resume.personalInfo.email && !resume.personalInfo.phone) {
    issues.push('Missing contact information (email or phone)');
  } else if (!resume.personalInfo.email) {
    issues.push('Missing email address');
  } else if (!resume.personalInfo.phone) {
    issues.push('Missing phone number');
  }

  // Check for missing name
  if (!resume.personalInfo.fullName || resume.personalInfo.fullName.trim().length === 0) {
    issues.push('Missing full name');
  }

  // Check for very short resume (might be incomplete)
  if (resumeText.length < 200) {
    issues.push('Resume is very short (may be incomplete)');
  }

  // Check for excessive special characters (might indicate formatting issues)
  const specialCharCount = (resumeText.match(/[^\w\s]/g) || []).length;
  const specialCharRatio = specialCharCount / Math.max(resumeText.length, 1);
  if (specialCharRatio > 0.3) {
    issues.push('High number of special characters detected (may affect ATS parsing)');
  }

  // Check for missing sections
  const hasExperience = resume.sections.some(s => s.type === 'experience' && s.items.length > 0);
  const hasEducation = resume.sections.some(s => s.type === 'education' && s.items.length > 0);
  const hasSkills = resume.sections.some(s => s.type === 'skills' && s.items.length > 0);

  if (!hasExperience) {
    issues.push('Missing work experience section');
  }
  if (!hasEducation) {
    issues.push('Missing education section');
  }
  if (!hasSkills) {
    issues.push('Missing skills section');
  }

  return issues;
}

/**
 * Main function to scan resume against job description
 */
export function scanResume(resume: ResumeData, jobDescription: string): ATSScanResult {
  if (!jobDescription || jobDescription.trim().length === 0) {
    return {
      score: 0,
      missingKeywords: [],
      formattingIssues: [],
    };
  }

  // Convert resume to text
  const resumeText = resumeToText(resume);

  // Extract keywords from job description
  const jobKeywords = extractKeywords(jobDescription);

  // Find missing keywords
  const missingKeywords: string[] = [];
  jobKeywords.forEach(keyword => {
    // Check if keyword exists in resume (case-insensitive, allows partial matches for compound terms)
    const keywordLower = keyword.toLowerCase();
    const keywordParts = keywordLower.split(/\s+/);
    
    // Try exact match first
    if (!resumeText.includes(keywordLower)) {
      // For multi-word keywords, check if all parts are present (even if not together)
      const allPartsPresent = keywordParts.every(part => 
        resumeText.includes(part) || resumeText.includes(part.replace(/[^\w]/g, ''))
      );
      
      if (!allPartsPresent) {
        missingKeywords.push(keyword);
      }
    }
  });

  // Calculate score based on keyword matches
  // Score = (matched keywords / total keywords) * 80 + formatting score (max 20)
  const matchedKeywords = jobKeywords.length - missingKeywords.length;
  const keywordScore = jobKeywords.length > 0 
    ? (matchedKeywords / jobKeywords.length) * 80 
    : 0;

  // Check formatting
  const formattingIssues = checkFormatting(resume, resumeText);
  const formattingScore = Math.max(0, 20 - (formattingIssues.length * 5)); // Deduct 5 points per issue

  const totalScore = Math.round(keywordScore + formattingScore);

  return {
    score: Math.min(100, Math.max(0, totalScore)),
    missingKeywords: missingKeywords.slice(0, 20), // Limit to top 20 missing keywords
    formattingIssues,
  };
}

