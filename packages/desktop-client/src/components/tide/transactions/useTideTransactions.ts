import { q } from '@actual-app/core/shared/query';

import { useDateFormat } from '#hooks/useDateFormat';
import { useQuery } from '#hooks/useQuery';
import { transactionsSearch, uncategorizedTransactions } from '#queries';

export type TideTransaction = {
  id: string;
  date: string;
  amount: number;
  notes: string | null;
  imported_payee: string | null;
  payeeName: string | null;
  account: string;
  accountName: string | null;
  category: string | null;
  categoryName: string | null;
  transferAccount: string | null;
  transferAccountName: string | null;
  isChild: boolean;
};

export type TransactionFilters = {
  view: 'all' | 'review';
  search: string;
  accountId: string;
  categoryId: string;
  limit: number;
};

/**
 * Live list of transactions for the Tide Transactions page, newest first.
 * "To review" means on-budget spending with no category yet (the same set the
 * sidebar badge counts). Fetches one row past the limit so the page knows
 * whether there is more to show.
 */
export function useTideTransactions({
  view,
  search,
  accountId,
  categoryId,
  limit,
}: TransactionFilters) {
  const dateFormat = useDateFormat() || 'MM/dd/yyyy';

  const { data, isLoading } = useQuery<TideTransaction>(() => {
    let query =
      view === 'review' ? uncategorizedTransactions() : q('transactions');
    if (accountId) {
      query = query.filter({ account: accountId });
    }
    if (categoryId) {
      query = query.filter({ category: categoryId });
    }
    if (search.trim()) {
      query = transactionsSearch(query, search.trim(), dateFormat);
    }
    return query
      .select([
        'id',
        'date',
        'amount',
        'notes',
        'imported_payee',
        'account',
        'category',
        { payeeName: 'payee.name' },
        { accountName: 'account.name' },
        { categoryName: 'category.name' },
        { transferAccount: 'payee.transfer_acct' },
        { transferAccountName: 'payee.transfer_acct.name' },
        { isChild: 'is_child' },
      ])
      .orderBy([{ date: 'desc' }, { sort_order: 'desc' }, 'id'])
      .limit(limit + 1);
  }, [view, search, accountId, categoryId, limit, dateFormat]);

  const rows = data ?? [];
  return {
    transactions: rows.slice(0, limit),
    hasMore: rows.length > limit,
    isLoading,
  };
}

/** Name to show for a transaction: payee, else the bank's raw text. */
export function displayName(
  transaction: TideTransaction,
  fallback: string,
): string {
  if (transaction.transferAccountName) {
    return transaction.transferAccountName;
  }
  return (
    transaction.payeeName?.trim() ||
    transaction.imported_payee?.trim() ||
    fallback
  );
}
