/**
 * Resume Parser Utility
 * Extracts structured data from resume files using OpenAI
 */

import { supabase } from './supabase';
import type { ResumeData, ResumeSection, Project, Certification, Language } from '../types/resume';


export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedIn: string;
    portfolio: string;
  };
  summary: string;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
}

/**
 * Extract text from a file
 */
export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          // For PDF, we need to extract text from the binary data
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            reject(new Error('Failed to read PDF file'));
            return;
          }
          
          // Try to extract text from PDF (basic approach)
          // Note: For production, use pdf.js or a server-side PDF parser
          const uint8Array = new Uint8Array(arrayBuffer);
          const textDecoder = new TextDecoder('utf-8', { fatal: false });
          let text = textDecoder.decode(uint8Array);
          
          // Remove binary data and extract readable text
          text = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');
          
          // Extract text between common PDF text markers
          const textMatches = text.match(/\((.*?)\)/g) || [];
          const extractedText = textMatches
            .map(match => match.slice(1, -1))
            .filter(t => t.length > 2 && !t.match(/^[0-9\s]+$/))
            .join(' ');
          
          if (extractedText.length > 100) {
            resolve(extractedText);
          } else {
            // Fallback: try to find readable text patterns
            const readableText = text.match(/[A-Za-z]{3,}/g)?.join(' ') || '';
            if (readableText.length > 100) {
              resolve(readableText);
            } else {
              reject(new Error('Could not extract sufficient text from PDF. Please try converting to DOCX or TXT format.'));
            }
          }
        } else {
          // For text-based files
          const text = e.target?.result as string;
          if (text) {
            resolve(text);
          } else {
            reject(new Error('Failed to read file'));
          }
        }
      } catch (error: any) {
        reject(new Error(`Error extracting text: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file'));
    
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      // For PDF, read as array buffer
      reader.readAsArrayBuffer(file);
    } else {
      // For text-based files
      reader.readAsText(file);
    }
  });
}

/**
 * Parse resume using OpenAI
 */
export async function parseResumeWithAI(resumeText: string): Promise<ResumeData> {
  const prompt = `Extract structured data from this resume text and return valid JSON only. The JSON should include:
{
  "personalInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "location": "City, State",
    "linkedIn": "linkedin.com/in/username",
    "portfolio": "website.com"
  },
  "summary": "Professional summary",
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["communication", "leadership"],
    "languages": ["English", "Spanish"]
  },
  "experience": [{
    "company": "Company Name",
    "position": "Job Title",
    "startDate": "YYYY-MM",
    "endDate": "YYYY-MM or Present",
    "description": "Job description",
    "achievements": ["achievement1", "achievement2"]
  }],
  "education": [{
    "institution": "University Name",
    "degree": "Degree Type",
    "field": "Field of Study",
    "graduationDate": "YYYY-MM"
  }],
  "certifications": [{
    "name": "Certification Name",
    "issuer": "Issuing Organization",
    "date": "YYYY-MM",
    "expiryDate": "YYYY-MM or null"
  }],
  "projects": [{
    "name": "Project Name",
    "description": "Project description",
    "technologies": ["tech1", "tech2"],
    "link": "project-url.com"
  }]
}

Resume text:
${resumeText}

Return only valid JSON, no additional text:`;

  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        systemMessage: 'You are an expert resume parser. Extract structured data from resume text and return only valid JSON.',
        prompt: prompt,
        userId: userId,
        feature_name: 'resume_parser',
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to parse resume');
    }

    const data = await response.json();
    const content = data.content;
    
    if (!content) {
      throw new Error('No response from AI');
    }

    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // If no JSON found, try parsing the whole content
    return JSON.parse(content);
  } catch (error) {
    console.error('Error parsing resume with AI:', error);
    throw error;
  }
}

/**
 * Parse resume from uploaded file
 */
export async function parseResume(file: File): Promise<ResumeData> {
  try {
    // Extract text from file
    const resumeText = await extractTextFromFile(file);
    
    // Parse with AI
    const parsedData = await parseResumeWithAI(resumeText);
    
    // Save to localStorage
    const savedResumes = getSavedResumes();
    savedResumes[file.name] = parsedData;
    localStorage.setItem('parsed_resumes', JSON.stringify(savedResumes));
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}

/**
 * Get saved resumes from localStorage
 */
export function getSavedResumes(): Record<string, ResumeData> {
  const saved = localStorage.getItem('parsed_resumes');
  return saved ? JSON.parse(saved) : {};
}

/**
 * Save resume data to localStorage
 */
export function saveResume(resumeName: string, data: ResumeData): void {
  const savedResumes = getSavedResumes();
  savedResumes[resumeName] = data;
  localStorage.setItem('parsed_resumes', JSON.stringify(savedResumes));
}

/**
 * Get a specific resume by name
 */
export function getResume(resumeName: string): ResumeData | null {
  const savedResumes = getSavedResumes();
  return savedResumes[resumeName] || null;
}

/**
 * Get the most recent resume
 */
export function getLatestResume(): ResumeData | null {
  const savedResumes = getSavedResumes();
  const resumeNames = Object.keys(savedResumes);
  
  if (resumeNames.length === 0) {
    return null;
  }
  
  // Return the most recently added resume
  return savedResumes[resumeNames[resumeNames.length - 1]];
}

/**
 * Clear all saved resumes
 */
export function clearAllResumes(): void {
  localStorage.removeItem('parsed_resumes');
}

/**
 * Parse resume from text and convert to ResumeData format for the editor
 * This function takes raw resume text and returns data in the format expected by ResumeContext
 */
export async function parseResumeFromText(text: string): Promise<Partial<ResumeData>> {
  // Parse the resume text using AI
  const parsedData = await parseResumeWithAI(text);
  
  // Convert to ResumeData format used in the context
  const resumeData: Partial<ResumeData> = {
    personalInfo: {
      fullName: parsedData.personalInfo.name || '',
      email: parsedData.personalInfo.email || '',
      phone: parsedData.personalInfo.phone || '',
      location: parsedData.personalInfo.location || '',
      linkedin: parsedData.personalInfo.linkedIn || '',
      website: parsedData.personalInfo.portfolio || '',
      summary: parsedData.summary || '',
    },
    sections: [],
  };

  // Convert experience
  if (parsedData.experience && parsedData.experience.length > 0) {
    const experienceSection: ResumeSection = {
      id: 'experience',
      type: 'experience',
      title: 'Experience',
      isVisible: true,
      items: parsedData.experience.map((exp, idx) => ({
        id: `exp_${Date.now()}_${idx}`,
        title: exp.position || '',
        subtitle: exp.company || '',
        date: `${exp.startDate || ''} - ${exp.endDate || 'Present'}`,
        description: [
          exp.description || '',
          ...(exp.achievements || []).map(ach => `• ${ach}`),
        ].filter(Boolean).join('\n'),
      })),
    };
    resumeData.sections!.push(experienceSection);
  }

  // Convert education
  if (parsedData.education && parsedData.education.length > 0) {
    const educationSection: ResumeSection = {
      id: 'education',
      type: 'education',
      title: 'Education',
      isVisible: true,
      items: parsedData.education.map((edu, idx) => ({
        id: `edu_${Date.now()}_${idx}`,
        title: `${edu.degree || ''}${edu.field ? ` in ${edu.field}` : ''}`,
        subtitle: edu.institution || '',
        date: edu.graduationDate || '',
        description: '',
      })),
    };
    resumeData.sections!.push(educationSection);
  }

  // Convert skills
  const allSkills = [
    ...(parsedData.skills?.technical || []),
    ...(parsedData.skills?.soft || []),
  ];
  if (allSkills.length > 0) {
    const skillsSection: ResumeSection = {
      id: 'skills',
      type: 'skills',
      title: 'Skills',
      isVisible: true,
      items: allSkills.map((skill, idx) => ({
        id: `skill_${Date.now()}_${idx}`,
        title: skill,
        subtitle: '',
        date: '',
        description: '',
      })),
    };
    resumeData.sections!.push(skillsSection);
  }

  // Convert certifications
  if (parsedData.certifications && parsedData.certifications.length > 0) {
    resumeData.certifications = parsedData.certifications.map((cert, idx) => ({
      id: `cert_${Date.now()}_${idx}`,
      name: cert.name || '',
      issuer: cert.issuer || '',
      date: cert.date || '',
      url: undefined,
    }));
  }

  // Convert projects
  if (parsedData.projects && parsedData.projects.length > 0) {
    resumeData.projects = parsedData.projects.map((proj, idx) => ({
      id: `proj_${Date.now()}_${idx}`,
      title: proj.name || '',
      description: proj.description || '',
      startDate: '',
      endDate: '',
      url: proj.link,
      technologies: proj.technologies || [],
    }));
  }

  // Convert languages
  if (parsedData.skills?.languages && parsedData.skills.languages.length > 0) {
    resumeData.languages = parsedData.skills.languages.map((lang, idx) => ({
      id: `lang_${Date.now()}_${idx}`,
      language: lang,
      proficiency: 'Fluent' as const,
    }));
  }

  return resumeData;
}

