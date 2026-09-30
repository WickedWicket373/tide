import { Trans, useTranslation } from 'react-i18next';

import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { Link } from '#components/common/Link';
import {
  progressColor,
  tideCard,
  tideCardTitle,
  tideColors,
} from '#components/tide/tokens';
import { useTideMoney } from '#components/tide/useTideMoney';
import { useCategoriesById } from '#hooks/useCategories';
import { SheetNameProvider } from '#hooks/useSheetName';
import { useSheetValue } from '#hooks/useSheetValue';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { envelopeBudget, trackingBudget } from '#spreadsheet/bindings';

const DOT_COLORS = [
  '#2fa36b',
  '#e26b4a',
  '#8466d8',
  '#d9a21b',
  '#a0724a',
  '#4f7fda',
  '#3a8dc2',
  '#d2588f',
];

type CategoryBarProps = {
  id: string;
  name: string;
  spent: number;
  dot: string;
};

function CategoryBar({ id, name, spent, dot }: CategoryBarProps) {
  const { t } = useTranslation();
  const money = useTideMoney();
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  const binding =
    budgetType === 'tracking'
      ? trackingBudget.catBudgeted(id)
      : envelopeBudget.catBudgeted(id);
  const budgeted = Number(
    useSheetValue<'envelope-budget' | 'tracking-budget', typeof binding>(
      binding,
    ) ?? 0,
  );
  const percent = budgeted > 0 ? (spent / budgeted) * 100 : 0;
  const width = budgeted > 0 ? Math.min(100, percent) : 100;

  return (
    <View style={{ gap: 7 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 12,
          fontSize: 14,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            fontWeight: 600,
            minWidth: 0,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              flexShrink: 0,
              borderRadius: '50%',
              backgroundColor: dot,
            }}
          />
          {name}
        </View>
        <View style={{ flexDirection: 'row', whiteSpace: 'nowrap' }}>
          <strong style={{ fontWeight: 700 }}>
            {money(spent, { decimals: false })}
          </strong>
          <span style={{ color: tideColors.subtle, marginLeft: 4 }}>
            {budgeted > 0
              ? t('of {{amount}}', {
                  amount: money(budgeted, { decimals: false }),
                })
              : t('· no budget')}
          </span>
        </View>
      </View>
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
            borderRadius: 4,
            width: `${width}%`,
            backgroundColor:
              budgeted > 0 ? progressColor(percent) : tideColors.lastPeriod,
          }}
        />
      </View>
    </View>
  );
}

type CategorySpendingCardProps = {
  month: string;
  rows: Array<{ category: string | null; spent: number }>;
};

export function CategorySpendingCard({
  month,
  rows,
}: CategorySpendingCardProps) {
  const { t } = useTranslation();
  const { data: categories } = useCategoriesById();
  const top = rows.filter(row => row.category).slice(0, 6);

  return (
    <View
      style={{
        ...tideCard,
        flex: '1 1 420px',
        minWidth: 0,
        padding: '22px 24px',
        gap: 16,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <h2 style={tideCardTitle}>
          <Trans>Top spending</Trans>
        </h2>
        <Link
          variant="internal"
          to="/budget"
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: tideColors.teal,
            textDecoration: 'none',
          }}
        >
          {t('Budget →')}
        </Link>
      </View>
      {top.length === 0 ? (
        <View style={{ fontSize: 14, color: tideColors.subtle }}>
          <Trans>No spending yet this month.</Trans>
        </View>
      ) : (
        <SheetNameProvider name={monthUtils.sheetForMonth(month)}>
          {top.map((row, i) => {
            const id = row.category as string;
            return (
              <CategoryBar
                key={id}
                id={id}
                name={categories?.list[id]?.name ?? t('Unknown category')}
                spent={row.spent}
                dot={DOT_COLORS[i % DOT_COLORS.length]}
              />
            );
          })}
        </SheetNameProvider>
      )}
    </View>
  );
}
