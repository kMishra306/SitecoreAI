import { CSSProperties, JSX } from 'react';
import {
  Field,
  ImageField,
  Link as JssLink,
  LinkField,
  Text,
  useSitecoreContext,
} from '@sitecore-jss/sitecore-jss-nextjs';

/**
 * Sitecore datasource fields for the HeroBanner template.
 *
 * Layout Service returns field keys in lowercase (e.g. `backgroundimage`),
 * so those names are the source of truth here.
 */
interface Fields {
  title: Field<string>;
  subtitle: Field<string>;
  /** Sitecore field: Background Image */
  backgroundimage: ImageField;
  /** Sitecore field: CTA Button */
  ctabutton: LinkField;
}

type HeroBannerProps = {
  params: { [key: string]: string };
  fields: Fields;
};

const HeroBannerEmpty = (props: HeroBannerProps): JSX.Element => (
  <div className={`component hero-banner-block ${props?.params?.styles ?? ''}`.trimEnd()}>
    <div className="component-content">
      <span className="is-empty-hint">Hero Banner</span>
    </div>
  </div>
);

/**
 * Layout Service may expose image fields under different casings depending on
 * template setup. Resolve the first populated ImageField we find.
 */
const resolveBackgroundImageField = (
  fields: Fields & Record<string, unknown>
): ImageField | undefined => {
  const candidates = [
    fields.backgroundimage,
    fields.backgroundImage,
    fields.BackgroundImage,
  ] as Array<ImageField | undefined>;

  return candidates.find((field) => Boolean(field?.value?.src));
};

const resolveCtaField = (fields: Fields & Record<string, unknown>): LinkField | undefined => {
  const candidates = [fields.ctabutton, fields.ctaButton, fields.CtaButton] as Array<
    LinkField | undefined
  >;

  return candidates.find((field) => Boolean(field?.value));
};

const getBackgroundImageUrl = (imageField?: ImageField): string | undefined =>
  imageField?.value?.src || undefined;

const getHeroWrapperStyle = (backgroundImageUrl?: string): CSSProperties => ({
  ...(backgroundImageUrl ? { backgroundImage: `url('${backgroundImageUrl}')` } : {}),
});

export const Default = (props: HeroBannerProps): JSX.Element => {
  const { fields, params } = props;
  const { sitecoreContext } = useSitecoreContext();
  const renderingId = params?.RenderingIdentifier;
  const styleParams = params?.styles ?? '';

  if (!fields) {
    return <HeroBannerEmpty {...props} />;
  }

  const resolvedFields = fields as Fields & Record<string, unknown>;
  const backgroundImageField = resolveBackgroundImageField(resolvedFields);
  const ctaField = resolveCtaField(resolvedFields);
  const backgroundImageUrl = getBackgroundImageUrl(backgroundImageField);
  const wrapperStyle = getHeroWrapperStyle(backgroundImageUrl);
  const imageAlt =
    typeof backgroundImageField?.value?.alt === 'string'
      ? backgroundImageField.value.alt
      : undefined;

  const isEmptyBackgroundImage =
    sitecoreContext.pageEditing && backgroundImageField?.value?.class === 'scEmptyImage';

  const rootClassName = [
    'component',
    'hero-banner-block',
    styleParams,
    isEmptyBackgroundImage ? 'hero-banner-block--empty-image' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      className={rootClassName}
      id={renderingId || undefined}
      aria-label={imageAlt || 'Hero banner'}
    >
      <div className="component-content">
        <div className="hero-banner-block__wrapper" style={wrapperStyle}>
          <div className="hero-banner-block__overlay" aria-hidden="true" />

          <div className="hero-banner-block__content">
            <h1 className="hero-banner-block__title field-title">
              <Text field={fields.title} />
            </h1>

            <p className="hero-banner-block__subtitle field-subtitle">
              <Text field={fields.subtitle} />
            </p>

            {ctaField && (
              <div className="hero-banner-block__cta field-cta">
                <JssLink field={ctaField} className="hero-banner-block__cta-link" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
