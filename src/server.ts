#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { AIService } from "./ai-service.js";
import { getConfig, SERVER_INFO } from "./config.js";
import type { AskAIRequest } from "./types.js";

async function createServer(): Promise<McpServer> {
  const config = getConfig();
  const aiService = new AIService(config);

  const server = new McpServer({
    name: SERVER_INFO.name,
    version: SERVER_INFO.version,
  });

  server.tool(
    "ask_ai",
    `Call another AI model for help, a fresh perspective, or brainstorming across technical, creative, research, or strategic topics.

When should you call me?
- You're stuck on a problem or need help debugging or researching.
- You seek alternative viewpoints on design, planning, or creative work.
- You want a review or suggestions for improvement (code, writing, strategy, etc.).
- You need new ideas, inspiration, or broader perspectives.

How to use me for the best results:
- Put your focused question in the 'question' field.
- Provide ALL relevant background in the 'context' field at once (code, data, requirements, conversation history, constraints, etc.).

How to phrase your question effectively:
- Prefer open-ended questions that explain the issue you face and the goal you aim to achieve.
- Avoid adding unverified assumptions or early conclusions; they might be wrong and lead both of us astray.

**CRITICAL WARNING:**
The response comes from another AI. It could be inaccurate or misleading.
You MUST verify any information, code, or suggestions provided.
Treat the answer as guidance to be checked, not as fact.`,
    {
      question: z
        .string()
        .describe("The specific question or query to ask the AI model"),
      context: z
        .string()
        .optional()
        .describe(
          "Optional context: background information, code snippets, previous discussion results, conversation history, and any other relevant details"
        ),
    },
    async ({ question, context }) => {
      try {
        const request: AskAIRequest = { question };
        if (context !== undefined) {
          request.context = context;
        }
        const response = await aiService.askAI(request);

        return {
          content: [
            {
              type: "text" as const,
              text: `**AI Response (By ${response.provider}/${response.model}):**\n\n${response.response}`,
            },
          ],
          isError: false,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";

        return {
          content: [
            {
              type: "text" as const,
              text: `**Error**: Failed to get AI response: ${errorMessage}\n\nPlease ask user to configuration and try again.`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}

async function main(): Promise<void> {
  try {
    const server = await createServer();
    const transport = new StdioServerTransport();

    await server.connect(transport);

    console.error("Ask AI MCP Server is running...");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`❌ Failed to start server: ${errorMessage}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
