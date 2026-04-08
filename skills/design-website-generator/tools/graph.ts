/**
 * LLM Graph - Client initialization
 * 
 * This module provides the LLM client for the skill tools.
 * It should point to the actual LLM client in the builder.
 */

// Re-export from builder's graph if available, otherwise provide a stub
let llm: any = null;

try {
  // Try to import from builder's graph
  const builderGraph = require('../../../builder/src/lib/agent/graph');
  llm = builderGraph.llm;
} catch {
  // Provide a stub for standalone usage
  llm = null;
}

export { llm };
