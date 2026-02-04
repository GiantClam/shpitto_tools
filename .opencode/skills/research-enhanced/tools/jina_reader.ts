import fetch from 'node-fetch';

export interface JinaReaderParams {
  url: string;
  readerModel?: string;
}

export interface JinaReaderResult {
  content: string;
  markdown: string;
  title: string;
}

export async function jinaReader(params: JinaReaderParams): Promise<JinaReaderResult> {
  const apiKey = process.env.JINA_API_KEY;
  
  if (!apiKey) {
    throw new Error('JINA_API_KEY must be set in environment');
  }

  const readerModel = params.readerModel || 'reader';
  const url = `https://r.jina.ai/${readerModel}/${encodeURIComponent(params.url)}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Jina Reader API error: ${error}`);
  }

  const content = await response.text();
  
  return {
    content,
    markdown: content,
    title: ''
  };
}
