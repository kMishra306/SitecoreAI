export interface ChemistrySearchResult {
  id: string;
  title?: string;
  description?: string;
  url?: string;
  compound_name?: string;
  common_name?: string;
  chemical_formula?: string;
  category?: string;
  hazard_level?: string;
  purity_grade?: string;
  search_keywords?: string;
}

export interface SearchFacetValue {
  id: string;
  text: string;
  count: number;
}

export interface SearchFacet {
  name: string;
  label?: string;
  value?: SearchFacetValue[];
}
