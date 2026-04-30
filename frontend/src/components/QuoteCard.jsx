// QuoteCard.jsx
// Purely presentational component with precise loading states

import { useState } from "react";

export default function QuoteCard({ 
  quote, 
  onSave, 
  onDiscard, 
  onPublish 
}) {
  
  const status = quote.status || "pending";
  const [localError, setLocalError] = useState(null);
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  // Derived busy state for disabling buttons
  const isBusy = isLocalLoading || status === "publishing";

  async function handleSave() {
    setIsLocalLoading(true);
    setLocalError(null);
    try {
      await onSave(quote);
    } catch (err) {
      setLocalError("Failed to save. Try again.");
    } finally {
      setIsLocalLoading(false);
    }
  }

  async function handlePublish() {
    setIsLocalLoading(true);
    setLocalError(null);
    try {
      await onPublish(quote);
    } catch (err) {
      setLocalError(`Publish failed: ${err.message || err}`);
    } finally {
      setIsLocalLoading(false);
    }
  }

  function handleDiscard() {
    onDiscard(quote);
  }

  return (
    <div className={`quote-card status-${status}`}>
      <div className="quote-text">{quote.quoteText}</div>
      <div className="quote-author">— {quote.author}</div>

      {localError && <div className="quote-error">{localError}</div>}

      <div className="quote-actions">
        {status === "pending" && (
          <>
            <button
              className="btn btn-save"
              onClick={handleSave}
              disabled={isBusy}
            >
              {isLocalLoading ? "Saving..." : "Save"}
            </button>
            <button
              className="btn btn-discard"
              onClick={handleDiscard}
              disabled={isBusy}
            >
              Discard
            </button>
          </>
        )}

        {status === "saved" && (
          <>
            <button
              className="btn btn-publish"
              onClick={handlePublish}
              disabled={isBusy}
            >
              {status === "publishing" 
                ? "Publishing..." 
                : isLocalLoading 
                  ? "Working..." 
                  : "Publish"}
            </button>
            <button
              className="btn btn-discard"
              onClick={handleDiscard}
              disabled={isBusy}
            >
              Discard
            </button>
          </>
        )}

        {status === "publishing" && (
          <span className="status-label">Generating image & publishing...</span>
        )}

        {status === "published" && (
          <span className="status-label published">
            ✓ Published to Wix site
          </span>
        )}
      </div>
    </div>
  );
}