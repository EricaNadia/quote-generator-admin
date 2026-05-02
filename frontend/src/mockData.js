// MOCK CONFIG substitutes real Base44 AI calls during development.
// USE_MOCK = true: zero integration credits spent, deterministic output.
// USE_MOCK = false: real AI generation, uses Base44 integration credits.
// Switch to false only when building the final demo.
// Both paths return the same data shape: { id, quoteText, topic, author, status, createdAt }
export const USE_MOCK = false; // was true

// Generate 4 mock quotes based on topic
export function mockGenerateQuotes(topic) {
  return Array.from({ length: 4 }).map((_, i) => ({
    id: `mock-${i + 1}-${Date.now()}`,
    quoteText: `"Insight about ${topic} #${i + 1}"`,
    topic,
    author: `AI Thinker ${i + 1}`,
    status: "pending",
    imageUrl: null,
    createdAt: new Date().toISOString()
  }));
}

// Mock image generation (used during publish step)
export function mockGenerateImage(quoteText) {
  return `https://placehold.co/600x400?text=${encodeURIComponent("Quote Image")}`;
}