import { Trans } from 'react-i18next';

import { View } from '@actual-app/components/view';

import {
  tideCard,
  tideCardTitle,
  tideColors,
  tideSectionLabel,
} from '#components/tide/tokens';
import { useTideMoney } from '#components/tide/useTideMoney';

export type Slice = { label: string; amount: number; color: string };

type OwnOweCardProps = {
  assets: Slice[];
  debts: Slice[];
};

export function Donut({ slices, total }: { slices: Slice[]; total: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <svg
      aria-hidden="true"
      width={140}
      height={140}
      viewBox="0 0 140 140"
      style={{ flexShrink: 0 }}
    >
      <circle
        cx={70}
        cy={70}
        r={radius}
        fill="none"
        stroke={tideColors.track}
        strokeWidth={20}
      />
      {slices.map(slice => {
        const length = total > 0 ? (slice.amount / total) * circumference : 0;
        const gap = slices.length > 1 ? 2 : 0;
        const element = (
          <circle
            key={slice.label}
            cx={70}
            cy={70}
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth={20}
            strokeDasharray={`${Math.max(0, length - gap)} ${circumference}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 70 70)"
          />
        );
        offset += length;
        return element;
      })}
    </svg>
  );
}

export function OwnOweCard({ assets, debts }: OwnOweCardProps) {
  const money = useTideMoney();
  const assetTotal = assets.reduce((sum, slice) => sum + slice.amount, 0);
  const debtTotal = debts.reduce((sum, slice) => sum + slice.amount, 0);
  const rowStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    fontSize: 14,
  };
  const dot = (color: string) => (
    <span
      aria-hidden="true"
      style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color }}
    />
  );

  return (
    <View style={{ ...tideCard, padding: '22px 24px', gap: 18 }}>
      <h2 style={tideCardTitle}>
        <Trans>What you own and owe</Trans>
      </h2>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
        }}
      >
        <Donut slices={assets} total={assetTotal} />
        <View style={{ gap: 4 }}>
          <span style={tideSectionLabel}>
            <Trans>Assets</Trans>
          </span>
          <span style={{ fontSize: 26, fontWeight: 800 }}>
            {money(assetTotal, { decimals: false })}
          </span>
        </View>
      </View>
      <View style={{ gap: 10 }}>
        {assets.map(slice => (
          <View key={slice.label} style={rowStyle}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                fontWeight: 700,
              }}
            >
              {dot(slice.color)}
              {slice.label}
            </View>
            <span>
              <strong>{money(slice.amount, { decimals: false })}</strong>
              <span style={{ color: tideColors.subtle }}>
                {` · ${assetTotal > 0 ? Math.round((slice.amount / assetTotal) * 100) : 0}%`}
              </span>
            </span>
          </View>
        ))}
      </View>

      {debts.length > 0 && (
        <View
          style={{
            gap: 12,
            paddingTop: 16,
            borderTop: `1px solid ${tideColors.rowDivider}`,
          }}
        >
          <View style={{ ...rowStyle, alignItems: 'baseline' }}>
            <span style={tideSectionLabel}>
              <Trans>Debts</Trans>
            </span>
            <span style={{ fontSize: 20, fontWeight: 800 }}>
              {money(debtTotal, { decimals: false })}
            </span>
          </View>
          <View
            aria-hidden="true"
            style={{
              flexDirection: 'row',
              gap: 2,
              height: 10,
              borderRadius: 5,
              overflow: 'hidden',
            }}
          >
            {debts.map(slice => (
              <View
                key={slice.label}
                style={{
                  width: `${debtTotal > 0 ? (slice.amount / debtTotal) * 100 : 0}%`,
                  backgroundColor: slice.color,
                }}
              />
            ))}
          </View>
          {debts.map(slice => (
            <View key={slice.label} style={rowStyle}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 700,
                }}
              >
                {dot(slice.color)}
                {slice.label}
              </View>
              <strong>{money(slice.amount, { decimals: false })}</strong>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
