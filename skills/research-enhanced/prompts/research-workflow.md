# Research Workflow

## Overview

Two-stage research strategy for web research:

1. **Stage 1: DISCOVERY** - Use Google Search to find relevant URLs
2. **Stage 2: EXTRACTION** - Use Jina Reader to extract content from best URLs

## Workflow

### Stage 1: DISCOVERY

Use Google Search to find relevant URLs for the research topic.

**Input**:
- `query`: The search query string
- `numResults`: Number of results to return (default: 10)

**Output**:
- Array of search results with title, link, and snippet

### Stage 2: EXTRACTION

Use Jina Reader to extract full content from URLs.

**Input**:
- `url`: The URL to extract content from
- `readerModel`: Optional reader model (default: "reader")

**Output**:
- Full content in markdown format

## Best Practices

1. Start with broad search queries
2. Review snippets to identify most relevant URLs
3. Extract content from top 3-5 most relevant URLs
4. Synthesize findings from extracted content

## Example Usage

```typescript
// Stage 1: Search
const results = await googleSearch({
  query: "best practices for React component design 2024",
  numResults: 10
});

// Stage 2: Extract from best URLs
for (const result of results.slice(0, 3)) {
  const content = await jinaReader({ url: result.link });
  console.log(content.markdown);
}
```
