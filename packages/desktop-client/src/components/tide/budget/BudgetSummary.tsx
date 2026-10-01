import type { ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { View } from '@actual-app/components/view';
import type { CategoryGroupEntity } from '@actual-app/core/types/models';

import { tideCard, tideColors } from '#components/tide/tokens';
import { useTideMoney } from '#components/tide/useTideMoney';
import { envelopeBudget, trackingBudget } from '#spreadsheet/bindings';

import {
  useBudgetBindings,
  useBudgetNumber,
  useEnvelopeNumber,
  useTrackingNumber,
} from './useBudgetValues';

const SEGMENT_COLORS = ['#0a5f57', '#3fbf9e', '#a7e3d2', '#d9a21b', '#8466d8'];

type Numbers = {
  left: number;
  leftDetail: ReactNode;
  incomeReceived: number;
  incomeExpected: number | null;
  spent: number;
  budgeted: number;
};

function GroupSegment({
  id,
  total,
  color,
}: {
  id: string;
  total: number;
  color: string;
}) {
  const { bindings } = useBudgetBindings();
  const spent = -useBudgetNumber(bindings.groupSumAmount(id));
  if (spent <= 0 || total <= 0) return null;
  return (
    <View
      style={{
        width: `${Math.min(100, (spent / total) * 100)}%`,
        height: 8,
        backgroundColor: color,
      }}
    />
  );
}

function GroupLegend({
  group,
  color,
}: {
  group: CategoryGroupEntity;
  color: string;
}) {
  const money = useTideMoney();
  const { bindings } = useBudgetBindings();
  const spent = -useBudgetNumber(bindings.groupSumAmount(group.id));
  const budgeted = useBudgetNumber(bindings.groupBudgeted(group.id));
  return (
    <View style={{ gap: 1, minWidth: 0 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          fontSize: 12.5,
          fontWeight: 700,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 8,
            height: 8,
            borderRadius: 2,
            backgroundColor: color,
          }}
        />
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {group.name}
        </span>
      </View>
      <span style={{ fontSize: 12, color: tideColors.subtle }}>
        {`${money(spent, { decimals: false })} / ${money(budgeted, { decimals: false })}`}
      </span>
    </View>
  );
}

function SummaryCards({
  numbers,
  expenseGroups,
}: {
  numbers: Numbers;
  expenseGroups: CategoryGroupEntity[];
}) {
  const { t } = useTranslation();
  const money = useTideMoney();
  const shownGroups = expenseGroups.slice(0, SEGMENT_COLORS.length);
  const incomePercent =
    numbers.incomeExpected && numbers.incomeExpected > 0
      ? Math.min(100, (numbers.incomeReceived / numbers.incomeExpected) * 100)
      : null;
  const card = { ...tideCard, padding: '20px 22px', gap: 10, minWidth: 0 };

  return (
    <View
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
        gap: 16,
      }}
    >
      <View
        style={{
          ...card,
          justifyContent: 'center',
          backgroundColor: numbers.left < 0 ? '#fbe7e2' : tideColors.tealSoft,
          borderColor: numbers.left < 0 ? '#f2c9bf' : '#bfe6da',
        }}
      >
        <span
          style={{
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: numbers.left < 0 ? tideColors.over : tideColors.tealDark,
          }}
        >
          {money(numbers.left, { decimals: false })}
        </span>
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: numbers.left < 0 ? tideColors.over : tideColors.tealDark,
          }}
        >
          {numbers.left < 0 ? t('over budget') : t('left to budget')}
        </span>
        <span
          style={{ fontSize: 12.5, fontWeight: 600, color: tideColors.label }}
        >
          {numbers.leftDetail}
        </span>
      </View>

      <View style={card}>
        <span style={{ fontSize: 15, fontWeight: 800 }}>
          <Trans>Income</Trans>
        </span>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 800 }}>
            {money(numbers.incomeReceived, { decimals: false })}
          </span>
          <span style={{ fontSize: 14, color: tideColors.subtle }}>
            {numbers.incomeExpected != null
              ? t('of {{amount}} received', {
                  amount: money(numbers.incomeExpected, { decimals: false }),
                })
              : t('received')}
          </span>
        </View>
        {incomePercent != null && (
          <View
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: tideColors.track,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: 8,
                width: `${incomePercent}%`,
                backgroundColor: tideColors.onTrack,
              }}
            />
          </View>
        )}
      </View>

      <View style={card}>
        <span style={{ fontSize: 15, fontWeight: 800 }}>
          <Trans>Spending</Trans>
        </span>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 800 }}>
            {money(numbers.spent, { decimals: false })}
          </span>
          <span style={{ fontSize: 14, color: tideColors.subtle }}>
            {t('of {{amount}} budgeted', {
              amount: money(numbers.budgeted, { decimals: false }),
            })}
          </span>
        </View>
        <View
          aria-hidden="true"
          style={{
            flexDirection: 'row',
            gap: 2,
            height: 8,
            borderRadius: 4,
            backgroundColor: tideColors.track,
            overflow: 'hidden',
          }}
        >
          {shownGroups.map((group, i) => (
            <GroupSegment
              key={group.id}
              id={group.id}
              total={Math.max(numbers.budgeted, numbers.spent)}
              color={SEGMENT_COLORS[i]}
            />
          ))}
        </View>
        <View
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 8,
          }}
        >
          {shownGroups.map((group, i) => (
            <GroupLegend
              key={group.id}
              group={group}
              color={SEGMENT_COLORS[i]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

type SummaryProps = { expenseGroups: CategoryGroupEntity[] };

export function EnvelopeSummary({ expenseGroups }: SummaryProps) {
  const { t } = useTranslation();
  const money = useTideMoney();
  const toBudget = useEnvelopeNumber(envelopeBudget.toBudget);
  const available = useEnvelopeNumber(envelopeBudget.incomeAvailable);
  const budgeted = Math.abs(useEnvelopeNumber(envelopeBudget.totalBudgeted));
  const income = useEnvelopeNumber(envelopeBudget.totalIncome);
  const spent = -useEnvelopeNumber(envelopeBudget.totalSpent);
  return (
    <SummaryCards
      expenseGroups={expenseGroups}
      numbers={{
        left: toBudget,
        leftDetail: t('{{available}} available − {{budgeted}} budgeted', {
          available: money(available, { decimals: false }),
          budgeted: money(budgeted, { decimals: false }),
        }),
        incomeReceived: income,
        incomeExpected: null,
        spent,
        budgeted,
      }}
    />
  );
}

export function TrackingSummary({ expenseGroups }: SummaryProps) {
  const { t } = useTranslation();
  const money = useTideMoney();
  const plannedIncome = useTrackingNumber(trackingBudget.totalBudgetedIncome);
  const budgeted = Math.abs(
    useTrackingNumber(trackingBudget.totalBudgetedExpense),
  );
  const income = useTrackingNumber(trackingBudget.totalIncome);
  const spent = -useTrackingNumber(trackingBudget.totalSpent);
  return (
    <SummaryCards
      expenseGroups={expenseGroups}
      numbers={{
        left: plannedIncome - budgeted,
        leftDetail: t('{{income}} planned income − {{budgeted}} budgeted', {
          income: money(plannedIncome, { decimals: false }),
          budgeted: money(budgeted, { decimals: false }),
        }),
        incomeReceived: income,
        incomeExpected: plannedIncome,
        spent,
        budgeted,
      }}
    />
  );
}
