import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase admin client with Service Role Key
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ApiRequest {
  method?: string;
  body?: string | Record<string, unknown>;
}

interface ApiResponse {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    end: () => void;
    json: (data: Record<string, unknown>) => void;
  };
}

/**
 * Scrubs PII (Personally Identifiable Information) from text
 * Replaces email addresses and phone numbers with redaction placeholders
 */
function scrubPII(text: string): string {
  let scrubbed = text;

  // Remove email addresses
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  scrubbed = scrubbed.replace(emailPattern, '[EMAIL_REDACTED]');

  // Remove phone numbers
  const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  scrubbed = scrubbed.replace(phonePattern, '[PHONE_REDACTED]');

  return scrubbed;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the incoming JSON body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { resumeData, jobDescription, userId, type = 'analyze' } = body;

    // Validate required fields
    if (!resumeData) {
      return res.status(400).json({ error: 'Resume data is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Check if Supabase credentials are configured
    if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    // Get user profile to check tier (optional - can be used for rate limiting)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('tier')
      .eq('id', userId)
      .single();

    // Scrub PII from resume data and job description before sending to OpenAI
    const scrubbedResumeData = JSON.parse(JSON.stringify(resumeData));
    if (scrubbedResumeData.personalInfo) {
      if (scrubbedResumeData.personalInfo.email) {
        scrubbedResumeData.personalInfo.email = '[EMAIL_REDACTED]';
      }
      if (scrubbedResumeData.personalInfo.phone) {
        scrubbedResumeData.personalInfo.phone = '[PHONE_REDACTED]';
      }
    }

    const scrubbedJobDescription = jobDescription ? scrubPII(jobDescription) : '';

    // Build the prompt based on type
    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'analyze' && jobDescription) {
      // Resume analysis against job description
      systemPrompt =
        'You are an expert ATS (Applicant Tracking System) optimizer. Analyze the resume JSON against the provided Job Description.';

      userPrompt = `Resume Data (JSON):
${JSON.stringify(scrubbedResumeData, null, 2)}

Job Description:
${scrubbedJobDescription}

Please analyze the resume against the job description and provide:
1. A score from 0-100 indicating how well the resume matches the job description
2. An array of exactly 3 specific, actionable improvements
3. An array of critical missing keywords from the job description that should be added to the resume

Return your response in the following JSON format:
{
  "score": <number 0-100>,
  "feedback": [<string>, <string>, <string>],
  "missingKeywords": [<string>, ...]
}`;
    } else {
      // Default: general resume analysis
      systemPrompt = 'You are an expert resume analyzer. Provide constructive feedback on resume content.';
      userPrompt = `Analyze the following resume data and provide feedback:

${JSON.stringify(scrubbedResumeData, null, 2)}`;
    }

    // Prepare messages array
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      response_format: type === 'analyze' ? { type: 'json_object' } : undefined,
    });

    // Extract the response content
    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      return res.status(500).json({ error: 'No response content received from OpenAI' });
    }

    // Parse and validate the response for analyze type
    if (type === 'analyze') {
      try {
        const analysisResult = JSON.parse(responseContent);

        // Validate the response structure
        if (
          typeof analysisResult.score !== 'number' ||
          !Array.isArray(analysisResult.feedback) ||
          !Array.isArray(analysisResult.missingKeywords)
        ) {
          return res.status(500).json({ error: 'Invalid response format from OpenAI' });
        }

        // Log usage (optional - can be used for analytics)
        if (profile) {
          try {
            await supabaseAdmin.from('ai_usage_logs').insert({
              user_id: userId,
              feature_name: 'resume_analysis',
              created_at: new Date().toISOString(),
            });
          } catch (logError) {
            // Don't fail the request if logging fails
            console.error('Error logging usage:', logError);
          }
        }

        return res.status(200).json(analysisResult);
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        return res.status(500).json({ error: 'Failed to parse response from OpenAI' });
      }
    }

    // For non-analyze types, return raw content
    return res.status(200).json({ content: responseContent });
  } catch (error: unknown) {
    console.error('Error in generateResume API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    return res.status(500).json({
      error: errorMessage,
    });
  }
}

