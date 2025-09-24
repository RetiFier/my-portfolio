// AI-powered content enhancement utility
export const generateEnhancedDescription = async (
  originalDescription: string,
  context: {
    type: 'job' | 'project';
    title: string;
    company?: string;
    technologies?: string[];
  }
): Promise<string> => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GATSBY_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Portfolio Content Enhancement'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          {
            role: 'system',
            content: `You are a professional content writer specializing in portfolio descriptions. Enhance the given description to be more impressive and professional while keeping it truthful. Focus on impact, achievements, and technical excellence. Keep it concise (2-3 sentences max).`
          },
          {
            role: 'user',
            content: `Enhance this ${context.type} description:
            
Title: ${context.title}
${context.company ? `Company: ${context.company}` : ''}
${context.technologies ? `Technologies: ${context.technologies.join(', ')}` : ''}

Original: ${originalDescription}

Make it more professional and impactful while staying truthful.`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0]?.message?.content || originalDescription;
    }
  } catch (error) {
    console.log('AI enhancement not available, using original description');
  }

  return originalDescription;
};

// Cache enhanced descriptions to avoid repeated API calls
const enhancementCache = new Map<string, string>();

export const getCachedEnhancedDescription = async (
  originalDescription: string,
  context: {
    type: 'job' | 'project';
    title: string;
    company?: string;
    technologies?: string[];
  }
): Promise<string> => {
  const cacheKey = `${context.type}-${context.title}-${originalDescription}`;
  
  if (enhancementCache.has(cacheKey)) {
    return enhancementCache.get(cacheKey)!;
  }

  const enhanced = await generateEnhancedDescription(originalDescription, context);
  enhancementCache.set(cacheKey, enhanced);
  return enhanced;
};
