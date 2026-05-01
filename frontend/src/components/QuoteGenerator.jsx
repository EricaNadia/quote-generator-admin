// QuoteGenerator.jsx
// Central state manager for quotes with clear publish contract

import { useState } from "react";
import QuoteCard from "./QuoteCard";
import { generateQuotes, publishToWix } from "./quoteService";

export default function QuoteGenerator() {
  const [topic, setTopic] = useState("");
  const [quotes, setQuotes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerate() {
    if (!topic.trim()) {
      setError("Please enter a topic first.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setQuotes([]);

    try {
      const generated = await generateQuotes(topic.trim());

      const withStatus = generated.map((q) => ({
        ...q,
        topic: topic.trim(),
        status: "pending",
      }));

      setQuotes(withStatus);
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSave(quote) {
    setQuotes((prev) =>
      prev.map((q) => (q.id === quote.id ? { ...q, status: "saved" } : q))
    );
    return Promise.resolve();
  }

  function handleDiscard(quote) {
    setQuotes((prev) => prev.filter((q) => q.id !== quote.id));
  }

  // Fixed: Clear contract + safety guard
  async function handlePublish(quote) {
  if (quote.status !== "saved") {
    throw new Error("Quote must be saved before publishing.");
  }

  // Set status to publishing while we wait
  setQuotes((prev) =>
    prev.map((q) =>
      q.id === quote.id ? { ...q, status: "publishing" } : q
    )
  );

  try {
    // Base44 backend function handles image generation and Wix call
    await publishToWix({
      quoteText: quote.quoteText,
      topic: quote.topic,
      author: quote.author,
    });

    setQuotes((prev) =>
      prev.map((q) =>
        q.id === quote.id ? { ...q, status: "published" } : q
      )
    );
  } catch (err) {
    // Roll back to saved state on failure
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === quote.id ? { ...q, status: "saved" } : q
      )
    );
    throw err;
  }
}

  return (
    <div className="generator">
      <div className="input-row">
        <input
          type="text"
          className="topic-input"
          placeholder="Enter a topic (e.g. courage, time, friendship)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          disabled={isGenerating}
        />
        <button
          className="btn btn-generate"
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
        >
          {isGenerating ? "Generating..." : "Generate"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {quotes.length > 0 && (
        <div className="quotes-grid">
          {quotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onSave={handleSave}
              onDiscard={handleDiscard}
              onPublish={handlePublish}
            />
          ))}
        </div>
      )}

      {quotes.length === 0 && !isGenerating && !error && (
        <div className="empty-state">
          Enter a topic above and click Generate to create quotes.
        </div>
      )}
    </div>
  );
}