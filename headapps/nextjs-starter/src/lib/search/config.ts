import type { Environment } from '@sitecore-search/data';

export interface SearchConfig {
  env: Environment;
  customerKey: string;
  apiKey: string;
  widgetRfkId: string;
}

/**
 * Sitecore Search is configured via Vercel env vars (non-prod / prod CEC credentials).
 * Local development typically omits these — search UI stays hidden until deployed.
 */
export const isSearchConfigured = (): boolean =>
  Boolean(
    process.env.NEXT_PUBLIC_SEARCH_ENV &&
      process.env.NEXT_PUBLIC_SEARCH_CUSTOMER_KEY &&
      process.env.NEXT_PUBLIC_SEARCH_API_KEY
  );

export const getSearchConfig = (): SearchConfig => ({
  env: process.env.NEXT_PUBLIC_SEARCH_ENV as Environment,
  customerKey: process.env.NEXT_PUBLIC_SEARCH_CUSTOMER_KEY as string,
  apiKey: process.env.NEXT_PUBLIC_SEARCH_API_KEY as string,
  widgetRfkId: process.env.NEXT_PUBLIC_SEARCH_WIDGET_RFK_ID || 'chemistry_search_results',
});
