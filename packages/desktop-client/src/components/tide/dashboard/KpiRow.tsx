import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { SvgTideArrowDown, SvgTideArrowUp } from '#components/tide/icons';
import { tideCard, tideColors } from '#components/tide/tokens';
import { useTideMoney } from '#components/tide/useTideMoney';
import { SheetNameProvider } from '#hooks/useSheetName';
import { useSheetValue } from '#hooks/useSheetValue';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { envelopeBudget, trackingBudget } from '#spreadsheet/bindings';

type KpiProps = {
  label: ReactNode;
  value: ReactNode;
  sub: ReactNode;
  subColor?: string;
};

function Kpi({ label, value, sub, subColor }: KpiProps) {
  return (
    <View style={{ ...tideCard, flexShrink: 0, padding: '20px 22px', gap: 6 }}>
      <View style={{ fontSize: 13, fontWeight: 600, color: tideColors.subtle }}>
        {label}
      </View>
      <View
        style={{
          fontSize: 28,
          lineHeight: 1.2,
          fontWeight: 800,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </View>
      <View
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: subColor ?? tideColors.subtle,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {sub}
      </View>
    </View>
  );
}

function EnvelopeLeftToBudget() {
  const { t } = useTranslation();
  const money = useTideMoney();
  const value = Number(
    useSheetValue<'envelope-budget', 'to-budget'>(envelopeBudget.toBudget) ?? 0,
  );
  return (
    <Kpi
      label={t('Left to budget')}
      value={money(value, { decimals: false })}
      sub={
        value === 0
          ? t('Every dollar has a job')
          : value < 0
            ? t('Overbudgeted')
            : t('Ready to assign')
      }
      subColor={value < 0 ? tideColors.over : undefined}
    />
  );
}

function TrackingBudgetLeft() {
  const { t } = useTranslation();
  const money = useTideMoney();
  const value = Number(
    useSheetValue<'tracking-budget', 'total-leftover'>(
      trackingBudget.totalLeftover,
    ) ?? 0,
  );
  return (
    <Kpi
      label={t('Budget left')}
      value={money(value, { decimals: false })}
      sub={t('Across all categories')}
      subColor={value < 0 ? tideColors.over : undefined}
    />
  );
}

function LeftToBudget() {
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  return budgetType === 'tracking' ? (
    <TrackingBudgetLeft />
  ) : (
    <EnvelopeLeftToBudget />
  );
}

type KpiRowProps = {
  month: string;
  lastMonth: string;
  spentSoFar: number;
  lastMonthAtSameDay: number;
  income: number;
  netWorth: number;
  netWorthChange: number;
};

export function KpiRow({
  month,
  lastMonth,
  spentSoFar,
  lastMonthAtSameDay,
  income,
  netWorth,
  netWorthChange,
}: KpiRowProps) {
  const { t } = useTranslation();
  const money = useTideMoney();
  const lastMonthName = monthUtils.format(lastMonth, 'MMMM');
  const monthName = monthUtils.format(month, 'MMMM');
  const difference = lastMonthAtSameDay - spentSoFar;

  return (
    <View
      aria-label={t('This month at a glance')}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(230px, 100%), 1fr))',
        gap: 16,
      }}
    >
      <Kpi
        label={t('Spent this month')}
        value={money(spentSoFar, { decimals: false })}
        sub={
          difference >= 0
            ? t('{{amount}} less than {{month}} so far', {
                amount: money(difference, { decimals: false }),
                month: lastMonthName,
              })
            : t('{{amount}} more than {{month}} so far', {
                amount: money(-difference, { decimals: false }),
                month: lastMonthName,
              })
        }
        subColor={difference >= 0 ? tideColors.tealDark : tideColors.over}
      />
      <Kpi
        label={t('Income')}
        value={money(income, { decimals: false })}
        sub={t('Received in {{month}}', { month: monthName })}
      />
      <SheetNameProvider name={monthUtils.sheetForMonth(month)}>
        <LeftToBudget />
      </SheetNameProvider>
      <Kpi
        label={t('Net worth')}
        value={money(netWorth, { decimals: false })}
        sub={
          <>
            {netWorthChange >= 0 ? (
              <SvgTideArrowUp width={14} height={14} />
            ) : (
              <SvgTideArrowDown width={14} height={14} />
            )}
            {t('{{amount}} this month', {
              amount: money(Math.abs(netWorthChange), { decimals: false }),
            })}
          </>
        }
        subColor={
          netWorthChange >= 0 ? tideColors.tealDark : theme.pageTextLight
        }
      />
    </View>
  );
}
