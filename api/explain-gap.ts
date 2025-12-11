import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Parse the incoming JSON body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { gapStartDate, gapEndDate, previousJobTitle, nextJobTitle } = body;

    // Validate required fields
    if (!gapStartDate || typeof gapStartDate !== 'string') {
      return res.status(400).json({ error: 'gapStartDate is required and must be a string' });
    }

    if (!gapEndDate || typeof gapEndDate !== 'string') {
      return res.status(400).json({ error: 'gapEndDate is required and must be a string' });
    }

    if (!previousJobTitle || typeof previousJobTitle !== 'string') {
      return res.status(400).json({ error: 'previousJobTitle is required and must be a string' });
    }

    if (!nextJobTitle || typeof nextJobTitle !== 'string') {
      return res.status(400).json({ error: 'nextJobTitle is required and must be a string' });
    }

    // Create the prompt for OpenAI
    const prompt = `Generate a professional, positive explanation for a resume career gap between ${gapStartDate} and ${gapEndDate}. 

Context: Moving from ${previousJobTitle} to ${nextJobTitle}.

Requirements:
- Keep it brief (1-2 sentences)
- Be professional and positive
- Avoid being overly specific about personal reasons
- Focus on growth, learning, or professional development when possible
- Make it suitable for including in a resume or discussing in an interview

Generate the explanation:`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional career coach and resume writer. You help job seekers explain career gaps in a positive, professional manner that highlights growth and development rather than focusing on negative aspects. Your explanations are brief, honest, and suitable for resumes and interviews.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    // Extract the response content
    const explanation = completion.choices[0]?.message?.content;

    if (!explanation) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    // Return the explanation
    return res.status(200).json({ explanation: explanation.trim() });
  } catch (error: unknown) {
    console.error('OpenAI API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate gap explanation';
    return res.status(500).json({
      error: errorMessage,
    });
  }
}

