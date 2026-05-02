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

  // REAL: calls Base44 AI text generation (uses integration credits)
  // Correct SDK method: base44Client.integrations.Core.InvokeLLM()
  const response = await base44Client.integrations.Core.InvokeLLM({
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
    // InvokeLLM returns the text directly as a string
    const text = typeof response === "string" ? response : response.text || response.result || JSON.stringify(response);
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned unexpected format. Try again.");
  }
}

// ─── IMAGE GENERATION ────────────────────────────────────────────────────────
// Note: Image generation is also handled server-side in the Base44 backend
// function (index.ts). This export exists for client-side testing only.

export async function generateImage(quoteText) {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockGenerateImage(quoteText);
  }

  // REAL: calls Base44 image generation (uses integration credits)
  // Correct SDK method: base44Client.integrations.Core.GenerateImage()
  const { url } = await base44Client.integrations.Core.GenerateImage({
    prompt: `A minimalist, elegant background image for this quote: "${quoteText}". 
Abstract, no text, suitable for a quote card.`,
  });

  return url;
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