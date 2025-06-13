import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { AskAIConfig, AskAIRequest, AskAIResponse } from "./types.js";

export class AIService {
  private config: AskAIConfig;

  constructor(config: AskAIConfig) {
    this.config = config;
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.model) {
      throw new Error("Model is required");
    }

    if (this.config.maxTokens !== undefined && this.config.maxTokens <= 0) {
      throw new Error("Max tokens must be greater than 0");
    }
  }

  private getModel() {
    switch (this.config.provider) {
      case "openai": {
        const settings: any = {};
        if (this.config.apiKey) settings.apiKey = this.config.apiKey;
        if (this.config.baseUrl) settings.baseURL = this.config.baseUrl;

        const openai = createOpenAI(settings);
        return openai(this.config.model);
      }
      case "anthropic": {
        const settings: any = {};
        if (this.config.apiKey) settings.apiKey = this.config.apiKey;
        if (this.config.baseUrl) settings.baseURL = this.config.baseUrl;

        const anthropic = createAnthropic(settings);
        return anthropic(this.config.model);
      }
      case "google": {
        const settings: any = {};
        if (this.config.apiKey) settings.apiKey = this.config.apiKey;
        if (this.config.baseUrl) settings.baseURL = this.config.baseUrl;

        const google = createGoogleGenerativeAI(settings);
        return google(this.config.model);
      }
      case "perplexity": {
        // Perplexity uses OpenAI-compatible API
        const settings: any = {
          baseURL: this.config.baseUrl || "https://api.perplexity.ai",
        };
        if (this.config.apiKey) settings.apiKey = this.config.apiKey;

        const perplexity = createOpenAI(settings);
        return perplexity(this.config.model);
      }
      case "openai-compatible": {
        if (!this.config.baseUrl) {
          throw new Error(
            "Base URL is required for OpenAI-compatible providers"
          );
        }

        const settings: any = {
          baseURL: this.config.baseUrl,
        };
        if (this.config.apiKey) settings.apiKey = this.config.apiKey;

        const compatible = createOpenAI(settings);
        return compatible(this.config.model);
      }
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  async askAI(request: AskAIRequest): Promise<AskAIResponse> {
    try {
      const model = this.getModel();

      // Construct the prompt with context if provided
      let prompt = `<question>\n${request.question}\n</question>`;

      if (request.context && request.context.trim()) {
        prompt = `<context>
${request.context}
</context>

${prompt}`;
      }

      const generateOptions: Parameters<typeof generateText>[0] = {
        model,
        prompt,
        system: `You are a large language model acting as a collaborative assistant. You are being queried by another AI model that is using a tool to ask for your help.

Your role is to provide a helpful, peer-level response to assist the calling AI. It may be seeking a second opinion, a different perspective, or help with a problem it cannot solve on its own.

Please consider the following:
- The request is from another AI. Your response will be programmatically processed and used to help it complete its task.
- Frame your response as a suggestion or an alternative viewpoint, not as a definitive command or factual statement.
- The calling AI has provided the context it has available. If the context seems insufficient, you can note what additional information would be helpful, but understand that the calling AI may not be able to provide it.
- Be aware of your own limitations and knowledge cutoff. If you are uncertain or a request is beyond your capabilities, it is better to state that clearly than to provide a misleading, ambiguous, or evasive response.
- Your goal is to help your fellow AI overcome its challenge. Provide clear, structured, and actionable information.`,
      };

      // Add optional parameters only if configured
      if (this.config.temperature !== undefined) {
        generateOptions.temperature = this.config.temperature;
      }

      if (this.config.maxTokens !== undefined) {
        generateOptions.maxTokens = this.config.maxTokens;
      }

      // Add reasoning effort for reasoning models
      if (this.config.reasoningEffort !== undefined) {
        (generateOptions as any).reasoningEffort = this.config.reasoningEffort;
      }

      const result = await generateText(generateOptions);

      return {
        response: result.text,
        provider: this.config.provider,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`AI service error: ${errorMessage}`);
    }
  }
}
