import { JSX } from 'react';
import { Field, Link as JssLink, LinkField, Text } from '@sitecore-jss/sitecore-jss-nextjs';

/**
 * Sitecore datasource fields for the Footer template (Breaking Bad / Heisenberg Empire).
 *
 * | CMS field name      | Sitecore type     | Purpose |
 * |---------------------|-------------------|---------|
 * | logotext            | Single-Line Text  | Periodic-table logo, e.g. `[Ma]drigal [El]ectromotive` |
 * | tagline             | Single-Line Text  | Brand tagline under logo |
 * | footerlinks         | Multilist         | Footer Link items (linklabel + linkurl) |
 * | compliancetitle     | Single-Line Text  | Compliance section heading |
 * | compliancemessage   | Single-Line Text  | Regulatory status message |
 * | compliancelevel     | Single-Line Text  | `Low`, `Medium`, or `High` (status dot color) |
 * | contactlabel        | Single-Line Text  | Contact block heading |
 * | contactemail        | Single-Line Text  | Contact email display |
 * | contactphone        | Single-Line Text  | Contact phone display |
 * | copyrighttext       | Single-Line Text  | Copyright line |
 * | disclaimertext      | Multi-Line Text   | Legal / fan disclaimer (supports line breaks) |
 * | sociallinks         | Multilist         | Footer Social Link items (platformlabel + platformlink) |
 *
 * Footer Link item: linklabel, linkurl
 * Footer Social Link item: platformlabel, platformlink
 */
interface FooterLinkItemFields {
  linklabel: Field<string>;
  linkurl: LinkField;
}

interface FooterLinkItem {
  id: string;
  fields: FooterLinkItemFields & Record<string, unknown>;
}

interface FooterSocialLinkItemFields {
  platformlabel: Field<string>;
  platformlink: LinkField;
}

interface FooterSocialLinkItem {
  id: string;
  fields: FooterSocialLinkItemFields & Record<string, unknown>;
}

interface Fields {
  logotext: Field<string>;
  tagline: Field<string>;
  footerlinks: FooterLinkItem[];
  compliancetitle: Field<string>;
  compliancemessage: Field<string>;
  compliancelevel: Field<string>;
  contactlabel: Field<string>;
  contactemail: Field<string>;
  contactphone: Field<string>;
  copyrighttext: Field<string>;
  disclaimertext: Field<string>;
  sociallinks: FooterSocialLinkItem[];
}

type FooterProps = {
  params: { [key: string]: string };
  fields: Fields;
};

type ComplianceLevel = 'low' | 'medium' | 'high';

type LogoPart = { type: 'element' | 'text'; value: string };

const pickField = <T,>(source: Record<string, unknown>, keys: string[]): T | undefined => {
  for (const key of keys) {
    if (source[key]) {
      return source[key] as T;
    }
  }

  return undefined;
};

const parseLogoText = (raw?: string): LogoPart[] => {
  if (!raw?.trim()) {
    return [];
  }

  const parts: LogoPart[] = [];
  const regex = /\[([^\]]+)\]|([^[\]]+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    if (match[1]) {
      parts.push({ type: 'element', value: match[1] });
    } else if (match[2]) {
      parts.push({ type: 'text', value: match[2] });
    }
  }

  return parts;
};

const normalizeComplianceLevel = (raw?: string): ComplianceLevel => {
  const value = raw?.trim().toLowerCase() ?? '';

  if (['high', 'critical', 'evade'].includes(value)) {
    return 'high';
  }

  if (['medium', 'caution', 'elevated'].includes(value)) {
    return 'medium';
  }

  return 'low';
};

const FooterEmpty = (props: FooterProps): JSX.Element => (
  <div className={`component footer-block ${props?.params?.styles ?? ''}`.trimEnd()}>
    <div className="component-content">
      <span className="is-empty-hint">Footer</span>
    </div>
  </div>
);

const PeriodicLogo = ({ text, classPrefix }: { text?: string; classPrefix: string }) => {
  const parts = parseLogoText(text);

  if (!parts.length) {
    return <span className={`${classPrefix}__logo-fallback`}>Heisenberg</span>;
  }

  return (
    <span className={`${classPrefix}__logo`} aria-label={text}>
      {parts.map((part, index) =>
        part.type === 'element' ? (
          <span key={index} className={`${classPrefix}__element`}>
            <span className={`${classPrefix}__element-symbol`}>{part.value}</span>
          </span>
        ) : (
          <span key={index} className={`${classPrefix}__logo-text`}>
            {part.value}
          </span>
        )
      )}
    </span>
  );
};

export const Default = (props: FooterProps): JSX.Element => {
  const { fields, params } = props;
  const renderingId = params?.RenderingIdentifier;
  const styleParams = params?.styles ?? '';

  if (!fields) {
    return <FooterEmpty {...props} />;
  }

  const resolved = fields as Fields & Record<string, unknown>;
  const logoField = pickField<Field<string>>(resolved, ['logotext', 'LogoText']);
  const taglineField = pickField<Field<string>>(resolved, ['tagline', 'Tagline']);
  const footerLinks = (resolved.footerlinks ?? resolved.FooterLinks ?? []) as FooterLinkItem[];
  const complianceTitleField = pickField<Field<string>>(resolved, [
    'compliancetitle',
    'ComplianceTitle',
  ]);
  const complianceMessageField = pickField<Field<string>>(resolved, [
    'compliancemessage',
    'ComplianceMessage',
  ]);
  const complianceLevelField = pickField<Field<string>>(resolved, [
    'compliancelevel',
    'ComplianceLevel',
  ]);
  const contactLabelField = pickField<Field<string>>(resolved, ['contactlabel', 'ContactLabel']);
  const contactEmailField = pickField<Field<string>>(resolved, ['contactemail', 'ContactEmail']);
  const contactPhoneField = pickField<Field<string>>(resolved, ['contactphone', 'ContactPhone']);
  const copyrightField = pickField<Field<string>>(resolved, ['copyrighttext', 'CopyrightText']);
  const disclaimerField = pickField<Field<string>>(resolved, ['disclaimertext', 'DisclaimerText']);
  const socialLinks = (resolved.sociallinks ??
    resolved.SocialLinks ??
    []) as FooterSocialLinkItem[];

  const complianceLevel = normalizeComplianceLevel(complianceLevelField?.value);
  const rootClassName = ['component', 'footer-block', styleParams].filter(Boolean).join(' ');

  return (
    <div className={rootClassName} id={renderingId || undefined} data-compliance={complianceLevel}>
      <div className="component-content">
        <div className="footer-block__main">
          <div className="footer-block__brand">
            <PeriodicLogo text={logoField?.value} classPrefix="footer-block" />
            {taglineField && (
              <p className="footer-block__tagline field-tagline">
                <Text field={taglineField} />
              </p>
            )}
          </div>

          {footerLinks.length > 0 && (
            <nav className="footer-block__links" aria-label="Footer navigation">
              <ul className="footer-block__links-list" role="list">
                {footerLinks.map((item) => {
                  const label = pickField<Field<string>>(item.fields, ['linklabel', 'LinkLabel']);
                  const link = pickField<LinkField>(item.fields, ['linkurl', 'LinkUrl']);

                  if (!link?.value?.href) {
                    return null;
                  }

                  return (
                    <li key={item.id} className="footer-block__links-item">
                      <JssLink field={link} className="footer-block__links-link">
                        {label ? <Text field={label} /> : null}
                      </JssLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          {(complianceTitleField || complianceMessageField) && (
            <div
              className={`footer-block__compliance footer-block__compliance--${complianceLevel}`}
            >
              {complianceTitleField && (
                <h2 className="footer-block__compliance-title field-compliancetitle">
                  <Text field={complianceTitleField} />
                </h2>
              )}
              <div className="footer-block__compliance-body">
                <span className="footer-block__compliance-dot" aria-hidden="true" />
                {complianceMessageField && (
                  <p className="footer-block__compliance-message field-compliancemessage">
                    <Text field={complianceMessageField} />
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="footer-block__contact">
            {contactLabelField && (
              <h2 className="footer-block__contact-label field-contactlabel">
                <Text field={contactLabelField} />
              </h2>
            )}
            {contactEmailField && (
              <p className="footer-block__contact-email field-contactemail">
                <Text field={contactEmailField} tag="span" />
              </p>
            )}
            {contactPhoneField && (
              <p className="footer-block__contact-phone field-contactphone">
                <Text field={contactPhoneField} tag="span" />
              </p>
            )}

            {socialLinks.length > 0 && (
              <ul className="footer-block__social-list" role="list">
                {socialLinks.map((item) => {
                  const label = pickField<Field<string>>(item.fields, [
                    'platformlabel',
                    'PlatformLabel',
                  ]);
                  const link = pickField<LinkField>(item.fields, ['platformlink', 'PlatformLink']);

                  if (!link?.value?.href) {
                    return null;
                  }

                  return (
                    <li key={item.id} className="footer-block__social-item">
                      <JssLink field={link} className="footer-block__social-link">
                        {label ? <Text field={label} /> : null}
                      </JssLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="footer-block__bottom">
          {copyrightField && (
            <p className="footer-block__copyright field-copyrighttext">
              <Text field={copyrightField} tag="span" />
            </p>
          )}
          {disclaimerField && (
            <div className="footer-block__disclaimer field-disclaimertext">
              <Text field={disclaimerField} tag="p" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
