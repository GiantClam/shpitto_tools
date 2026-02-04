import fetch from 'node-fetch';

export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
}

export interface GoogleSearchParams {
  query: string;
  numResults?: number;
}

export async function googleSearch(params: GoogleSearchParams): Promise<GoogleSearchResult[]> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    throw new Error('GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID must be set in environment');
  }

  const numResults = params.numResults || 10;
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(params.query)}&num=${numResults}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Search API error: ${error}`);
  }

  const data = await response.json();
  
  if (!data.items) {
    return [];
  }

  return data.items.map((item: any) => ({
    title: item.title || '',
    link: item.link || '',
    snippet: item.snippet || ''
  }));
}
