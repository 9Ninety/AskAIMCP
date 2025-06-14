import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getConfig } from "./config.js";

describe("Config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getConfig", () => {
    it("should throw error when PROVIDER is missing", () => {
      delete process.env.PROVIDER;
      delete process.env.MODEL;

      expect(() => getConfig()).toThrow(
        "PROVIDER environment variable is required"
      );
    });

    it("should throw error when MODEL is missing", () => {
      process.env.PROVIDER = "openai";
      delete process.env.MODEL;

      expect(() => getConfig()).toThrow(
        "MODEL environment variable is required"
      );
    });

    it("should return basic config with required fields", () => {
      process.env.PROVIDER = "openai";
      process.env.MODEL = "o3-2025-04-16";

      const config = getConfig();

      expect(config.provider).toBe("openai");
      expect(config.model).toBe("o3-2025-04-16");
    });

    it("should include optional fields when provided", () => {
      process.env.PROVIDER = "openai";
      process.env.MODEL = "o3-2025-04-16";
      process.env.API_KEY = "test-key";
      process.env.TEMPERATURE = "0.7";
      process.env.MAX_TOKENS = "10000";
      process.env.BASE_URL = "https://api.example.com/v1";
      process.env.REASONING_EFFORT = "medium";

      const config = getConfig();

      expect(config.apiKey).toBe("test-key");
      expect(config.temperature).toBe(0.7);
      expect(config.maxTokens).toBe(10000);
      expect(config.baseUrl).toBe("https://api.example.com/v1");
      expect(config.reasoningEffort).toBe("medium");
    });

    it("should handle different providers", () => {
      const providers = [
        "openai",
        "anthropic",
        "google",
        "perplexity",
        "openai-compatible",
      ];

      providers.forEach((provider) => {
        process.env.PROVIDER = provider;
        switch (provider) {
          case "openai":
            process.env.MODEL = "o3-2025-04-16";
            break;
          case "anthropic":
            process.env.MODEL = "claude-opus-4-20250514";
            break;
          case "google":
            process.env.MODEL = "gemini-2.5-pro-preview-06-05";
            break;
          case "perplexity":
            process.env.MODEL = "sonar-pro";
            break;
          default:
            process.env.MODEL = "custom-model";
        }

        const config = getConfig();
        expect(config.provider).toBe(provider);
      });
    });
  });
});
