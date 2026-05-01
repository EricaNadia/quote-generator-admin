// entry.ts
// Base44 backend function: publishQuote
//
// Architecture role:
//   React → base44.functions.invoke("publishQuote") → THIS FUNCTION → Wix HTTP function
//
// Responsibilities:
//   1. Receive quote data from React (no secrets on client)
//   2. Generate image via Base44 AI integration (mock-safe)
//   3. Read WIX_ENDPOINT and PUBLISH_SECRET from environment
//   4. POST to Wix HTTP function with secret header
//   5. Return result to React

import { createClientFromRequest } from "npm:@base44/sdk";

// ── Mock configuration ────────────────────────────────────────────────────────
// Set USE_MOCK = true to skip real AI image generation (saves credits).
// Switch to false only for final demo.
const USE_MOCK = true;

const MOCK_IMAGE_URL =
  "https://placehold.co/600x400?text=Quote+Image";

// ── Main function handler ─────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);

    // ── Step 1: Parse incoming payload from React ──────────────────────────
    const { quoteText, topic, author } = await req.json();

    if (!quoteText || !topic || !author) {
      return Response.json(
        { error: "Missing required fields: quoteText, topic, author" },
        { status: 400 }
      );
    }

    // ── Step 2: Generate image ─────────────────────────────────────────────
    // Mock: returns placeholder URL, costs zero credits.
    // Real: calls Base44 AI image generation, costs integration credits.
    let imageUrl: string;

    if (USE_MOCK) {
      imageUrl = MOCK_IMAGE_URL;
    } else {
      // REAL image generation — only enable for final demo
      const imageResult = await base44.integrations.ai.generateImage({
        prompt: `Minimalist elegant background for this quote: "${quoteText}". 
                 Abstract, no text, suitable for a quote card.`,
      });
      imageUrl = imageResult.url;
    }

    // ── Step 3: Read secrets from environment ──────────────────────────────
    // These are set via: base44 secrets set WIX_ENDPOINT ...
    // They never appear in React code.
    const wixEndpoint = Deno.env.get("WIX_ENDPOINT");
    const publishSecret = Deno.env.get("PUBLISH_SECRET");

    if (!wixEndpoint || !publishSecret) {
      return Response.json(
        { error: "Missing environment variables: WIX_ENDPOINT or PUBLISH_SECRET" },
        { status: 500 }
      );
    }

    // ── Step 4: POST to Wix HTTP function ─────────────────────────────────
    const wixPayload = {
      quoteText,
      topic,
      author,
      imageUrl,
    };

    const wixResponse = await fetch(wixEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // This header is validated by the Wix HTTP function
        "x-api-key": publishSecret,
      },
      body: JSON.stringify(wixPayload),
    });

    // ── Step 5: Handle Wix response ───────────────────────────────────────
    const wixResult = await wixResponse.json();

    if (!wixResponse.ok) {
      return Response.json(
        {
          error: "Wix publish failed",
          detail: wixResult.error || wixResponse.statusText,
        },
        { status: 502 }
      );
    }

    // ── Step 6: Return success to React ───────────────────────────────────
    return Response.json({
      success: true,
      itemId: wixResult.itemId,
      imageUrl,
    });

  } catch (error) {
    // Catch-all: return error details for debugging
    return Response.json(
      { error: "Internal function error", detail: (error as Error).message },
      { status: 500 }
    );
  }
});