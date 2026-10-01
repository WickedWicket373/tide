import type { CSSProperties } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { View } from '@actual-app/components/view';

import {
  tideCard,
  tideCardTitle,
  tideColors,
  tidePill,
} from '#components/tide/tokens';
import { useTideMoney } from '#components/tide/useTideMoney';

import { assetClass } from './useHoldings';
import type { AssetClass, Holding } from './useHoldings';

const SYMBOL_TONES: Record<AssetClass, [string, string]> = {
  us: ['#e1f4ee', '#0a5f57'],
  intl: ['#dff6ef', '#11806a'],
  bonds: ['#e6ecf8', '#2f4f8f'],
  cash: ['#f7efd9', '#7a5c14'],
  other: ['#efe9fb', '#5b3fb0'],
};

const COLUMNS =
  'minmax(0, 2.2fr) minmax(0, 1fr) minmax(70px, 0.6fr) minmax(80px, 0.7fr) minmax(100px, 0.8fr) minmax(110px, 0.9fr) minmax(120px, 1fr)';

const headerCell: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: tideColors.label,
};

const numberCell: CSSProperties = {
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
};

type HoldingsTableProps = {
  holdings: Holding[];
  totalValue: number;
};

export function HoldingsTable({ holdings, totalValue }: HoldingsTableProps) {
  const { t } = useTranslation();
  const money = useTideMoney();
  const sorted = [...holdings].sort((a, b) => b.marketValue - a.marketValue);

  return (
    <View style={{ ...tideCard, overflow: 'hidden', flexShrink: 0 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          padding: '18px 22px',
        }}
      >
        <h2 style={tideCardTitle}>
          <Trans>Holdings</Trans>
        </h2>
        <span
          style={{ fontSize: 13, fontWeight: 700, color: tideColors.subtle }}
        >
          {t('{{count}} holdings', { count: holdings.length })}
        </span>
      </View>
      <View style={{ overflowX: 'auto' }}>
        <View role="table" aria-label={t('Holdings')} style={{ minWidth: 820 }}>
          <View
            role="row"
            style={{
              display: 'grid',
              gridTemplateColumns: COLUMNS,
              columnGap: 14,
              padding: '10px 22px',
              backgroundColor: tideColors.headerBand,
              borderTop: `1px solid ${tideColors.rowDivider}`,
              borderBottom: `1px solid ${tideColors.rowDivider}`,
            }}
          >
            <span role="columnheader" style={headerCell}>
              <Trans>Holding</Trans>
            </span>
            <span role="columnheader" style={headerCell}>
              <Trans>Account</Trans>
            </span>
            <span role="columnheader" style={{ ...headerCell, ...numberCell }}>
              <Trans>Shares</Trans>
            </span>
            <span role="columnheader" style={{ ...headerCell, ...numberCell }}>
              <Trans>Price</Trans>
            </span>
            <span role="columnheader" style={{ ...headerCell, ...numberCell }}>
              <Trans>Value</Trans>
            </span>
            <span role="columnheader" style={{ ...headerCell, ...numberCell }}>
              <Trans>Total gain</Trans>
            </span>
            <span role="columnheader" style={{ ...headerCell, ...numberCell }}>
              <Trans>Weight</Trans>
            </span>
          </View>
          {sorted.map(holding => {
            const kind = assetClass(holding);
            const [bg, fg] = SYMBOL_TONES[kind];
            const isCash = kind === 'cash';
            const price =
              holding.shares && holding.shares > 0 && !isCash
                ? holding.marketValue / holding.shares
                : null;
            const gain =
              holding.costBasis !== null
                ? holding.marketValue - holding.costBasis
                : null;
            const weight =
              totalValue > 0 ? (holding.marketValue / totalValue) * 100 : 0;
            return (
              <View
                key={holding.id}
                role="row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: COLUMNS,
                  columnGap: 14,
                  alignItems: 'center',
                  padding: '14px 22px',
                  borderBottom: `1px solid ${tideColors.rowDivider}`,
                  fontSize: 14,
                }}
              >
                <View
                  role="cell"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    minWidth: 0,
                  }}
                >
                  <span style={{ ...tidePill(bg, fg), borderRadius: 8 }}>
                    {holding.symbol || '—'}
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {holding.description}
                  </span>
                </View>
                <span
                  role="cell"
                  style={{
                    color: tideColors.subtle,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {holding.accountName}
                </span>
                <span role="cell" style={numberCell}>
                  {isCash || holding.shares === null
                    ? '—'
                    : holding.shares.toLocaleString(undefined, {
                        maximumFractionDigits: 3,
                      })}
                </span>
                <span role="cell" style={numberCell}>
                  {price === null ? '—' : money(Math.round(price))}
                </span>
                <span role="cell" style={{ ...numberCell, fontWeight: 700 }}>
                  {money(holding.marketValue)}
                </span>
                <span
                  role="cell"
                  style={{
                    ...numberCell,
                    fontWeight: 700,
                    color:
                      gain === null
                        ? tideColors.lastPeriod
                        : gain >= 0
                          ? tideColors.income
                          : tideColors.over,
                  }}
                >
                  {gain === null || holding.costBasis === null
                    ? '—'
                    : `${money(gain, { decimals: false, sign: true })} (${(
                        (gain / holding.costBasis) *
                        100
                      ).toFixed(1)}%)`}
                </span>
                <View
                  role="cell"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 10,
                  }}
                >
                  <View
                    aria-hidden="true"
                    style={{
                      width: 70,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: tideColors.track,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: `${weight}%`,
                        height: 6,
                        backgroundColor: tideColors.mintStrong,
                      }}
                    />
                  </View>
                  <span
                    style={{
                      ...numberCell,
                      minWidth: 36,
                      color: tideColors.subtle,
                    }}
                  >
                    {`${Math.round(weight)}%`}
                  </span>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
