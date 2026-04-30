// quoteService.js
// All AI generation and publish logic lives here.
// Switch USE_MOCK to false only when doing the final real demo.

import { USE_MOCK, mockGenerateQuotes, mockGenerateImage } from "../mockData";
import base44Client from "../base44";

// ─── QUOTE GENERATION ───────────────────────────────────────────────────────

export async function generateQuotes(topic) {
  if (USE_MOCK) {
    // Simulate a short delay so it feels like an API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockGenerateQuotes(topic);
  }

  // REAL: calls Base44 AI integration (uses integration credits)
  const response = await base44Client.integrations.ai.generateText({
    prompt: `Generate 4 fictional quotes about the topic: "${topic}".
    Each quote should sound profound and be attributed to a fictional person.
    Return ONLY a JSON array with this exact structure, no other text:
    [
      {"id": "1", "text": "quote here", "author": "Fictional Name"},
      {"id": "2", "text": "quote here", "author": "Fictional Name"},
      {"id": "3", "text": "quote here", "author": "Fictional Name"},
      {"id": "4", "text": "quote here", "author": "Fictional Name"}
    ]`,
  });

  try {
    return JSON.parse(response.text);
  } catch {
    throw new Error("AI returned unexpected format. Try again.");
  }
}

// ─── IMAGE GENERATION ────────────────────────────────────────────────────────

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

// ─── PUBLISH TO WIX ──────────────────────────────────────────────────────────

export async function publishToWix(quote, imageUrl) {
  // This calls the Wix HTTP function we will build in Step 5.
  // The URL will be updated once the Wix HTTP function is deployed.
  const WIX_ENDPOINT = "https://PLACEHOLDER.wixsite.com/_functions/publishQuote";
  const SECRET_KEY = "PLACEHOLDER_SECRET";

  const response = await fetch(WIX_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": SECRET_KEY,
    },
    body: JSON.stringify({
      quoteText: quote.quoteText,
      topic: quote.topic,
      author: quote.author,
      imageUrl: imageUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Wix publish failed: ${error}`);
  }

  return await response.json();
}