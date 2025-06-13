import { describe, expect, it } from "vitest";
import type {
  AIProvider,
  AskAIConfig,
  AskAIRequest,
  AskAIResponse,
} from "./types.js";

describe("Types", () => {
  describe("AIProvider", () => {
    it("should accept valid provider types", () => {
      const validProviders: AIProvider[] = [
        "openai",
        "anthropic",
        "google",
        "perplexity",
        "openai-compatible",
      ];

      expect(validProviders).toHaveLength(5);
      expect(validProviders).toContain("openai");
      expect(validProviders).toContain("anthropic");
      expect(validProviders).toContain("google");
      expect(validProviders).toContain("perplexity");
      expect(validProviders).toContain("openai-compatible");
    });
  });

  describe("AskAIConfig", () => {
    it("should create valid config with required fields", () => {
      const config: AskAIConfig = {
        provider: "openai",
        model: "o3-2025-04-16",
      };

      expect(config.provider).toBe("openai");
      expect(config.model).toBe("o3-2025-04-16");
    });

    it("should create valid config with all optional fields", () => {
      const config: AskAIConfig = {
        provider: "anthropic",
        model: "claude-opus-4-20250514",
        apiKey: "test-key",
        temperature: 0.7,
        maxTokens: 10000,
        baseUrl: "https://api.example.com",
        reasoningEffort: "medium",
      };

      expect(config.provider).toBe("anthropic");
      expect(config.model).toBe("claude-opus-4-20250514");
      expect(config.apiKey).toBe("test-key");
      expect(config.temperature).toBe(0.7);
      expect(config.maxTokens).toBe(10000);
      expect(config.baseUrl).toBe("https://api.example.com");
      expect(config.reasoningEffort).toBe("medium");
    });
  });

  describe("AskAIRequest", () => {
    it("should create valid request with question only", () => {
      const request: AskAIRequest = {
        question: "How do I optimize this code?",
      };

      expect(request.question).toBe("How do I optimize this code?");
      expect(request.context).toBeUndefined();
    });

    it("should create valid request with question and context", () => {
      const request: AskAIRequest = {
        question: "How do I optimize this code?",
        context: "I have a React component that renders slowly...",
      };

      expect(request.question).toBe("How do I optimize this code?");
      expect(request.context).toBe(
        "I have a React component that renders slowly..."
      );
    });
  });

  describe("AskAIResponse", () => {
    it("should create valid response", () => {
      const response: AskAIResponse = {
        response: "You can optimize by using React.memo...",
        provider: "openai",
      };

      expect(response.response).toBe("You can optimize by using React.memo...");
      expect(response.provider).toBe("openai");
    });
  });
});
