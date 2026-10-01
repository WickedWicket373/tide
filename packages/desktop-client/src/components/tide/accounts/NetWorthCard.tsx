import type { CSSProperties } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { SvgTideArrowDown, SvgTideArrowUp } from '#components/tide/icons';
import {
  tideCard,
  tideColors,
  tideSectionLabel,
} from '#components/tide/tokens';
import { useTideMoney } from '#components/tide/useTideMoney';

import type { RangeId } from './useNetWorthData';

const WIDTH = 1000;
const HEIGHT = 240;
const RANGES: RangeId[] = ['1M', '3M', '6M', '1Y'];

function compactMoney(cents: number) {
  const dollars = cents / 100;
  const abs = Math.abs(dollars);
  const sign = dollars < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

type NetWorthCardProps = {
  days: string[];
  total: number[];
  range: RangeId;
  onRangeChange: (range: RangeId) => void;
};

export function NetWorthCard({
  days,
  total,
  range,
  onRangeChange,
}: NetWorthCardProps) {
  const { t } = useTranslation();
  const money = useTideMoney();
  const current = total[total.length - 1] ?? 0;
  const first = total[0] ?? 0;
  const change = current - first;
  const percent = first !== 0 ? (change / Math.abs(first)) * 100 : 0;

  const rawMin = Math.min(...total);
  const rawMax = Math.max(...total);
  const pad = (rawMax - rawMin) * 0.08 || Math.abs(rawMax) * 0.02 || 100;
  const min = rawMin - pad;
  const max = rawMax + pad;
  const toY = (value: number) =>
    HEIGHT - ((value - min) / (max - min)) * HEIGHT;
  const line = total
    .map((value, i) => {
      const x = (i / Math.max(1, total.length - 1)) * WIDTH;
      return `${i ? 'L' : 'M'}${x.toFixed(1)} ${toY(value).toFixed(1)}`;
    })
    .join(' ');
  const area = line ? `${line} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z` : '';
  const gridValues = [0, 1, 2, 3].map(i => max - ((max - min) * i) / 3);
  const tickDays = [0, 1, 2, 3].map(
    i => days[Math.round((i / 3) * (days.length - 1))],
  );
  const rangeLabel = {
    '1M': t('over 1 month'),
    '3M': t('over 3 months'),
    '6M': t('over 6 months'),
    '1Y': t('over 1 year'),
  }[range];

  const tabStyle = (isActive: boolean): CSSProperties => ({
    height: 32,
    minWidth: 48,
    borderRadius: 9,
    fontSize: 14,
    fontWeight: 700,
    color: isActive ? theme.pageText : tideColors.label,
    backgroundColor: isActive ? theme.cardBackground : 'transparent',
    boxShadow: isActive ? '0 1px 2px rgba(21, 32, 30, 0.08)' : 'none',
  });

  return (
    <View style={{ ...tideCard, padding: '22px 24px', gap: 14, flexShrink: 0 }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <View style={{ gap: 4 }}>
          <span style={tideSectionLabel}>
            <Trans>Net worth</Trans>
          </span>
          <span
            style={{
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            {money(current, { decimals: false })}
          </span>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
              color: tideColors.subtle,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 700,
                color: change >= 0 ? tideColors.tealDark : tideColors.over,
              }}
            >
              {change >= 0 ? (
                <SvgTideArrowUp width={14} height={14} />
              ) : (
                <SvgTideArrowDown width={14} height={14} />
              )}
              {first !== 0
                ? `${money(Math.abs(change), { decimals: false })} (${Math.abs(percent).toFixed(1)}%)`
                : money(Math.abs(change), { decimals: false })}
            </span>
            {rangeLabel}
          </View>
        </View>
        <View
          role="group"
          aria-label={t('Time range')}
          style={{
            flexDirection: 'row',
            alignSelf: 'flex-start',
            gap: 2,
            padding: 4,
            borderRadius: 12,
            backgroundColor: '#e8eeec',
          }}
        >
          {RANGES.map(item => (
            <Button
              key={item}
              variant="bare"
              aria-pressed={range === item}
              onPress={() => onRangeChange(item)}
              style={tabStyle(range === item)}
            >
              {item}
            </Button>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View
          aria-hidden="true"
          style={{
            justifyContent: 'space-between',
            fontSize: 12,
            fontWeight: 700,
            color: tideColors.subtle,
            padding: '0 0 0 0',
            height: HEIGHT,
          }}
        >
          {gridValues.map(value => (
            <span key={value}>{compactMoney(value)}</span>
          ))}
        </View>
        <svg
          role="img"
          aria-label={t('Net worth over time')}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          style={{ flex: 1, minWidth: 0, height: HEIGHT, display: 'block' }}
        >
          {[1, 2].map(i => (
            <path
              key={i}
              d={`M0 ${(HEIGHT * i) / 3}H${WIDTH}`}
              stroke="#edf1f0"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={area} fill={tideColors.mint} fillOpacity={0.16} />
          <path
            d={line}
            fill="none"
            stroke={tideColors.teal}
            strokeWidth={2.4}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </View>
      <View
        aria-hidden="true"
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingLeft: 60,
          fontSize: 12,
          fontWeight: 700,
          color: tideColors.subtle,
        }}
      >
        {tickDays.map((day, i) => (
          <span key={i}>{day ? monthUtils.format(day, 'MMM d') : ''}</span>
        ))}
      </View>
    </View>
  );
}
