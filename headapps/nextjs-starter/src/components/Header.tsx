import { CSSProperties, JSX, useState } from 'react';
import {
  Field,
  Link as JssLink,
  LinkField,
  Text,
  useSitecoreContext,
} from '@sitecore-jss/sitecore-jss-nextjs';

/**
 * Sitecore datasource fields for the Header template (Breaking Bad / Heisenberg Empire).
 *
 * Layout Service returns field keys in lowercase — those names are the source of truth.
 *
 * | CMS field name           | Sitecore type     | Purpose |
 * |--------------------------|-------------------|---------|
 * | logotext                 | Single-Line Text  | Periodic-table logo, e.g. `[He]isenberg [Em]pire` |
 * | navlinks                 | Multilist         | Header Nav Link items (navlabel + navlink) |
 * | globalpurity             | Single-Line Text  | Batch purity readout, e.g. `99.1% Pure` |
 * | operationalcapacity      | Number            | Manufacturing capacity 0–100 (progress bar) |
 * | threatlevel              | Single-Line Text  | `Low`, `Medium`, or `High` (DEA threat meter) |
 * | securityalertmessage     | Single-Line Text  | Custom status message under threat indicator |
 * | burnnoticelink           | General Link      | Secure exit / logout URL |
 * | burnnoticelabel          | Single-Line Text  | Button label, e.g. `Activate Burn Notice` |
 *
 * Header Nav Link item template (multilist source):
 * | navlabel                 | Single-Line Text  | Link label shown in nav |
 * | navlink                  | General Link      | Destination URL |
 */
interface NavLinkItemFields {
  navlabel: Field<string>;
  navlink: LinkField;
}

interface NavLinkItem {
  id: string;
  fields: NavLinkItemFields & Record<string, unknown>;
}

interface Fields {
  logotext: Field<string>;
  navlinks: NavLinkItem[];
  globalpurity: Field<string>;
  operationalcapacity: Field<number>;
  threatlevel: Field<string>;
  securityalertmessage: Field<string>;
  burnnoticelink: LinkField;
  burnnoticelabel: Field<string>;
}

type HeaderProps = {
  params: { [key: string]: string };
  fields: Fields;
};

type ThreatLevel = 'low' | 'medium' | 'high';

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

const normalizeThreatLevel = (raw?: string): ThreatLevel => {
  const value = raw?.trim().toLowerCase() ?? '';

  if (['high', 'evade', 'critical'].includes(value)) {
    return 'high';
  }

  if (['medium', 'caution', 'elevated'].includes(value)) {
    return 'medium';
  }

  return 'low';
};

const THREAT_CONFIG: Record<ThreatLevel, { modifier: string; label: string; pulse?: boolean }> = {
  low: { modifier: 'header-block__threat--low', label: 'Operations Uninhibited' },
  medium: {
    modifier: 'header-block__threat--medium',
    label: 'Vamonos Pest protocol active',
  },
  high: {
    modifier: 'header-block__threat--high',
    label: 'Hank Schrader in sector — Burn the data!',
    pulse: true,
  },
};

const HeaderEmpty = (props: HeaderProps): JSX.Element => (
  <div className={`component header-block ${props?.params?.styles ?? ''}`.trimEnd()}>
    <div className="component-content">
      <span className="is-empty-hint">Header</span>
    </div>
  </div>
);

const PeriodicLogo = ({ text }: { text?: string }) => {
  const parts = parseLogoText(text);

  if (!parts.length) {
    return <span className="header-block__logo-fallback">Heisenberg</span>;
  }

  return (
    <span className="header-block__logo" aria-label={text}>
      {parts.map((part, index) =>
        part.type === 'element' ? (
          <span key={index} className="header-block__element">
            <span className="header-block__element-symbol">{part.value}</span>
          </span>
        ) : (
          <span key={index} className="header-block__logo-text">
            {part.value}
          </span>
        )
      )}
    </span>
  );
};

export const Default = (props: HeaderProps): JSX.Element => {
  const { fields, params } = props;
  const { sitecoreContext } = useSitecoreContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const renderingId = params?.RenderingIdentifier;
  const styleParams = params?.styles ?? '';

  if (!fields) {
    return <HeaderEmpty {...props} />;
  }

  const resolved = fields as Fields & Record<string, unknown>;
  const logoField = pickField<Field<string>>(resolved, ['logotext', 'LogoText']);
  const navLinks = (resolved.navlinks ?? resolved.NavLinks ?? []) as NavLinkItem[];
  const purityField = pickField<Field<string>>(resolved, ['globalpurity', 'GlobalPurity']);
  const capacityField = pickField<Field<number>>(resolved, [
    'operationalcapacity',
    'OperationalCapacity',
  ]);
  const threatField = pickField<Field<string>>(resolved, ['threatlevel', 'ThreatLevel']);
  const alertField = pickField<Field<string>>(resolved, [
    'securityalertmessage',
    'SecurityAlertMessage',
  ]);
  const burnLink = pickField<LinkField>(resolved, ['burnnoticelink', 'BurnNoticeLink']);
  const burnLabelField = pickField<Field<string>>(resolved, ['burnnoticelabel', 'BurnNoticeLabel']);

  const threat = normalizeThreatLevel(threatField?.value);
  const threatMeta = THREAT_CONFIG[threat];
  const capacity = Math.min(100, Math.max(0, Number(capacityField?.value ?? 0)));
  const burnLabel = burnLabelField?.value?.trim() || 'Activate Burn Notice';

  const rootClassName = ['component', 'header-block', styleParams].filter(Boolean).join(' ');
  const capacityStyle = { '--capacity-pct': `${capacity}%` } as CSSProperties;

  return (
    <div
      className={rootClassName}
      id={renderingId || undefined}
      data-threat={threat}
      style={capacityStyle}
    >
      <div className="component-content">
        <div className="header-block__bar">
          <div className="header-block__left">
            <PeriodicLogo text={logoField?.value} />

            <button
              type="button"
              className={`header-block__menu-toggle ${
                mobileOpen ? 'header-block__menu-toggle--open' : ''
              }`}
              aria-expanded={mobileOpen}
              aria-controls="header-block-nav"
              onClick={() => setMobileOpen((open) => !open)}
            >
              <span className="header-block__menu-icon" aria-hidden="true" />
              <span className="sr-only">{mobileOpen ? 'Close navigation' : 'Open navigation'}</span>
            </button>

            <nav
              id="header-block-nav"
              className={`header-block__nav ${mobileOpen ? 'header-block__nav--open' : ''}`}
              aria-label="Operational navigation"
            >
              <div className="header-block__nav-header">
                <button
                  type="button"
                  className="header-block__nav-close"
                  aria-label="Close navigation"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="header-block__nav-close-icon" aria-hidden="true" />
                </button>
              </div>

              <ul className="header-block__nav-list" role="list">
                {navLinks.map((item) => {
                  const itemFields = item.fields;
                  const label = pickField<Field<string>>(itemFields, ['navlabel', 'NavLabel']);
                  const link = pickField<LinkField>(itemFields, ['navlink', 'NavLink']);

                  if (!link?.value?.href && !sitecoreContext.pageEditing) {
                    return null;
                  }

                  return (
                    <li key={item.id} className="header-block__nav-item">
                      <JssLink
                        field={link!}
                        className="header-block__nav-link"
                        onClick={() => setMobileOpen(false)}
                      >
                        {label ? <Text field={label} /> : null}
                      </JssLink>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="header-block__center" aria-live="polite">
            {purityField && (
              <div className="header-block__purity">
                <span className="header-block__purity-label">Batch Purity</span>
                <span className="header-block__purity-value field-globalpurity">
                  <Text field={purityField} tag="span" />
                </span>
              </div>
            )}

            <div className="header-block__capacity">
              <span className="header-block__capacity-label">Operational Capacity</span>
              <div
                className="header-block__capacity-track"
                role="progressbar"
                aria-valuenow={capacity}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="header-block__capacity-fill" />
              </div>
              <span className="header-block__capacity-pct">{capacity}%</span>
            </div>
          </div>

          <div className="header-block__right">
            <div className={`header-block__threat ${threatMeta.modifier}`}>
              <span
                className={`header-block__threat-dot ${
                  threatMeta.pulse ? 'header-block__threat-dot--pulse' : ''
                }`}
                aria-hidden="true"
              />
              <div className="header-block__threat-copy">
                <span className="header-block__threat-label">{threatMeta.label}</span>
                {alertField && (
                  <span className="header-block__threat-message field-securityalertmessage">
                    <Text field={alertField} tag="span" />
                  </span>
                )}
              </div>
            </div>

            {burnLink && (
              <JssLink field={burnLink} className="header-block__burn-notice field-burnnoticelink">
                {burnLabelField ? <Text field={burnLabelField} /> : burnLabel}
              </JssLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
