import fs from "node:fs";
import type { AIProvider, AskAIConfig, ServerInfo } from "./types.js";

let VERSION = "unknown";
try {
  const packageJson = JSON.parse(
    fs.readFileSync(new URL("../package.json", import.meta.url), "utf-8")
  );
  VERSION = packageJson.version;
} catch (error) {
  console.error("Failed to obtain version:", error);
}

export const SERVER_INFO: ServerInfo = {
  name: "ask-ai",
  version: VERSION,
};

export function getConfig(): AskAIConfig {
  const provider = process.env["PROVIDER"] as AIProvider;
  const model = process.env["MODEL"];

  if (!provider) {
    throw new Error("PROVIDER environment variable is required");
  }

  if (!model) {
    throw new Error("MODEL environment variable is required");
  }

  const config: AskAIConfig = {
    provider,
    model,
  };

  const apiKey = process.env["API_KEY"];
  if (apiKey) {
    config.apiKey = apiKey;
  }

  const temperature = process.env["TEMPERATURE"];
  if (temperature) {
    config.temperature = parseFloat(temperature);
  }

  const maxTokens = process.env["MAX_TOKENS"];
  if (maxTokens) {
    config.maxTokens = parseInt(maxTokens, 10);
  }

  const baseUrl = process.env["BASE_URL"];
  if (baseUrl) {
    config.baseUrl = baseUrl;
  }

  const reasoningEffort = process.env["REASONING_EFFORT"];
  if (reasoningEffort) {
    config.reasoningEffort = reasoningEffort;
  }

  return config;
}
