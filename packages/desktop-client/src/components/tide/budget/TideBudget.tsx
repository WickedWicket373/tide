import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { Link } from '#components/common/Link';
import { NarrowAlternate } from '#components/responsive';
import { SvgTideChevronRight } from '#components/tide/icons';
import { TidePage } from '#components/tide/TidePage';
import { tideColors } from '#components/tide/tokens';
import { useCategories } from '#hooks/useCategories';
import { SheetNameProvider } from '#hooks/useSheetName';

import { ExpenseGroup, IncomeGroup } from './BudgetGroups';
import { EnvelopeSummary, TrackingSummary } from './BudgetSummary';
import { useBudgetBindings } from './useBudgetValues';

/** Phones keep Actual's mobile budget; wider screens get the Tide page. */
export function TideBudgetRoute() {
  const { isNarrowWidth } = useResponsive();
  return isNarrowWidth ? <NarrowAlternate name="Budget" /> : <TideBudget />;
}

export function TideBudget() {
  const { t } = useTranslation();
  const [month, setMonth] = useState(monthUtils.currentMonth());
  const [tab, setTab] = useState('all');
  const { isTracking } = useBudgetBindings();
  const { data: { grouped } = { grouped: [] } } = useCategories();

  const groups = grouped.filter(group => !group.hidden);
  const incomeGroups = groups.filter(group => group.is_income);
  const expenseGroups = groups.filter(group => !group.is_income);
  const tabs = [
    { id: 'all', label: t('All') },
    ...incomeGroups.map(group => ({ id: group.id, label: group.name })),
    ...expenseGroups.map(group => ({ id: group.id, label: group.name })),
  ];
  const isShown = (id: string) => tab === 'all' || tab === id;

  const tabStyle = (isActive: boolean): CSSProperties => ({
    height: 34,
    padding: '0 14px',
    borderRadius: 9,
    fontSize: 14,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    color: isActive ? theme.pageText : tideColors.label,
    backgroundColor: isActive ? theme.cardBackground : 'transparent',
    boxShadow: isActive ? '0 1px 2px rgba(21, 32, 30, 0.08)' : 'none',
  });

  return (
    <SheetNameProvider name={monthUtils.sheetForMonth(month)}>
      <TidePage
        title={t('Budget')}
        actions={
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              height: 42,
              padding: '0 6px',
              borderRadius: 12,
              border: `1px solid ${theme.cardBorder}`,
              backgroundColor: theme.cardBackground,
            }}
          >
            <Button
              variant="bare"
              aria-label={t('Previous month')}
              onPress={() => setMonth(monthUtils.prevMonth(month))}
              style={{ width: 32, height: 32, borderRadius: 8 }}
            >
              <SvgTideChevronRight
                width={16}
                height={16}
                style={{ transform: 'rotate(180deg)' }}
              />
            </Button>
            <span
              aria-live="polite"
              style={{
                minWidth: 140,
                textAlign: 'center',
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              {monthUtils.format(month, 'MMMM yyyy')}
            </span>
            <Button
              variant="bare"
              aria-label={t('Next month')}
              onPress={() => setMonth(monthUtils.nextMonth(month))}
              style={{ width: 32, height: 32, borderRadius: 8 }}
            >
              <SvgTideChevronRight width={16} height={16} />
            </Button>
          </View>
        }
      >
        {isTracking ? (
          <TrackingSummary expenseGroups={expenseGroups} />
        ) : (
          <EnvelopeSummary expenseGroups={expenseGroups} />
        )}

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <View
            role="group"
            aria-label={t('Show')}
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 2,
              padding: 4,
              borderRadius: 12,
              backgroundColor: '#e8eeec',
            }}
          >
            {tabs.map(item => (
              <Button
                key={item.id}
                variant="bare"
                aria-pressed={tab === item.id}
                onPress={() => setTab(item.id)}
                style={tabStyle(tab === item.id)}
              >
                {item.label}
              </Button>
            ))}
          </View>
          <View
            style={{
              flexDirection: 'row',
              gap: 16,
              alignItems: 'center',
              fontSize: 13,
              fontWeight: 600,
              color: tideColors.subtle,
            }}
          >
            <span>
              <Trans>Click a budget amount to change it</Trans>
            </span>
            <Link
              variant="internal"
              to="/budget/classic"
              style={{
                color: tideColors.teal,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Trans>Classic view</Trans>
            </Link>
          </View>
        </View>

        {incomeGroups
          .filter(group => isShown(group.id))
          .map(group => (
            <IncomeGroup key={group.id} month={month} group={group} />
          ))}
        {expenseGroups
          .filter(group => isShown(group.id))
          .map(group => (
            <ExpenseGroup key={group.id} month={month} group={group} />
          ))}
      </TidePage>
    </SheetNameProvider>
  );
}
