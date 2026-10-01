import { Trans, useTranslation } from 'react-i18next';

import { View } from '@actual-app/components/view';
import type {
  CategoryEntity,
  CategoryGroupEntity,
} from '@actual-app/core/types/models';

import { tideCard, tideColors } from '#components/tide/tokens';
import { useTideMoney } from '#components/tide/useTideMoney';

import { ExpenseRow, IncomeRow, SectionHeader } from './BudgetRows';
import {
  useBudgetBindings,
  useBudgetNumber,
  useGroupNumbers,
} from './useBudgetValues';

function visibleCategories(group: CategoryGroupEntity): CategoryEntity[] {
  return (group.categories ?? []).filter(category => !category.hidden);
}

type GroupProps = {
  month: string;
  group: CategoryGroupEntity;
};

export function ExpenseGroup({ month, group }: GroupProps) {
  const { t } = useTranslation();
  const money = useTideMoney();
  const { budgeted, sum, balance } = useGroupNumbers(group.id);
  const categories = visibleCategories(group);

  return (
    <View
      aria-label={group.name}
      style={{ ...tideCard, overflow: 'hidden', flexShrink: 0 }}
    >
      <SectionHeader
        title={group.name}
        subtitle={t('{{count}} categories', { count: categories.length })}
        columns={[
          { label: t('Budget'), value: money(budgeted, { decimals: false }) },
          { label: t('Spent'), value: money(-sum, { decimals: false }) },
          {
            label: t('Remaining'),
            value: money(balance, { decimals: false }),
            color: balance < 0 ? tideColors.over : tideColors.tealDark,
          },
        ]}
      />
      {categories.map(category => (
        <ExpenseRow
          key={category.id}
          month={month}
          id={category.id}
          name={category.name}
        />
      ))}
    </View>
  );
}

export function IncomeGroup({ month, group }: GroupProps) {
  const { t } = useTranslation();
  const money = useTideMoney();
  const { isTracking, bindings } = useBudgetBindings();
  const received = useBudgetNumber(bindings.groupSumAmount(group.id));
  const budgeted = useBudgetNumber(bindings.groupBudgeted(group.id));
  const categories = visibleCategories(group);

  return (
    <View
      aria-label={group.name}
      style={{ ...tideCard, overflow: 'hidden', flexShrink: 0 }}
    >
      <SectionHeader
        title={group.name}
        subtitle={
          isTracking ? t('Expected this month') : t('Received this month')
        }
        columns={
          isTracking
            ? [
                {
                  label: t('Budget'),
                  value: money(budgeted, { decimals: false }),
                },
                {
                  label: t('Received'),
                  value: money(received, { decimals: false }),
                },
                {
                  label: t('Still expected'),
                  value: money(Math.max(0, budgeted - received), {
                    decimals: false,
                  }),
                  color: tideColors.tealDark,
                },
              ]
            : [
                { label: '', value: '' },
                {
                  label: t('Received'),
                  value: money(received, { decimals: false }),
                  color: tideColors.income,
                },
                { label: '', value: '' },
              ]
        }
      />
      {categories.map(category => (
        <IncomeRow
          key={category.id}
          month={month}
          id={category.id}
          name={category.name}
          isTracking={isTracking}
        />
      ))}
      {categories.length === 0 && (
        <View style={{ padding: 22, color: tideColors.subtle, fontSize: 14 }}>
          <Trans>No income categories yet.</Trans>
        </View>
      )}
    </View>
  );
}
