import { googleSearch } from '../skills/research-enhanced/tools/google_search.js';

async function test() {
  try {
    console.log('Testing Google Search...');
    const results = await googleSearch({
      query: 'TypeScript best practices 2025',
      numResults: 5
    });
    
    console.log('Results:', JSON.stringify(results, null, 2));
    console.log('Test passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

test();
