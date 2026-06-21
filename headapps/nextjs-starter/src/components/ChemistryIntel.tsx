import { JSX } from 'react';
import Head from 'next/head';
import {
  Field,
  ImageField,
  NextImage as JssImage,
  RichText as JssRichText,
  Text,
  useSitecoreContext,
} from '@sitecore-jss/sitecore-jss-nextjs';

interface Fields {
  compoundname: Field<string>;
  commonname: Field<string>;
  chemicalformula: Field<string>;
  category: Field<string>;
  hazardlevel: Field<string>;
  puritygrade: Field<string>;
  searchkeywords: Field<string>;
  shortsummary: Field<string>;
  fulldescription: Field<string>;
  featuredimage: ImageField;
}

type ChemistryIntelProps = {
  params: { [key: string]: string };
  fields: Fields;
};

const pickField = <T,>(source: Record<string, unknown>, keys: string[]): T | undefined => {
  for (const key of keys) {
    if (source[key]) {
      return source[key] as T;
    }
  }

  return undefined;
};

const fieldValue = (field?: Field<string>): string => field?.value?.trim() || '';

const ChemistryIntelEmpty = (props: ChemistryIntelProps): JSX.Element => (
  <div className={`component chemistry-intel-block ${props?.params?.styles ?? ''}`.trimEnd()}>
    <div className="component-content">
      <span className="is-empty-hint">Chemistry Intel</span>
    </div>
  </div>
);

export const Default = (props: ChemistryIntelProps): JSX.Element => {
  const { fields, params } = props;
  const { sitecoreContext } = useSitecoreContext();
  const renderingId = params?.RenderingIdentifier;
  const styleParams = params?.styles ?? '';

  if (!fields) {
    return <ChemistryIntelEmpty {...props} />;
  }

  const resolved = fields as Fields & Record<string, unknown>;
  const compoundName = pickField<Field<string>>(resolved, ['compoundname', 'CompoundName']);
  const commonName = pickField<Field<string>>(resolved, ['commonname', 'CommonName']);
  const chemicalFormula = pickField<Field<string>>(resolved, [
    'chemicalformula',
    'ChemicalFormula',
  ]);
  const category = pickField<Field<string>>(resolved, ['category', 'Category']);
  const hazardLevel = pickField<Field<string>>(resolved, ['hazardlevel', 'HazardLevel']);
  const purityGrade = pickField<Field<string>>(resolved, ['puritygrade', 'PurityGrade']);
  const searchKeywords = pickField<Field<string>>(resolved, ['searchkeywords', 'SearchKeywords']);
  const shortSummary = pickField<Field<string>>(resolved, ['shortsummary', 'ShortSummary']);
  const fullDescription = pickField<Field<string>>(resolved, [
    'fulldescription',
    'FullDescription',
  ]);
  const featuredImage = pickField<ImageField>(resolved, ['featuredimage', 'FeaturedImage']);

  const compoundTitle = fieldValue(compoundName) || 'Chemistry Intel';
  const rootClassName = ['component', 'chemistry-intel-block', styleParams]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <Head>
        <title>{compoundTitle}</title>
        <meta name="description" content={fieldValue(shortSummary)} />
        <meta property="og:title" content={compoundTitle} />
        <meta name="chemistry:name" content={fieldValue(compoundName)} />
        <meta name="chemistry:common_name" content={fieldValue(commonName)} />
        <meta name="chemistry:formula" content={fieldValue(chemicalFormula)} />
        <meta name="chemistry:category" content={fieldValue(category)} />
        <meta name="chemistry:hazard" content={fieldValue(hazardLevel)} />
        <meta name="chemistry:purity" content={fieldValue(purityGrade)} />
        <meta name="keywords" content={fieldValue(searchKeywords)} />
      </Head>

      <div className={rootClassName} id={renderingId || undefined}>
        <div className="component-content">
          <div className="chemistry-intel-block__inner">
            <header className="chemistry-intel-block__header">
              <div className="chemistry-intel-block__heading-group">
                {compoundName && (
                  <h1 className="chemistry-intel-block__title field-compoundname">
                    <Text field={compoundName} />
                  </h1>
                )}
                {commonName && (
                  <p className="chemistry-intel-block__common-name field-commonname">
                    <Text field={commonName} tag="span" />
                  </p>
                )}
              </div>

              <div className="chemistry-intel-block__badges">
                {category && (
                  <span className="chemistry-intel-block__badge field-category">
                    <Text field={category} tag="span" />
                  </span>
                )}
                {hazardLevel && (
                  <span className="chemistry-intel-block__badge chemistry-intel-block__badge--hazard field-hazardlevel">
                    <Text field={hazardLevel} tag="span" />
                  </span>
                )}
                {purityGrade && (
                  <span className="chemistry-intel-block__badge chemistry-intel-block__badge--purity field-puritygrade">
                    <Text field={purityGrade} tag="span" />
                  </span>
                )}
              </div>
            </header>

            <div className="chemistry-intel-block__body">
              {featuredImage?.value?.src && (
                <div className="chemistry-intel-block__media field-featuredimage">
                  <JssImage field={featuredImage} />
                </div>
              )}

              <div className="chemistry-intel-block__details">
                {chemicalFormula && (
                  <div className="chemistry-intel-block__formula-card">
                    <span className="chemistry-intel-block__formula-label">Formula</span>
                    <span className="chemistry-intel-block__formula-value field-chemicalformula">
                      <Text field={chemicalFormula} tag="span" />
                    </span>
                  </div>
                )}

                {shortSummary && (
                  <p className="chemistry-intel-block__summary field-shortsummary">
                    <Text field={shortSummary} tag="span" />
                  </p>
                )}

                {fullDescription && (
                  <div className="chemistry-intel-block__description field-fulldescription">
                    <JssRichText field={fullDescription} />
                  </div>
                )}

                {!fullDescription?.value && !shortSummary?.value && sitecoreContext.pageEditing && (
                  <p className="chemistry-intel-block__summary">
                    Add summary or description content.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
