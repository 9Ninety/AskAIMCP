import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIService } from "./ai-service.js";
import type { AskAIConfig } from "./types.js";

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn(() => vi.fn(() => "mocked-openai-model")),
}));

vi.mock("@ai-sdk/anthropic", () => ({
  createAnthropic: vi.fn(() => vi.fn(() => "mocked-anthropic-model")),
}));

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: vi.fn(() => vi.fn(() => "mocked-google-model")),
}));

describe("AIService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create AIService with valid config", () => {
      const config: AskAIConfig = {
        provider: "openai",
        model: "o3-2025-04-16",
      };

      expect(() => new AIService(config)).not.toThrow();
    });

    it("should throw error for invalid config - missing model", () => {
      const config: AskAIConfig = {
        provider: "openai",
        model: "",
      };

      expect(() => new AIService(config)).toThrow("Model is required");
    });

    it("should throw error for invalid maxTokens", () => {
      const config: AskAIConfig = {
        provider: "openai",
        model: "o3-2025-04-16",
        maxTokens: -1,
      };

      expect(() => new AIService(config)).toThrow(
        "Max tokens must be greater than 0"
      );
    });
  });

  describe("provider support", () => {
    it("should support OpenAI provider", () => {
      const config: AskAIConfig = {
        provider: "openai",
        model: "o3-2025-04-16",
        apiKey: "test-key",
      };

      expect(() => new AIService(config)).not.toThrow();
    });

    it("should support Anthropic provider", () => {
      const config: AskAIConfig = {
        provider: "anthropic",
        model: "claude-opus-4-20250514",
        apiKey: "test-key",
      };

      expect(() => new AIService(config)).not.toThrow();
    });

    it("should support Google provider", () => {
      const config: AskAIConfig = {
        provider: "google",
        model: "gemini-2.5-pro-preview-06-05",
        apiKey: "test-key",
      };

      expect(() => new AIService(config)).not.toThrow();
    });

    it("should support Perplexity provider", () => {
      const config: AskAIConfig = {
        provider: "perplexity",
        model: "sonar-pro",
        apiKey: "test-key",
      };

      expect(() => new AIService(config)).not.toThrow();
    });

    it("should support OpenAI-compatible provider", () => {
      const config: AskAIConfig = {
        provider: "openai-compatible",
        model: "custom-model",
        apiKey: "test-key",
        baseUrl: "https://api.example.com/v1",
      };

      expect(() => new AIService(config)).not.toThrow();
    });

    it("should throw error for OpenAI-compatible without baseUrl", () => {
      const config: AskAIConfig = {
        provider: "openai-compatible",
        model: "custom-model",
        apiKey: "test-key",
      };

      const service = new AIService(config);

      // This will throw when trying to get the model
      expect(() => service["getModel"]()).toThrow(
        "Base URL is required for OpenAI-compatible providers"
      );
    });
  });

  describe("configuration validation", () => {
    it("should accept valid temperature", () => {
      const config: AskAIConfig = {
        provider: "openai",
        model: "o3-2025-04-16",
        temperature: 0.7,
      };

      expect(() => new AIService(config)).not.toThrow();
    });

    it("should accept valid maxTokens", () => {
      const config: AskAIConfig = {
        provider: "openai",
        model: "o3-2025-04-16",
        maxTokens: 10000,
      };

      expect(() => new AIService(config)).not.toThrow();
    });

    it("should accept reasoning effort", () => {
      const config: AskAIConfig = {
        provider: "openai",
        model: "o3-2025-04-16",
        reasoningEffort: "medium",
      };

      expect(() => new AIService(config)).not.toThrow();
    });
  });
});
