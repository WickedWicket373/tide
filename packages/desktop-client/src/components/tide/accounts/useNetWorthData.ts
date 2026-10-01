import * as monthUtils from '@actual-app/core/shared/months';
import { q } from '@actual-app/core/shared/query';
import type { AccountEntity } from '@actual-app/core/types/models';

import { useAccounts } from '#hooks/useAccounts';
import { useQuery } from '#hooks/useQuery';

export type RangeId = '1M' | '3M' | '6M' | '1Y';

export type AccountKind =
  | 'cash'
  | 'credit'
  | 'investments'
  | 'property'
  | 'vehicles'
  | 'loans'
  | 'other';

export type AccountSeries = {
  account: AccountEntity;
  kind: AccountKind;
  balance: number;
  /** Balance at the end of each day in the range, oldest first. */
  series: number[];
};

const RANGE_DAYS: Record<RangeId, number> = {
  '1M': 30,
  '3M': 91,
  '6M': 182,
  '1Y': 365,
};

const KIND_PATTERNS: Array<[AccountKind, RegExp]> = [
  ['credit', /credit|card|visa|mastercard|amex|discover/i],
  [
    'investments',
    /401k|401\(k\)|ira\b|roth|brokerage|invest|fidelity|vanguard|schwab|hsa|stock|crypto/i,
  ],
  ['loans', /loan|mortgage|lien|student/i],
  ['vehicles', /car\b|vehicle|auto\b|truck|motorcycle|bike|triumph|thruxton/i],
  ['property', /house|home|property|condo|real estate/i],
];

/**
 * Sorts an account into a group by its name, since Actual doesn't store
 * account types. Off-budget accounts that match nothing go to "other" (or
 * "loans" when they're negative); on-budget ones are cash.
 */
export function accountKind(account: AccountEntity, balance: number) {
  for (const [kind, pattern] of KIND_PATTERNS) {
    if (pattern.test(account.name)) {
      // "Auto loan" is a loan, not a vehicle.
      // A vehicle with a negative balance is the loan on it.
      if (kind === 'vehicles' && (/loan/i.test(account.name) || balance < 0)) {
        return 'loans';
      }
      return kind;
    }
  }
  if (account.offbudget) return balance < 0 ? 'loans' : 'other';
  return 'cash';
}

type BalanceRow = { account: string; amount: number };
type DailyRow = { account: string; date: string; amount: number };

export function useNetWorthData(range: RangeId) {
  const today = monthUtils.currentDay();
  const start = monthUtils.subDays(today, RANGE_DAYS[range] - 1);
  const days = monthUtils.dayRangeInclusive(start, today);
  const { data: accounts = [] } = useAccounts();

  const before = useQuery<BalanceRow>(
    () =>
      q('transactions')
        .filter({ date: { $lt: start } })
        .groupBy('account')
        .select(['account', { amount: { $sum: '$amount' } }]),
    [start],
  );
  const daily = useQuery<DailyRow>(
    () =>
      q('transactions')
        .filter({ date: { $gte: start } })
        .groupBy(['account', 'date'])
        .select(['account', 'date', { amount: { $sum: '$amount' } }]),
    [start],
  );

  const dayIndex = new Map(days.map((day, i) => [day, i]));
  const startBalance = new Map(
    (before.data ?? []).map(row => [row.account, row.amount]),
  );
  const changes = new Map<string, number[]>();
  for (const row of daily.data ?? []) {
    // Anything dated after today (scheduled or future-dated entries) counts
    // toward today's balance, matching the sidebar totals.
    const index = row.date > today ? days.length - 1 : dayIndex.get(row.date);
    if (index === undefined) continue;
    let perDay = changes.get(row.account);
    if (!perDay) {
      perDay = new Array<number>(days.length).fill(0);
      changes.set(row.account, perDay);
    }
    perDay[index] += row.amount;
  }

  const open = accounts.filter(account => !account.closed);
  const series: AccountSeries[] = open.map(account => {
    let running = startBalance.get(account.id) ?? 0;
    const perDay = changes.get(account.id);
    const values = days.map((_, i) => (running += perDay?.[i] ?? 0));
    const balance = values[values.length - 1] ?? running;
    return {
      account,
      balance,
      series: values,
      kind: accountKind(account, balance),
    };
  });

  const total = days.map((_, i) =>
    series.reduce((sum, item) => sum + item.series[i], 0),
  );

  return {
    days,
    total,
    accounts: series,
    isLoading: before.isLoading || daily.isLoading,
  };
}
