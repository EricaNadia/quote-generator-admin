import { useState, useEffect } from "react";
import QuoteGenerator from "./components/QuoteGenerator";
import SavedQuotesList from "./components/SavedQuotesList";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("generate");

  return (
    <div className="app">
      <header className="app-header">
        <h1>Quote Generator Admin</h1>
        <p className="subtitle">Generate, save, and publish AI quotes</p>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === "generate" ? "tab active" : "tab"}
          onClick={() => setActiveTab("generate")}
        >
          Generate Quotes
        </button>
        <button
          className={activeTab === "saved" ? "tab active" : "tab"}
          onClick={() => setActiveTab("saved")}
        >
          Saved Quotes
        </button>
      </nav>

      <main className="app-main">
        {activeTab === "generate" && <QuoteGenerator />}
        {activeTab === "saved" && <SavedQuotesList />}
      </main>
    </div>
  );
}