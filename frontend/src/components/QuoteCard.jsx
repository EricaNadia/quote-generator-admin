// QuoteCard.jsx
// Displays a single generated quote with Save, Discard, and Publish actions.
// Uses isLocalLoading to show publishing feedback before parent state updates.

import { useState } from "react";

export default function QuoteCard({
  quote,
  onSave,
  onDiscard,
  onPublish,
  onPublishSuccess,
  onPublishError,
}) {
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const status = quote.status;
  const isBusy = isLocalLoading;

  // Show orange publishing style when publish is in flight
  const displayStatus =
    isLocalLoading && status === "pending" ? "publishing" : status;

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
      onPublishSuccess?.();
    } catch (err) {
      const msg = err.message || String(err);
      setLocalError(msg);
      onPublishError?.(msg);
    } finally {
      setIsLocalLoading(false);
    }
  }

  function handleDiscard() {
    onDiscard(quote);
  }

  return (
    <div className={`quote-card status-${displayStatus}`}>
      <div className="quote-text">{quote.quoteText}</div>
      <div className="quote-author">{"— "}{quote.author}</div>

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
              className="btn btn-publish"
              onClick={handlePublish}
              disabled={isBusy}
            >
              {isLocalLoading ? "Publishing..." : "Publish"}
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

        {status === "published" && (
          <span className="status-label published">
            ✓ Published to Wix site
          </span>
        )}
      </div>
    </div>
  );
}