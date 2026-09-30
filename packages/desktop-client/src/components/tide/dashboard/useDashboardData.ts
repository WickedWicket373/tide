import * as monthUtils from '@actual-app/core/shared/months';
import { q } from '@actual-app/core/shared/query';

import { useQuery } from '#hooks/useQuery';
import { uncategorizedTransactions } from '#queries';

/**
 * Money that left the budget as spending: on-budget accounts, not a transfer
 * between on-budget accounts, and either an expense category or an
 * uncategorized outflow. Refunds in expense categories reduce spending.
 */
function spendingFilter() {
  return {
    $and: [
      { 'account.offbudget': false },
      {
        $or: [
          { 'payee.transfer_acct': null },
          { 'payee.transfer_acct.offbudget': true },
        ],
      },
      {
        $or: [
          { 'category.is_income': false },
          { $and: [{ category: null }, { amount: { $lt: 0 } }] },
        ],
      },
    ],
  };
}

function monthRange(month: string) {
  return {
    date: {
      $gte: monthUtils.firstDayOfMonth(month),
      $lte: monthUtils.lastDayOfMonth(month),
    },
  };
}

type DailyRow = { date: string; amount: number };
type SumRow = { amount: number | null };
type CategoryRow = { category: string | null; amount: number };

export type ReviewRow = {
  id: string;
  date: string;
  amount: number;
  payeeName: string | null;
  importedPayee: string | null;
  accountName: string | null;
};

export type UpcomingRow = {
  id: string;
  name: string | null;
  next_date: string;
  _amount: number | { num1: number; num2: number } | null;
  payeeName: string | null;
  accountName: string | null;
};

/** Running total of spending for each day of the month (positive cents). */
function cumulativeByDay(rows: ReadonlyArray<DailyRow> | null, month: string) {
  const days = monthUtils.getDay(monthUtils.lastDayOfMonth(month));
  const perDay = new Array<number>(days).fill(0);
  for (const row of rows ?? []) {
    const index = monthUtils.getDay(row.date) - 1;
    if (index >= 0 && index < days) perDay[index] += -row.amount;
  }
  let total = 0;
  return perDay.map(value => (total += value));
}

export function useDashboardData() {
  const month = monthUtils.currentMonth();
  const lastMonth = monthUtils.prevMonth(month);
  const today = monthUtils.currentDay();

  const thisMonthDaily = useQuery<DailyRow>(
    () =>
      q('transactions')
        .filter(spendingFilter())
        .filter(monthRange(month))
        .groupBy('date')
        .select(['date', { amount: { $sum: '$amount' } }]),
    [month],
  );

  const lastMonthDaily = useQuery<DailyRow>(
    () =>
      q('transactions')
        .filter(spendingFilter())
        .filter(monthRange(lastMonth))
        .groupBy('date')
        .select(['date', { amount: { $sum: '$amount' } }]),
    [lastMonth],
  );

  const income = useQuery<SumRow>(
    () =>
      q('transactions')
        .filter({
          'account.offbudget': false,
          'category.is_income': true,
          starting_balance_flag: { $ne: true },
        })
        .filter(monthRange(month))
        .select([{ amount: { $sum: '$amount' } }]),
    [month],
  );

  const netWorth = useQuery<SumRow>(
    () =>
      q('transactions')
        .filter({ 'account.closed': false })
        .select([{ amount: { $sum: '$amount' } }]),
    [],
  );

  const netWorthChange = useQuery<SumRow>(
    () =>
      q('transactions')
        .filter({
          'account.closed': false,
          date: { $gte: monthUtils.firstDayOfMonth(month) },
        })
        .select([{ amount: { $sum: '$amount' } }]),
    [month],
  );

  const byCategory = useQuery<CategoryRow>(
    () =>
      q('transactions')
        .filter(spendingFilter())
        .filter(monthRange(month))
        .groupBy('category')
        .select(['category', { amount: { $sum: '$amount' } }]),
    [month],
  );

  const review = useQuery<ReviewRow>(
    () =>
      uncategorizedTransactions()
        .select([
          'id',
          'date',
          'amount',
          { payeeName: 'payee.name' },
          { importedPayee: 'imported_payee' },
          { accountName: 'account.name' },
        ])
        .orderBy({ date: 'desc' })
        .limit(6),
    [],
  );

  const upcomingEnd = monthUtils.addDays(today, 14);
  const upcoming = useQuery<UpcomingRow>(
    () =>
      q('schedules')
        .filter({
          completed: false,
          '_account.closed': false,
          next_date: { $gte: today, $lte: upcomingEnd },
        })
        .select([
          'id',
          'name',
          'next_date',
          '_amount',
          { payeeName: '_payee.name' },
          { accountName: '_account.name' },
        ])
        .orderBy({ next_date: 'asc' })
        .limit(8),
    [today, upcomingEnd],
  );

  const thisMonthCumulative = cumulativeByDay(thisMonthDaily.data, month);
  const lastMonthCumulative = cumulativeByDay(lastMonthDaily.data, lastMonth);
  const todayIndex = monthUtils.getDay(today) - 1;
  const spentSoFar = thisMonthCumulative[todayIndex] ?? 0;
  const lastMonthAtSameDay =
    lastMonthCumulative[Math.min(todayIndex, lastMonthCumulative.length - 1)] ??
    0;

  return {
    month,
    lastMonth,
    todayIndex,
    isLoading:
      thisMonthDaily.isLoading ||
      lastMonthDaily.isLoading ||
      income.isLoading ||
      netWorth.isLoading,
    spentSoFar,
    lastMonthAtSameDay,
    lastMonthTotal: lastMonthCumulative[lastMonthCumulative.length - 1] ?? 0,
    thisMonthCumulative: thisMonthCumulative.slice(0, todayIndex + 1),
    lastMonthCumulative,
    income: income.data?.[0]?.amount ?? 0,
    netWorth: netWorth.data?.[0]?.amount ?? 0,
    netWorthChange: netWorthChange.data?.[0]?.amount ?? 0,
    categorySpending: (byCategory.data ?? [])
      .map(row => ({ category: row.category, spent: -row.amount }))
      .filter(row => row.spent > 0)
      .sort((a, b) => b.spent - a.spent),
    review: review.data ?? [],
    upcoming: upcoming.data ?? [],
  };
}

/** A schedule's amount; ranges ("between X and Y") use their midpoint. */
export function scheduleAmount(amount: UpcomingRow['_amount']) {
  if (amount == null) return 0;
  if (typeof amount === 'number') return amount;
  return Math.round((amount.num1 + amount.num2) / 2);
}
