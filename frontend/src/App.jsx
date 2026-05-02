import { useState } from "react";
import QuoteGenerator from "./components/QuoteGenerator";
import { publishToWix } from "./components/quoteService";
import "./App.css";

const WIX_SITE_URL =
  "https://ericaavitzur.wixstudio.com/quote-display-site/quotes";

export default function App() {
  const [quotes, setQuotes] = useState([]);
  const [toast, setToast] = useState(null);

  const savedQuotes = quotes.filter((q) => q.status === "saved");

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div>
            <h1 className="app-title">Quote Generator</h1>
            <p className="app-subtitle">
              Generate AI quotes and publish them to your site
            </p>
          </div>
          <a
            href={WIX_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="view-site-link"
          >
            {"View Published Quotes →"}
          </a>
        </div>
      </header>

      <main className="app-main">
        <QuoteGenerator
          quotes={quotes}
          setQuotes={setQuotes}
          onToast={showToast}
        />

        <section className="saved-section">
          <div className="section-header">
            <h2 className="section-title">Saved Quotes</h2>
            <span className="saved-count">
              {savedQuotes.length}{" "}
              {"quote"}
              {savedQuotes.length !== 1 ? "s" : ""}
            </span>
          </div>

          <p className="section-note">
            Saved quotes persist here until published or discarded. Generated
            quotes are transient and reset when you generate a new batch.
          </p>

          {savedQuotes.length === 0 ? (
            <div className="empty-state">
              No saved quotes yet. Generate quotes above and click Save.
            </div>
          ) : (
            <div className="saved-list">
              {savedQuotes.map((quote) => (
                <SavedQuoteRow
                  key={quote.id}
                  quote={quote}
                  setQuotes={setQuotes}
                  onToast={showToast}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

function SavedQuoteRow({ quote, setQuotes, onToast }) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState(null);

  async function handlePublish() {
    setIsPublishing(true);
    setError(null);

    try {
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
      onToast("Quote published successfully ✓", "success");
    } catch (err) {
      setIsPublishing(false);
      setError(err.message);
      onToast(`Publish failed: ${err.message}`, "error");
    }
  }

  function handleDiscard() {
    setQuotes((prev) => prev.filter((q) => q.id !== quote.id));
  }

  return (
    <div
      className={`saved-row ${
        isPublishing ? "status-publishing" : "status-saved"
      }`}
    >
      <div className="saved-row-content">
        <div className="saved-row-text">{quote.quoteText}</div>
        <div className="saved-row-meta">
          <span className="saved-row-author">{"— "}{quote.author}</span>
          <span className="saved-row-topic">{"#"}{quote.topic}</span>
        </div>
        {error && <div className="saved-row-error">{error}</div>}
      </div>

      <div className="saved-row-actions">
        {isPublishing ? (
          <span className="status-label">Publishing...</span>
        ) : (
          <>
            <button
              className="btn btn-publish"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              Publish
            </button>
            <button
              className="btn btn-discard"
              onClick={handleDiscard}
              disabled={isPublishing}
            >
              Discard
            </button>
          </>
        )}
      </div>
    </div>
  );
}