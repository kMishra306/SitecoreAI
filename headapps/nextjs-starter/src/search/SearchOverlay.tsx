import { FormEvent, JSX, useEffect, useId, useRef, useState } from 'react';
import ChemistrySearchResultsWidget from 'src/search/ChemistrySearchResults';
import { getSearchConfig } from 'lib/search/config';

type SearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps): JSX.Element | null => {
  const [keyphrase, setKeyphrase] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const searchConfig = getSearchConfig();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setKeyphrase('');
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="search-overlay" role="presentation">
      <button
        type="button"
        className="search-overlay__backdrop"
        aria-label="Close search"
        onClick={onClose}
      />

      <div
        className="search-overlay__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="search-overlay__panel-header">
          <div>
            <p className="search-overlay__eyebrow">Chemistry Intel Search</p>
            <h2 id={titleId} className="search-overlay__title">
              Lab Inventory Lookup
            </h2>
          </div>
          <button type="button" className="search-overlay__close" onClick={onClose}>
            <span className="search-overlay__close-icon" aria-hidden="true" />
            <span className="sr-only">Close search</span>
          </button>
        </div>

        <form className="search-overlay__form" onSubmit={handleSubmit}>
          <label className="search-overlay__label" htmlFor="chemistry-search-input">
            Search compounds, formulas, and processes
          </label>
          <div className="search-overlay__input-wrap">
            <span className="search-overlay__input-icon" aria-hidden="true" />
            <input
              ref={inputRef}
              id="chemistry-search-input"
              type="search"
              className="search-overlay__input"
              placeholder="Search chemistry intel…"
              value={keyphrase}
              onChange={(event) => setKeyphrase(event.target.value)}
              autoComplete="off"
            />
          </div>
        </form>

        <ChemistrySearchResultsWidget rfkId={searchConfig.widgetRfkId} keyphrase={keyphrase} />
      </div>
    </div>
  );
};

export default SearchOverlay;
