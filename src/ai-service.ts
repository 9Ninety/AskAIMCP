import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createPerplexity } from "@ai-sdk/perplexity";
import { generateText } from "ai";
import type { AskAIConfig, AskAIRequest, AskAIResponse } from "./types.js";

import type { AnthropicProviderSettings } from "@ai-sdk/anthropic";
import type { GoogleGenerativeAIProviderSettings } from "@ai-sdk/google";
import type { OpenAIProviderSettings } from "@ai-sdk/openai";
import type { PerplexityProviderSettings } from "@ai-sdk/perplexity";

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
      case "openai":
      case "openai-compatible": {
        const settings: OpenAIProviderSettings = {};

        if (this.config.baseUrl) {
          settings.baseURL = this.config.baseUrl;
        } else if (this.config.provider === "openai-compatible") {
          throw new Error(
            "Base URL is required for OpenAI-compatible providers"
          );
        }

        if (this.config.apiKey) settings.apiKey = this.config.apiKey;

        const openai = createOpenAI(settings);
        return openai(this.config.model);
      }
      case "anthropic": {
        const settings: AnthropicProviderSettings = {};
        if (this.config.apiKey) settings.apiKey = this.config.apiKey;
        if (this.config.baseUrl) settings.baseURL = this.config.baseUrl;

        const anthropic = createAnthropic(settings);
        return anthropic(this.config.model);
      }
      case "google": {
        const settings: GoogleGenerativeAIProviderSettings = {};
        if (this.config.apiKey) settings.apiKey = this.config.apiKey;
        if (this.config.baseUrl) settings.baseURL = this.config.baseUrl;

        const google = createGoogleGenerativeAI(settings);
        return google(this.config.model);
      }
      case "perplexity": {
        const settings: PerplexityProviderSettings = {};
        if (this.config.apiKey) settings.apiKey = this.config.apiKey;
        if (this.config.baseUrl) settings.baseURL = this.config.baseUrl;

        const perplexity = createPerplexity(settings);
        return perplexity(this.config.model);
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
        system: `You are a large language model acting as a collaborative assistant.

You are being queried by another AI model that is using a tool to ask for your help.

Your role is to provide a helpful, peer-level response to assist the calling AI. It may be seeking a second opinion, a different perspective, or help with a problem it cannot solve on its own.

Key considerations:
- The request is from another AI. Your response will be programmatically processed and used to help it complete its task.
- Frame your response as a suggestion or an alternative viewpoint, not as a definitive command or factual statement.
- The calling AI might omit critical background, context, or prior conversation history, assuming you have this information. You do not. At the slightest indication that the provided information is incomplete or lacks detail, you MUST immediately halt your response. Do not proceed with an answer. Instead, you must explicitly state that the context is incomplete and that you have no memory of past interactions. Demand that the calling AI provide the absolute full and complete context, including all relevant history, before you can provide any assistance.

- The questioner's assumptions, viewpoint, or chosen direction might be incorrect. Step back, adopt a broader perspective, and think carefully before answering.
- Be aware of your own limitations and knowledge cutoff. If you are uncertain or a request is beyond your capabilities, state that clearly rather than give a misleading or evasive reply.

Your goal is to help your fellow AI overcome its challenge. Provide clear, structured, and actionable information.`,
        maxRetries: 0
      };

      // Add optional parameters only if configured
      if (this.config.temperature !== undefined) {
        generateOptions.temperature = this.config.temperature;
      }

      if (this.config.maxTokens !== undefined) {
        generateOptions.maxTokens = this.config.maxTokens;
      }

      if (this.config.reasoningEffort !== undefined) {
        generateOptions.providerOptions = {
          openai: { reasoningEffort: this.config.reasoningEffort },
        };
      }

      const result = await generateText(generateOptions);

      return {
        response: result.text,
        provider: this.config.provider,
        model: result.response.modelId,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`AI service error: ${errorMessage}`);
    }
  }
}
