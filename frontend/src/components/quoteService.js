// quoteService.js
// All AI generation and publish logic lives here.
// USE_MOCK = true prevents spending Base44 integration credits during development.
// Switch USE_MOCK to false only when doing the final real demo.

import { USE_MOCK, mockGenerateQuotes, mockGenerateImage } from "../mockData";
import base44Client from "../base44";

// ─── QUOTE GENERATION ────────────────────────────────────────────────────────

export async function generateQuotes(topic) {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockGenerateQuotes(topic);
  }

  // REAL: calls Base44 AI integration (uses integration credits)
  const response = await base44Client.integrations.ai.generateText({
    prompt: `Generate 4 fictional quotes about the topic: "${topic}".
    Each quote should sound profound and be attributed to a fictional person.
    Return ONLY a JSON array with this exact structure, no other text:
    [
      {"id": "1", "quoteText": "quote here", "author": "Fictional Name"},
      {"id": "2", "quoteText": "quote here", "author": "Fictional Name"},
      {"id": "3", "quoteText": "quote here", "author": "Fictional Name"},
      {"id": "4", "quoteText": "quote here", "author": "Fictional Name"}
    ]`,
  });

  try {
    return JSON.parse(response.text);
  } catch {
    throw new Error("AI returned unexpected format. Try again.");
  }
}

// ─── IMAGE GENERATION ────────────────────────────────────────────────────────
// Called by the Base44 backend function (entry.ts) server-side.
// This export is kept here for architectural completeness and testing.

export async function generateImage(quoteText) {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockGenerateImage(quoteText);
  }

  // REAL: calls Base44 image generation (uses integration credits)
  const response = await base44Client.integrations.ai.generateImage({
    prompt: `A minimalist, elegant background image for this quote: "${quoteText}". 
    Abstract, no text, suitable for a quote card.`,
  });

  return response.url;
}

// ─── PUBLISH VIA BASE44 BACKEND FUNCTION ─────────────────────────────────────
// React calls Base44's backend function which holds all secrets.
// React never sees the Wix endpoint URL or the shared secret.
// Image generation happens server-side inside the Base44 backend function.

export async function publishToWix(quote) {
  const result = await base44Client.functions.invoke("publishQuote", {
    quoteText: quote.quoteText,
    topic: quote.topic,
    author: quote.author,
  });

  if (result.error) {
    throw new Error(result.error);
  }

  return result;
}