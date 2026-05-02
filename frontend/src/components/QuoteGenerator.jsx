// QuoteGenerator.jsx
// Receives quotes and setQuotes from App.jsx (shared state).
// Manages the current generation batch via generatedIds.
// Only shows quotes from the current batch that are still pending.

import { useState } from "react";
import QuoteCard from "./QuoteCard";
import { generateQuotes, publishToWix } from "./quoteService";

export default function QuoteGenerator({ quotes, setQuotes, onToast }) {
  const [topic, setTopic] = useState("");
  const [generatedIds, setGeneratedIds] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Show only quotes from this generation batch that are still pending.
  // Saved quotes are removed from this view (they move to Saved section).
  // Published quotes are removed from this view (they are done).
  const currentQuotes = quotes.filter(
    (q) => generatedIds.includes(q.id) && q.status === "pending"
  );

  async function handleGenerate() {
    if (!topic.trim()) {
      setError("Please enter a topic first.");
      return;
    }
    setIsGenerating(true);
    setError(null);

    try {
      const generated = await generateQuotes(topic.trim());

      const withStatus = generated.map((q) => ({
        ...q,
        topic: topic.trim(),
        status: "pending",
      }));

      setQuotes((prev) => [...prev, ...withStatus]);
      setGeneratedIds(withStatus.map((q) => q.id));
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSave(quote) {
    // Move quote to saved state — QuoteGenerator filter removes it from view
    // because it is no longer "pending". App.jsx Saved section picks it up.
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === quote.id ? { ...q, status: "saved" } : q
      )
    );
    onToast("Quote saved ✓", "success");
    return Promise.resolve();
  }

  function handleDiscard(quote) {
    setQuotes((prev) => prev.filter((q) => q.id !== quote.id));
    setGeneratedIds((prev) => prev.filter((id) => id !== quote.id));
  }

  async function handlePublish(quote) {
  // Do NOT remove from generatedIds yet.
  // QuoteCard shows orange "Publishing..." while isLocalLoading is true.
  // We remove from generatedIds only after the call completes.
  try {
    await publishToWix({
      quoteText: quote.quoteText,
      topic: quote.topic,
      author: quote.author,
    });

    // Success: remove from Generated view and mark as published
    setGeneratedIds((prev) => prev.filter((id) => id !== quote.id));
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === quote.id ? { ...q, status: "published" } : q
      )
    );
    onToast("Quote published successfully ✓", "success");
  } catch (err) {
    // Failure: card stays visible in Generated with error shown on card
    onToast(`Publish failed: ${err.message}`, "error");
    throw err;
  }
}

  return (
    <section className="generate-section">
      <div className="section-header">
        <h2 className="section-title">Generate Quotes</h2>
      </div>

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

      {currentQuotes.length > 0 && (
        <div className="quotes-grid">
          {currentQuotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onSave={handleSave}
              onDiscard={handleDiscard}
              onPublish={handlePublish}
              onPublishSuccess={() => {}}
              onPublishError={() => {}}
            />
          ))}
        </div>
      )}

      {currentQuotes.length === 0 && !isGenerating && !error && (
        <div className="empty-state">
          Enter a topic above and click Generate to create 4 quotes.
        </div>
      )}
    </section>
  );
}