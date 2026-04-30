// SavedQuotesList.jsx
// Shows all quotes that have been saved or published in this session.

export default function SavedQuotesList() {
  return (
    <div className="saved-list">
      <h2>Saved Quotes</h2>
      <p className="saved-note">
        Quotes you save will appear here. In the full implementation, 
        these are persisted in the Base44 entity store and survive 
        page refreshes.
      </p>
      <div className="empty-state">
        No saved quotes yet. Go to Generate Quotes to create some.
      </div>
    </div>
  );
}