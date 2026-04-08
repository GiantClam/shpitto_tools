/**
 * LLM Executor - Simple LLM execution tool
 * 
 * This is a LOADER/EXECUTOR only - workflow logic is in SKILL.md
 */

import { llm } from './graph';

export interface LLMResponse {
  content: string;
  raw: any;
}

export interface ExecuteLLMOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Execute an LLM call with the given prompt and system context
 * 
 * @param prompt - The user prompt
 * @param systemContext - System context/instructions
 * @param options - LLM options
 * @returns LLM response content
 */
export async function executeLLM(
  prompt: string,
  systemContext: string = '',
  options: ExecuteLLMOptions = {}
): Promise<LLMResponse> {
  const { model = 'claude-sonnet-4-20250514', maxTokens = 4096, temperature = 0.7 } = options;

  if (!llm) {
    throw new Error('LLM client not initialized. Set LLM_PROVIDER and LLM_MODEL env vars.');
  }

  const messages: any[] = [];
  
  if (systemContext) {
    messages.push({ role: 'system', content: systemContext });
  }
  
  messages.push({ role: 'user', content: prompt });

  const response = await llm.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    messages,
  });

  const textContent = response.content.find(c => c.type === 'text');
  
  return {
    content: textContent?.type === 'text' ? textContent.text : '',
    raw: response,
  };
}

/**
 * Execute LLM with JSON output expectation
 */
export async function executeLLMJSON<T = any>(
  prompt: string,
  systemContext: string = '',
  options: ExecuteLLMOptions = {}
): Promise<T> {
  const enhancedSystemContext = `${systemContext}\n\nIMPORTANT: Respond with valid JSON only. No markdown, no explanation.`;
  
  const response = await executeLLM(prompt, enhancedSystemContext, {
    ...options,
    maxTokens: options.maxTokens || 2048,
  });

  try {
    // Try to extract JSON from response
    const jsonMatch = response.content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(response.content);
  } catch (e) {
    throw new Error(`Failed to parse JSON response: ${response.content}`);
  }
}
