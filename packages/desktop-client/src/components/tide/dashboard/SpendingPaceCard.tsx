import { Trans, useTranslation } from 'react-i18next';

import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { SvgTideCheck } from '#components/tide/icons';
import {
  tideCard,
  tideCardTitle,
  tideColors,
  tidePill,
} from '#components/tide/tokens';
import { useTideMoney } from '#components/tide/useTideMoney';

const WIDTH = 600;
const HEIGHT = 210;
const PAD = 8;

function toPath(values: number[], days: number, min: number, max: number) {
  return values
    .map((value, i) => {
      const x = days > 1 ? (i / (days - 1)) * WIDTH : 0;
      const y =
        HEIGHT - PAD - ((value - min) / (max - min || 1)) * (HEIGHT - PAD * 2);
      return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

type SpendingPaceCardProps = {
  month: string;
  lastMonth: string;
  thisMonth: number[];
  lastMonthValues: number[];
  spentSoFar: number;
  lastMonthAtSameDay: number;
  lastMonthTotal: number;
};

export function SpendingPaceCard({
  month,
  lastMonth,
  thisMonth,
  lastMonthValues,
  spentSoFar,
  lastMonthAtSameDay,
  lastMonthTotal,
}: SpendingPaceCardProps) {
  const { t } = useTranslation();
  const money = useTideMoney();
  const days = monthUtils.getDay(monthUtils.lastDayOfMonth(month));
  const lastMonthName = monthUtils.format(lastMonth, 'MMMM');
  const monthName = monthUtils.format(month, 'MMMM');

  // Zoom the y-axis so the lines separate instead of hugging the bottom.
  const all = [...thisMonth, ...lastMonthValues];
  const max = Math.max(1, ...all) * 1.04;
  const min = Math.min(...all.filter(v => v > 0), max) * 0.85;

  const thisPath = thisMonth.length ? toPath(thisMonth, days, min, max) : '';
  const lastPath = lastMonthValues.length
    ? toPath(lastMonthValues.slice(0, days), days, min, max)
    : '';
  const areaPath = thisPath
    ? `${thisPath} L${(((thisMonth.length - 1) / (days - 1)) * WIDTH).toFixed(1)} ${HEIGHT} L0 ${HEIGHT} Z`
    : '';

  const difference = lastMonthAtSameDay - spentSoFar;
  const ticks = [1, 8, 15, 22, days].map(
    day => `${monthUtils.format(month, 'MMM')} ${day}`,
  );

  return (
    <View
      style={{
        ...tideCard,
        flex: '3 1 480px',
        minWidth: 0,
        padding: '22px 24px',
        gap: 14,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <View style={{ gap: 4 }}>
          <h2 style={tideCardTitle}>
            <Trans>Spending pace</Trans>
          </h2>
          <View style={{ fontSize: 14, color: tideColors.subtle }}>
            {t('Running total this month compared with {{month}}', {
              month: lastMonthName,
            })}
          </View>
        </View>
        {difference >= 0 ? (
          <View style={tidePill(tideColors.goodPillBg, tideColors.tealDark)}>
            <SvgTideCheck width={15} height={15} />
            {t('{{amount}} under {{month}}', {
              amount: money(difference, { decimals: false }),
              month: lastMonthName,
            })}
          </View>
        ) : (
          <View
            style={tidePill(tideColors.overPillBg, tideColors.overPillText)}
          >
            {t('{{amount}} over {{month}}', {
              amount: money(-difference, { decimals: false }),
              month: lastMonthName,
            })}
          </View>
        )}
      </View>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={t('Spending this month compared with {{month}}', {
          month: lastMonthName,
        })}
        style={{
          width: '100%',
          flex: '1 1 210px',
          minHeight: 210,
          height: 'auto',
          display: 'block',
        }}
      >
        <path
          d={`M0 ${HEIGHT * 0.25}H${WIDTH}M0 ${HEIGHT * 0.5}H${WIDTH}M0 ${HEIGHT * 0.75}H${WIDTH}`}
          stroke="#edf1f0"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        {lastPath && (
          <path
            d={lastPath}
            fill="none"
            stroke={tideColors.lastPeriod}
            strokeWidth={2}
            strokeDasharray="6 6"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {areaPath && (
          <path d={areaPath} fill={tideColors.mint} fillOpacity={0.16} />
        )}
        {thisPath && (
          <path
            d={thisPath}
            fill="none"
            stroke={tideColors.teal}
            strokeWidth={2.6}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          fontSize: 12,
          fontWeight: 600,
          color: tideColors.subtle,
        }}
      >
        {ticks.map(tick => (
          <span key={tick}>{tick}</span>
        ))}
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 20,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 18,
              height: 3,
              borderRadius: 2,
              backgroundColor: tideColors.teal,
            }}
          />
          {`${monthName} · ${money(spentSoFar, { decimals: false })}`}
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            color: tideColors.subtle,
          }}
        >
          <span
            style={{
              width: 18,
              height: 0,
              borderTop: `2px dashed ${tideColors.lastPeriod}`,
            }}
          />
          {`${lastMonthName} · ${money(lastMonthTotal, { decimals: false })}`}
        </View>
      </View>
    </View>
  );
}
