import { JSX, useEffect } from 'react';
import { useSearchResults, widget, WidgetDataType } from '@sitecore-search/react';
import type { ChemistrySearchResult, SearchFacet } from 'lib/search/types';

type ChemistrySearchResultsProps = {
  keyphrase: string;
};

const resolveCompoundName = (result: ChemistrySearchResult): string =>
  result.compound_name || result.title || 'Untitled compound';

const ChemistrySearchResultsInner = ({ keyphrase }: ChemistrySearchResultsProps): JSX.Element => {
  const {
    widgetRef,
    actions: { onKeyphraseChange },
    queryResult: {
      isLoading,
      isFetching,
      data: { total_item: totalItems = 0, facet: facets = [], content: results = [] } = {},
    },
  } = useSearchResults<ChemistrySearchResult>({
    query: (query) => {
      query.getRequest().setSearchQueryKeyphrase(keyphrase || '');
    },
  });

  useEffect(() => {
    onKeyphraseChange({ keyphrase: keyphrase || '' });
  }, [keyphrase, onKeyphraseChange]);

  if (isLoading || isFetching) {
    return (
      <div className="search-overlay__status" ref={widgetRef}>
        Scanning chemistry inventory…
      </div>
    );
  }

  if (!keyphrase.trim()) {
    return (
      <div className="search-overlay__status" ref={widgetRef}>
        Enter a compound, formula, or process to search lab intel.
      </div>
    );
  }

  return (
    <div className="search-overlay__results" ref={widgetRef}>
      <p className="search-overlay__summary">
        {totalItems} result{totalItems === 1 ? '' : 's'} for &ldquo;{keyphrase}&rdquo;
      </p>

      {(facets as SearchFacet[]).length > 0 && (
        <div className="search-overlay__facets">
          {(facets as SearchFacet[]).map((facet) => (
            <div key={facet.name} className="search-overlay__facet">
              <span className="search-overlay__facet-label">{facet.label || facet.name}</span>
              <div className="search-overlay__facet-values">
                {facet.value?.map((value) => (
                  <span key={value.id} className="search-overlay__facet-chip">
                    {value.text}
                    <span className="search-overlay__facet-count">{value.count}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 ? (
        <div className="search-overlay__status">No chemistry intel matched that query.</div>
      ) : (
        <ul className="search-overlay__result-list" role="list">
          {results.map((result) => (
            <li key={result.id} className="search-overlay__result-item">
              <article className="search-result-card">
                <div className="search-result-card__header">
                  <h3 className="search-result-card__title">
                    {result.url ? (
                      <a href={result.url}>{resolveCompoundName(result)}</a>
                    ) : (
                      resolveCompoundName(result)
                    )}
                  </h3>
                  {result.category && (
                    <span className="search-result-card__badge">{result.category}</span>
                  )}
                </div>

                {result.common_name && (
                  <p className="search-result-card__alias">Also known as: {result.common_name}</p>
                )}

                {result.chemical_formula && (
                  <p className="search-result-card__formula">{result.chemical_formula}</p>
                )}

                <div className="search-result-card__meta">
                  {result.purity_grade && (
                    <span className="search-result-card__meta-item">
                      Purity: {result.purity_grade}
                    </span>
                  )}
                  {result.hazard_level && (
                    <span
                      className={`search-result-card__meta-item search-result-card__meta-item--hazard-${result.hazard_level.toLowerCase()}`}
                    >
                      Hazard: {result.hazard_level}
                    </span>
                  )}
                </div>

                {result.description && (
                  <p className="search-result-card__description">{result.description}</p>
                )}
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ChemistrySearchResultsWidget = widget(
  ChemistrySearchResultsInner,
  WidgetDataType.SEARCH_RESULTS,
  'content'
);

export default ChemistrySearchResultsWidget;
