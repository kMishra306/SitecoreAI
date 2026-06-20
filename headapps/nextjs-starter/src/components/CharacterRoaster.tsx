import { JSX } from 'react';
import {
  Field,
  ImageField,
  NextImage as JssImage,
  RichText as JssRichText,
  Text,
  useSitecoreContext,
} from '@sitecore-jss/sitecore-jss-nextjs';

interface CharacterFields {
  charactername: Field<string>;
  alias: Field<string>;
  characterimage: ImageField;
  bio: Field<string>;
  status: Field<string>;
}

interface CharacterItem {
  id: string;
  name?: string;
  displayName?: string;
  fields: CharacterFields & Record<string, unknown>;
}

interface Fields {
  Heading: Field<string>;
  Characters: CharacterItem[];
}

type CharacterRoasterProps = {
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

const resolveCharacters = (fields: Fields & Record<string, unknown>): CharacterItem[] => {
  const characters = fields.Characters ?? fields.characters;
  return Array.isArray(characters) ? characters : [];
};

const resolveHeadingField = (fields: Fields & Record<string, unknown>): Field<string> | undefined =>
  pickField<Field<string>>(fields, ['Heading', 'heading']);

const CharacterRoasterEmpty = (props: CharacterRoasterProps): JSX.Element => (
  <div className={`component character-roster-block ${props?.params?.styles ?? ''}`.trimEnd()}>
    <div className="component-content">
      <span className="is-empty-hint">Character Roster</span>
    </div>
  </div>
);

/**
 * Name-Value list fields often arrive as `Status=Active` from Layout Service.
 */
const parseStatusValue = (raw: string | undefined): string => {
  if (!raw?.trim()) {
    return 'Unknown';
  }

  const trimmed = raw.trim();

  if (trimmed.includes('=')) {
    const value = trimmed.split('=').pop()?.trim();
    return value || trimmed;
  }

  const params = new URLSearchParams(trimmed.startsWith('?') ? trimmed.slice(1) : trimmed);
  return params.get('Status') || params.get('status') || trimmed;
};

const getStatusModifier = (status: string): string => {
  const normalized = status.toLowerCase();

  if (normalized === 'active') {
    return 'character-roster-block__status--active';
  }

  if (normalized === 'deceased') {
    return 'character-roster-block__status--deceased';
  }

  return 'character-roster-block__status--unknown';
};

/** Request a larger media variant from Sitecore for sharper display in wide cards. */
const getWideImageField = (imageField?: ImageField): ImageField | undefined => {
  if (!imageField?.value?.src) {
    return imageField;
  }

  try {
    const url = new URL(imageField.value.src);
    url.searchParams.set('w', '640');
    url.searchParams.set('h', '720');

    return {
      ...imageField,
      value: {
        ...imageField.value,
        src: url.toString(),
      },
    };
  } catch {
    return imageField;
  }
};

export const Default = (props: CharacterRoasterProps): JSX.Element => {
  const { fields, params } = props;
  const { sitecoreContext } = useSitecoreContext();
  const renderingId = params?.RenderingIdentifier;
  const styleParams = params?.styles ?? '';

  if (!fields) {
    return <CharacterRoasterEmpty {...props} />;
  }

  const resolvedFields = fields as Fields & Record<string, unknown>;
  const headingField = resolveHeadingField(resolvedFields);
  const characters = resolveCharacters(resolvedFields);
  const isEditing = sitecoreContext.pageEditing;

  if (!characters.length && !isEditing) {
    return <></>;
  }

  const rootClassName = ['component', 'character-roster-block', styleParams]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      className={rootClassName}
      id={renderingId || undefined}
      aria-labelledby="character-roster-heading"
    >
      <div className="component-content">
        <div className="character-roster-block__inner">
          {headingField && (
            <h2
              id="character-roster-heading"
              className="character-roster-block__heading field-heading"
            >
              <Text field={headingField} />
            </h2>
          )}

          {!characters.length ? (
            <p className="character-roster-block__empty-hint is-empty-hint">
              Select characters in the multilist field to populate this roster.
            </p>
          ) : (
            <ul className="character-roster-block__list" role="list">
              {characters.map((character) => {
                const characterFields = character.fields;
                const nameField = pickField<Field<string>>(characterFields, [
                  'charactername',
                  'CharacterName',
                ]);
                const aliasField = pickField<Field<string>>(characterFields, ['alias', 'Alias']);
                const imageField = getWideImageField(
                  pickField<ImageField>(characterFields, ['characterimage', 'CharacterImage'])
                );
                const bioField = pickField<Field<string>>(characterFields, ['bio', 'Bio']);
                const statusField = pickField<Field<string>>(characterFields, ['status', 'Status']);
                const statusLabel = parseStatusValue(statusField?.value);
                const statusClass = getStatusModifier(statusLabel);

                return (
                  <li key={character.id} className="character-roster-block__card">
                    <article className="character-roster-block__card-inner">
                      <div className="character-roster-block__media field-characterimage">
                        {imageField ? (
                          <JssImage field={imageField} className="character-roster-block__image" />
                        ) : (
                          <div
                            className="character-roster-block__image-placeholder"
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      <div className="character-roster-block__body">
                        {nameField && (
                          <h3 className="character-roster-block__name field-charactername">
                            <Text field={nameField} />
                          </h3>
                        )}

                        {aliasField && (
                          <p className="character-roster-block__alias field-alias">
                            Alias: <Text field={aliasField} />
                          </p>
                        )}

                        <span className={`character-roster-block__status ${statusClass}`}>
                          {statusLabel}
                        </span>

                        {bioField && (
                          <div className="character-roster-block__bio field-bio">
                            <JssRichText field={bioField} />
                          </div>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};
