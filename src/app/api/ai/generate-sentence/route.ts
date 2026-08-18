import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';

interface GenerateSentenceRequest {
  word: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  apiKey?: string;
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Grok Sentence Generation Proxy',
    endpoint: '/api/ai/generate-sentence',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateSentenceRequest = await req.json().catch(() => ({ word: '', level: 'B1' }));
    const { word, level = 'B1' } = body;

    if (!word || !word.trim()) {
      return NextResponse.json(
        { error: 'Target word is required' },
        { status: 400 }
      );
    }

    // 1. Resolve API key: Priority to header/body, fallback to env variable
    const headerKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const activeApiKey = body.apiKey?.trim() || headerKey?.trim() || process.env.GROK_API_KEY?.trim();

    if (!activeApiKey) {
      return NextResponse.json(
        { error: 'No Grok (xAI) API Key provided. Please configure your key in settings.' },
        { status: 401 }
      );
    }

    // 2. Build Grok Prompt
    const systemPrompt = `You are an Oxford 3000 English lexicographer. Provide a contextually accurate example sentence containing the target word suitable for CEFR level ${level}. Return strictly a JSON object with this exact structure:
{
  "sentence": "The English sentence containing ${word}",
  "arabicTranslation": "الترجمة العربية الدقيقة والمشكولة للجملة",
  "targetWord": "${word}",
  "level": "${level}"
}`;

    // 3. Make Server-Side Request to xAI Endpoint
    const xaiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeApiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a CEFR ${level} example sentence for the word "${word}".` },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!xaiResponse.ok) {
      const status = xaiResponse.status;
      const errorText = await xaiResponse.text();
      let parsedError: any = {};
      try {
        parsedError = JSON.parse(errorText);
      } catch {}

      const message = parsedError?.error?.message || errorText || 'Failed to authenticate with xAI';

      if (status === 401) {
        return NextResponse.json(
          { error: 'Invalid Grok API key (401 Unauthorized).' },
          { status: 401 }
        );
      }
      if (status === 429) {
        return NextResponse.json(
          { error: 'xAI Grok rate limit reached (429 Too Many Requests).' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: `xAI API error: ${message}` },
        { status: 500 }
      );
    }

    const data = await xaiResponse.json();
    const rawContent = data.choices?.[0]?.message?.content || '';
    const cleanJson = rawContent.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return NextResponse.json({
      sentence: parsed.sentence || parsed.english || '',
      arabicTranslation: parsed.arabicTranslation || parsed.arabic || '',
      targetWord: word,
      level,
    });
  } catch (error: any) {
    console.error('Grok Route Handler Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error while generating sentence.' },
      { status: 500 }
    );
  }
}
