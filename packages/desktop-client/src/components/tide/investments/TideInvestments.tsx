import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { Donut } from '#components/tide/accounts/OwnOweCard';
import { useNetWorthData } from '#components/tide/accounts/useNetWorthData';
import type { RangeId } from '#components/tide/accounts/useNetWorthData';
import { SvgTideRefresh } from '#components/tide/icons';
import { TidePage } from '#components/tide/TidePage';
import {
  tideCard,
  tideCardTitle,
  tideColors,
  tideSectionLabel,
} from '#components/tide/tokens';
import { useTideMoney } from '#components/tide/useTideMoney';

import { HoldingsTable } from './HoldingsTable';
import { assetClass, useHoldings } from './useHoldings';
import type { AssetClass } from './useHoldings';

const CLASS_COLORS: Record<AssetClass, string> = {
  us: '#0e7c72',
  intl: '#5ed3b5',
  bonds: '#8fa8d6',
  cash: '#d8c08c',
  other: '#b6a2e0',
};

const RANGES: RangeId[] = ['1M', '6M', '1Y'];

function timeAgo(ms: number, t: ReturnType<typeof useTranslation>['t']) {
  const minutes = Math.round((Date.now() - ms) / 60000);
  if (minutes < 2) return t('just now');
  if (minutes < 60) return t('{{count}} min ago', { count: minutes });
  return t('{{count}} hours ago', { count: Math.round(minutes / 60) });
}

export function TideInvestments() {
  const { t } = useTranslation();
  const money = useTideMoney();
  const { accounts, fetchedAt, status, refresh } = useHoldings();
  const [accountTab, setAccountTab] = useState('all');
  const [range, setRange] = useState<RangeId>('1Y');
  const history = useNetWorthData(range);

  const shownAccounts = accounts.filter(
    account => accountTab === 'all' || account.id === accountTab,
  );
  const holdings = shownAccounts.flatMap(account => account.holdings);
  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  const withCost = holdings.filter(h => h.costBasis !== null);
  const costBasis = withCost.reduce((sum, h) => sum + (h.costBasis ?? 0), 0);
  const gain = withCost.reduce((sum, h) => sum + h.marketValue, 0) - costBasis;
  const orgs = [...new Set(accounts.map(account => account.org))].filter(
    Boolean,
  );

  // Value over time comes from the Actual accounts linked to these
  // investment accounts (their balance history).
  const linkedIds = new Set(shownAccounts.map(account => account.id));
  const linked = history.accounts.filter(item =>
    linkedIds.has(item.account.account_id ?? ''),
  );
  const series = history.days.map((_, i) =>
    linked.reduce((sum, item) => sum + item.series[i], 0),
  );

  const classLabels: Record<AssetClass, string> = {
    us: t('U.S. stocks'),
    intl: t('International stocks'),
    bonds: t('Bonds'),
    cash: t('Cash'),
    other: t('Other'),
  };
  const slices = (Object.keys(CLASS_COLORS) as AssetClass[])
    .map(id => ({
      label: classLabels[id],
      color: CLASS_COLORS[id],
      amount: holdings
        .filter(h => assetClass(h) === id)
        .reduce((sum, h) => sum + h.marketValue, 0),
    }))
    .filter(slice => slice.amount > 0);

  const pillTab = (isActive: boolean): CSSProperties => ({
    height: 32,
    padding: '0 12px',
    borderRadius: 9,
    fontSize: 14,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    color: isActive ? theme.pageText : tideColors.label,
    backgroundColor: isActive ? theme.cardBackground : 'transparent',
    boxShadow: isActive ? '0 1px 2px rgba(21, 32, 30, 0.08)' : 'none',
  });
  const card: CSSProperties = { ...tideCard, padding: '20px 22px', gap: 6 };

  const subtitle = [
    orgs.join(', '),
    fetchedAt ? t('updated {{when}}', { when: timeAgo(fetchedAt, t) }) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  if (accounts.length === 0) {
    return (
      <TidePage title={t('Investments')}>
        <View
          style={{
            ...tideCard,
            padding: '48px 24px',
            alignItems: 'center',
            textAlign: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 800 }}>
            {status === 'loading' ? (
              <Trans>Loading your holdings…</Trans>
            ) : status === 'no-server' ? (
              <Trans>Investments need the Tide server</Trans>
            ) : status === 'error' ? (
              <Trans>Couldn't reach your bank connection</Trans>
            ) : (
              <Trans>No investment holdings yet</Trans>
            )}
          </span>
          <span
            style={{ fontSize: 14, color: tideColors.subtle, maxWidth: 460 }}
          >
            <Trans>
              Holdings come from investment accounts linked through SimpleFIN,
              like Fidelity. They show up here after the bank reports them.
            </Trans>
          </span>
          {status !== 'no-server' && (
            <Button
              variant="normal"
              onPress={() => void refresh()}
              isDisabled={status === 'loading'}
              style={{ borderRadius: 10, gap: 8, fontWeight: 600 }}
            >
              <SvgTideRefresh width={16} height={16} />
              <Trans>Check again</Trans>
            </Button>
          )}
        </View>
      </TidePage>
    );
  }

  return (
    <TidePage
      title={t('Investments')}
      subtitle={subtitle}
      actions={
        <>
          <View
            role="group"
            aria-label={t('Account')}
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 2,
              padding: 4,
              borderRadius: 12,
              backgroundColor: '#e8eeec',
            }}
          >
            <Button
              variant="bare"
              aria-pressed={accountTab === 'all'}
              onPress={() => setAccountTab('all')}
              style={pillTab(accountTab === 'all')}
            >
              <Trans>All accounts</Trans>
            </Button>
            {accounts.map(account => (
              <Button
                key={account.id}
                variant="bare"
                aria-pressed={accountTab === account.id}
                onPress={() => setAccountTab(account.id)}
                style={pillTab(accountTab === account.id)}
              >
                {account.name}
              </Button>
            ))}
          </View>
          <Button
            variant="normal"
            aria-label={t('Refresh holdings')}
            onPress={() => void refresh()}
            isDisabled={status === 'loading'}
            style={{ height: 40, width: 40, borderRadius: 10 }}
          >
            <SvgTideRefresh width={17} height={17} />
          </Button>
        </>
      }
    >
      <View
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
          gap: 16,
        }}
      >
        <View style={card}>
          <span
            style={{ fontSize: 13, fontWeight: 600, color: tideColors.subtle }}
          >
            <Trans>Total value</Trans>
          </span>
          <span style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>
            {money(totalValue)}
          </span>
          <span
            style={{ fontSize: 13, fontWeight: 600, color: tideColors.subtle }}
          >
            {t('{{count}} holdings', { count: holdings.length })}
          </span>
        </View>
        <View style={card}>
          <span
            style={{ fontSize: 13, fontWeight: 600, color: tideColors.subtle }}
          >
            <Trans>Total gain</Trans>
          </span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 800,
              lineHeight: 1.2,
              color:
                withCost.length === 0
                  ? tideColors.lastPeriod
                  : gain >= 0
                    ? tideColors.income
                    : tideColors.over,
            }}
          >
            {withCost.length === 0 ? '—' : money(gain, { sign: true })}
          </span>
          <span
            style={{ fontSize: 13, fontWeight: 600, color: tideColors.subtle }}
          >
            {withCost.length === 0
              ? t("Your bank doesn't report what you paid")
              : t('{{percent}}% on what you put in', {
                  percent: ((gain / Math.max(1, costBasis)) * 100).toFixed(1),
                })}
          </span>
        </View>
        <View style={card}>
          <span
            style={{ fontSize: 13, fontWeight: 600, color: tideColors.subtle }}
          >
            <Trans>Amount you put in</Trans>
          </span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 800,
              lineHeight: 1.2,
              color: withCost.length === 0 ? tideColors.lastPeriod : undefined,
            }}
          >
            {withCost.length === 0 ? '—' : money(costBasis)}
          </span>
          <span
            style={{ fontSize: 13, fontWeight: 600, color: tideColors.subtle }}
          >
            {t('Cost basis across {{count}} holdings', {
              count: withCost.length,
            })}
          </span>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 20,
          alignItems: 'stretch',
        }}
      >
        <PerformanceCard
          values={series}
          hasHistory={linked.length > 0}
          range={range}
          onRangeChange={setRange}
        />
        <View
          style={{
            ...tideCard,
            flex: '1 1 320px',
            minWidth: 0,
            padding: '22px 24px',
            gap: 16,
          }}
        >
          <h2 style={tideCardTitle}>
            <Trans>Allocation</Trans>
          </h2>
          <View style={{ alignItems: 'center' }}>
            <Donut slices={slices} total={totalValue} />
          </View>
          <View style={{ gap: 10 }}>
            {slices.map(slice => (
              <View
                key={slice.label}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  fontSize: 14,
                  gap: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 700,
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      backgroundColor: slice.color,
                    }}
                  />
                  {slice.label}
                </View>
                <span>
                  <strong>
                    {`${totalValue > 0 ? Math.round((slice.amount / totalValue) * 100) : 0}%`}
                  </strong>
                  <span style={{ color: tideColors.subtle }}>
                    {` · ${money(slice.amount, { decimals: false })}`}
                  </span>
                </span>
              </View>
            ))}
          </View>
        </View>
      </View>

      <HoldingsTable holdings={holdings} totalValue={totalValue} />

      <span style={{ fontSize: 13, color: tideColors.subtle }}>
        <Trans>
          Holdings and prices come from your bank connection and refresh a few
          times a day. Asset classes are a best guess from each fund's name.
        </Trans>
      </span>
    </TidePage>
  );
}

type PerformanceCardProps = {
  values: number[];
  hasHistory: boolean;
  range: RangeId;
  onRangeChange: (range: RangeId) => void;
};

function PerformanceCard({
  values,
  hasHistory,
  range,
  onRangeChange,
}: PerformanceCardProps) {
  const { t } = useTranslation();
  const width = 700;
  const height = 220;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || Math.abs(max) * 0.1 || 1;
  const line = values
    .map((value, i) => {
      const x = (i / Math.max(1, values.length - 1)) * width;
      const y = height - 8 - ((value - min) / span) * (height - 16);
      return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <View
      style={{
        ...tideCard,
        flex: '2 1 480px',
        minWidth: 0,
        padding: '22px 24px',
        gap: 14,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={tideCardTitle}>
          <Trans>Performance</Trans>
        </h2>
        <View
          role="group"
          aria-label={t('Time range')}
          style={{
            flexDirection: 'row',
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
              style={{
                height: 30,
                minWidth: 44,
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 700,
                color: range === item ? theme.pageText : tideColors.label,
                backgroundColor:
                  range === item ? theme.cardBackground : 'transparent',
              }}
            >
              {item}
            </Button>
          ))}
        </View>
      </View>
      {hasHistory ? (
        <svg
          role="img"
          aria-label={t('Investment value over time')}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{ width: '100%', height, display: 'block' }}
        >
          <path
            d={`${line} L${width} ${height} L0 ${height} Z`}
            fill={tideColors.mint}
            fillOpacity={0.16}
          />
          <path
            d={line}
            fill="none"
            stroke={tideColors.teal}
            strokeWidth={2.4}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : (
        <View
          style={{
            height,
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontSize: 14,
            color: tideColors.subtle,
            padding: 20,
          }}
        >
          <Trans>
            Link these investment accounts in Tide's bank sync to see their
            value over time.
          </Trans>
        </View>
      )}
      <span style={tideSectionLabel}>
        <Trans>Market value</Trans>
      </span>
    </View>
  );
}
