export type AIProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "perplexity"
  | "openai-compatible";

export interface AskAIConfig {
  /** The AI provider to use */
  provider: AIProvider;
  /** The model to use for AI queries */
  model: string;
  /** API key for the AI provider*/
  apiKey?: string;
  temperature?: number;
  /** Maximum tokens for AI responses (could causes empty or truncated responses) */
  maxTokens?: number;
  /** Base URL for AI providers */
  baseUrl?: string;
  /** Reasoning effort for reasoning models ('low', 'medium', 'high', 'max', or budget string, e.g. 10000) */
  reasoningEffort?: "low" | "medium" | "high" | string;
}

export interface AskAIRequest {
  /** The specific question or query to ask the AI */
  question: string;
  /** Optional context including background information, code snippets, etc. */
  context?: string;
}

export interface AskAIResponse {
  response: string;
  provider: AIProvider;
  /** Actual model ID from response */
  model?: string;
}

export interface ServerInfo {
  name: string;
  version: string;
}
