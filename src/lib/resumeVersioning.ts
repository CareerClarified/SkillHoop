/**
 * Resume Versioning Service
 * Manages resume versions using Supabase
 */

import { supabase } from './supabase';
import { ResumeData } from '../types/resume';

export interface ResumeVersion {
  id: string;
  resumeId: string;
  name: string;
  content: ResumeData;
  createdAt: string;
}

/**
 * Create a new version of a resume
 */
export async function createVersion(
  resumeId: string,
  data: ResumeData,
  name: string
): Promise<string> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create versions');
    }

    // Serialize the resume data to JSON
    const contentJson = JSON.stringify(data);

    // Insert into resume_versions table
    const { data: versionData, error } = await supabase
      .from('resume_versions')
      .insert({
        resume_id: resumeId,
        content: contentJson,
        name: name || `Version ${new Date().toLocaleString()}`,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating version:', error);
      throw error;
    }

    return versionData.id;
  } catch (error) {
    console.error('Error creating version:', error);
    throw error;
  }
}

/**
 * Get all versions for a resume, ordered by newest first
 */
export async function getVersions(resumeId: string): Promise<ResumeVersion[]> {
  try {
    const { data, error } = await supabase
      .from('resume_versions')
      .select('*')
      .eq('resume_id', resumeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting versions:', error);
      throw error;
    }

    // Parse the content JSON and map to ResumeVersion interface
    return (data || []).map((row: any) => {
      let parsedContent: ResumeData;
      try {
        parsedContent = JSON.parse(row.content);
      } catch (e) {
        console.error('Error parsing version content:', e);
        // Return a minimal valid ResumeData if parsing fails
        parsedContent = {
          id: resumeId,
          title: 'Invalid Version',
          personalInfo: { fullName: '', email: '', phone: '', summary: '' },
          sections: [],
          settings: { fontFamily: 'Inter', fontSize: 11, accentColor: '#3B82F6', lineHeight: 1.5, layout: 'classic' },
          atsScore: 0,
          updatedAt: row.created_at,
          isAISidebarOpen: false,
          targetJob: { title: '', description: '', industry: '' },
          focusedSectionId: null,
        };
      }

      return {
        id: row.id,
        resumeId: row.resume_id,
        name: row.name,
        content: parsedContent,
        createdAt: row.created_at,
      };
    });
  } catch (error) {
    console.error('Error getting versions:', error);
    return [];
  }
}

/**
 * Delete a specific version
 */
export async function deleteVersion(versionId: string): Promise<boolean> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to delete versions');
    }

    const { error } = await supabase
      .from('resume_versions')
      .delete()
      .eq('id', versionId);

    if (error) {
      console.error('Error deleting version:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting version:', error);
    return false;
  }
}

/**
 * Restore a version by fetching its content
 */
export async function restoreVersion(versionId: string): Promise<ResumeData | null> {
  try {
    const { data, error } = await supabase
      .from('resume_versions')
      .select('content')
      .eq('id', versionId)
      .single();

    if (error) {
      console.error('Error restoring version:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    // Parse the content JSON
    try {
      const parsedContent: ResumeData = JSON.parse(data.content);
      return parsedContent;
    } catch (e) {
      console.error('Error parsing version content:', e);
      throw new Error('Invalid version data');
    }
  } catch (error) {
    console.error('Error restoring version:', error);
    return null;
  }
}

/**
 * Format date for display (e.g., "Today at 2:30 PM")
 */
export function formatVersionDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Check if it's today
  const isToday = diffDays === 0 && date.getDate() === now.getDate() && 
                  date.getMonth() === now.getMonth() && 
                  date.getFullYear() === now.getFullYear();

  // Check if it's yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() && 
                      date.getMonth() === yesterday.getMonth() && 
                      date.getFullYear() === yesterday.getFullYear();

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (isToday) {
    return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }
  if (isYesterday) {
    return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }
  if (diffDays < 7) {
    return `${date.toLocaleDateString('en-US', { weekday: 'short' })} at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: 'numeric',
    minute: '2-digit'
  });
}

