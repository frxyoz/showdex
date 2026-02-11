import * as React from 'react';
import cx from 'classnames';
import { PokeType } from '@showdex/components/app';
import { useCalcdexContext } from '@showdex/components/calc';
import { BaseButton } from '@showdex/components/ui';
import { useRandomBattlesValidation } from '@showdex/utils/hooks';
import styles from './Calcdex.module.scss';

const parseTypeFromCheckId = (checkId: string): Showdown.TypeName | null => {
  const typeMatch = checkId.match(/(?:type-count|type-weak|type-double-weak)-(.+)$/);
  if (!typeMatch) return null;

  const typeId = typeMatch[1];
  // Map the type names directly since they're already normalized
  const typeNameMap: Record<string, Showdown.TypeName> = {
    normal: 'Normal',
    fighting: 'Fighting',
    flying: 'Flying',
    poison: 'Poison',
    ground: 'Ground',
    rock: 'Rock',
    bug: 'Bug',
    ghost: 'Ghost',
    steel: 'Steel',
    fire: 'Fire',
    water: 'Water',
    grass: 'Grass',
    electric: 'Electric',
    psychic: 'Psychic',
    ice: 'Ice',
    dragon: 'Dragon',
    dark: 'Dark',
    fairy: 'Fairy',
  };

  return typeNameMap[typeId] || null;
};

export const RandomBattleValidationPanel = (): JSX.Element => {
  const { state } = useCalcdexContext();
  const validation = useRandomBattlesValidation();
  const isPanelMode = state?.renderMode === 'panel';
  const [collapsed, setCollapsed] = React.useState(false);

  if (!validation?.active || !validation?.checks?.length) {
    return null;
  }

  const typeChecks = validation.checks.filter((c) => c.group === 'type-count');
  const weakChecks = validation.checks.filter((c) => c.group === 'type-weakness');
  const doubleWeakChecks = validation.checks.filter((c) => c.group === 'type-double-weakness');
  const capChecks = validation.checks.filter((c) => ![
    'type-count',
    'type-weakness',
    'type-double-weakness',
  ].includes(c.group));

  const getCapLabel = (check: typeof capChecks[number]): string => {
    if (check.id === 'species-clause') return 'SC';
    if (check.id === 'tera-blast-users') return 'TB';
    if (check.id === 'freeze-dry-weakness') return 'FD';

    if (/level\s*100/i.test(check.label)) return 'L100';
    if (/tera/i.test(check.label)) return 'Tera';
    if (/species/i.test(check.label)) return 'SC';

    const parts = check.label.split(/\s+/).filter(Boolean);
    const abbr = parts.map((part) => (part.match(/^\d+$/) ? part : part[0])).join('');

    return abbr.toUpperCase().slice(0, 5) || check.label.slice(0, 5);
  };

  const showBody = !isPanelMode || !collapsed;

  return (
    <section className={styles.validationPanel} aria-label="Random Battles validation">
      <header className={styles.validationHeader}>
        <div className={styles.validationTitle}>Random Battles</div>
        {isPanelMode && (
          <BaseButton
            className={styles.validationToggle}
            aria-label={collapsed ? 'Expand Random Battles validation' : 'Collapse Random Battles validation'}
            aria-expanded={!collapsed}
            onPress={() => setCollapsed((prev) => !prev)}
          >
            <span className={styles.validationToggleLabel}>{collapsed ? 'Show' : 'Hide'}</span>
            <i className={cx('fa', collapsed ? 'fa-chevron-down' : 'fa-chevron-up')} aria-hidden="true" />
          </BaseButton>
        )}
      </header>

      {showBody && (
        <div className={styles.validationBody}>
          {capChecks.length > 0 && (
            <div className={styles.validationTypeWindow}>
              <div className={styles.validationTypeWindowLabel}>Caps</div>
              <div className={styles.validationTypeGrid}>
                {capChecks.map((check) => (
                  <div
                    key={check.id}
                    className={cx(
                      styles.validationTypeIcon,
                      check.ok ? styles.validationPass : styles.validationFail,
                    )}
                    title={`${check.label}: ${check.count}/${check.limit}`}
                  >
                    <span className={styles.validationCapLabel}>{getCapLabel(check)}</span>
                    <span className={styles.validationTypeCount}>{check.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {typeChecks.length > 0 && (
            <div className={styles.validationTypeWindow}>
              <div className={styles.validationTypeWindowLabel}>Types</div>
              <div className={styles.validationTypeGrid}>
                {typeChecks.map((check) => {
                  const typeName = parseTypeFromCheckId(check.id);

                  return (
                    <div
                      key={check.id}
                      className={cx(
                        styles.validationTypeIcon,
                        check.ok ? styles.validationPass : styles.validationFail,
                      )}
                      title={`${check.label}: ${check.count}/${check.limit}`}
                    >
                      {typeName && <PokeType type={typeName} containerSize="xs" highlight={false} />}
                      <span className={styles.validationTypeCount}>{check.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(weakChecks.length > 0 || doubleWeakChecks.length > 0) && (
            <div className={styles.validationTypeWindow}>
              <div className={styles.validationTypeWindowLabel}>Weaknesses</div>
              <div className={styles.validationTypeGrid}>
                {doubleWeakChecks.map((check) => {
                  const typeName = parseTypeFromCheckId(check.id);

                  return (
                    <div
                      key={check.id}
                      className={cx(
                        styles.validationTypeIcon,
                        check.ok ? styles.validationPass : styles.validationFail,
                        styles.validationDouble,
                      )}
                      title={`2x ${check.label}: ${check.count}/${check.limit}`}
                    >
                      {typeName && <PokeType type={typeName} containerSize="xs" highlight={false} />}
                      <span className={styles.validationTypeCount}>{check.count}</span>
                      <span className={styles.validationDoubleMarker}>2×</span>
                    </div>
                  );
                })}
                {weakChecks.map((check) => {
                  const typeName = parseTypeFromCheckId(check.id);

                  return (
                    <div
                      key={check.id}
                      className={cx(
                        styles.validationTypeIcon,
                        check.ok ? styles.validationPass : styles.validationFail,
                      )}
                      title={`${check.label}: ${check.count}/${check.limit}`}
                    >
                      {typeName && <PokeType type={typeName} containerSize="xs" highlight={false} />}
                      <span className={styles.validationTypeCount}>{check.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
