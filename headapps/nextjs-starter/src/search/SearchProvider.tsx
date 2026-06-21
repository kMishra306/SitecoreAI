import { JSX, ReactNode, useEffect, useState } from 'react';
import { PageController, WidgetsProvider } from '@sitecore-search/react';
import { getSearchConfig, isSearchConfigured } from 'lib/search/config';

type SearchProviderProps = {
  children: ReactNode;
};

const SearchProvider = ({ children }: SearchProviderProps): JSX.Element => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (!isSearchConfigured()) {
      return;
    }

    PageController.getContext().setLocaleLanguage('en');
    PageController.getContext().setLocaleCountry('us');
  }, []);

  if (!isSearchConfigured() || !isClient) {
    return <>{children}</>;
  }

  const searchConfig = getSearchConfig();

  return (
    <WidgetsProvider
      env={searchConfig.env}
      customerKey={searchConfig.customerKey}
      apiKey={searchConfig.apiKey}
      publicSuffix={true}
    >
      {children}
    </WidgetsProvider>
  );
};

export default SearchProvider;
