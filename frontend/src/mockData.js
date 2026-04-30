// MOCK CONFIG — prevents Base44 credit usage during development
export const USE_MOCK = true;

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