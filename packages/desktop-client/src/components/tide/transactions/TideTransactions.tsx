import { useDeferredValue, useState } from 'react';
import type { CSSProperties } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { Button } from '@actual-app/components/button';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { useSyncAndDownloadMutation } from '#accounts';
import { SvgTideCheck, SvgTideRefresh } from '#components/tide/icons';
import { TidePage } from '#components/tide/TidePage';
import {
  tideCard,
  tideColors,
  tideSectionLabel,
} from '#components/tide/tokens';
import { useTideMoney } from '#components/tide/useTideMoney';
import { useAccounts } from '#hooks/useAccounts';
import { useCategories } from '#hooks/useCategories';
import { useSheetValue } from '#hooks/useSheetValue';
import * as bindings from '#spreadsheet/bindings';

import { TransactionDetail } from './TransactionDetail';
import { TransactionRow } from './TransactionRow';
import { useTideTransactions } from './useTideTransactions';
import type { TideTransaction } from './useTideTransactions';

const PAGE_SIZE = 150;

const controlStyle: CSSProperties = {
  height: 42,
  borderRadius: 12,
  border: `1px solid ${theme.cardBorder}`,
  backgroundColor: theme.cardBackground,
  color: theme.pageText,
  font: 'inherit',
  fontSize: 14,
  padding: '0 12px',
};

type DayGroup = {
  date: string;
  total: number;
  transactions: TideTransaction[];
};

function groupByDay(transactions: ReadonlyArray<TideTransaction>) {
  const groups: DayGroup[] = [];
  for (const transaction of transactions) {
    const last = groups[groups.length - 1];
    if (last && last.date === transaction.date) {
      last.transactions.push(transaction);
      last.total += transaction.amount;
    } else {
      groups.push({
        date: transaction.date,
        total: transaction.amount,
        transactions: [transaction],
      });
    }
  }
  return groups;
}

export function TideTransactions() {
  const { t } = useTranslation();
  const money = useTideMoney();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') === 'review' ? 'review' : 'all';
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Where the selection was, so a row that leaves the list is replaced by
  // the row that took its place.
  const [selectedHint, setSelectedHint] = useState(0);

  const syncAndDownload = useSyncAndDownloadMutation();
  const { data: accounts = [] } = useAccounts();
  const { data: { grouped: categoryGroups } = { grouped: [] } } =
    useCategories();
  const reviewCount = Number(useSheetValue(bindings.uncategorizedCount()) ?? 0);

  const { transactions, hasMore, isLoading } = useTideTransactions({
    view,
    search: deferredSearch,
    accountId,
    categoryId,
    limit,
  });

  const offBudget = new Set(
    accounts.filter(account => account.offbudget).map(account => account.id),
  );
  const needsReview = (transaction: TideTransaction) =>
    !transaction.category &&
    !transaction.transferAccount &&
    !offBudget.has(transaction.account);

  // Keep a selection. When the selected row leaves the list (for example it
  // was categorized while viewing "To review"), show the row that took its
  // place, so reviewing works like an inbox.
  let selectedIndex = transactions.findIndex(tr => tr.id === selectedId);
  if (selectedIndex === -1 && transactions.length > 0) {
    selectedIndex = Math.min(selectedHint, transactions.length - 1);
  }
  function selectTransaction(id: string) {
    setSelectedId(id);
    setSelectedHint(
      Math.max(
        0,
        transactions.findIndex(tr => tr.id === id),
      ),
    );
  }
  const selected = selectedIndex === -1 ? null : transactions[selectedIndex];

  const today = monthUtils.currentDay();
  const yesterday = monthUtils.subDays(today, 1);
  function dayLabel(date: string) {
    const day = monthUtils.format(date, 'MMM d');
    if (date === today) return t('Today · {{day}}', { day });
    if (date === yesterday) return t('Yesterday · {{day}}', { day });
    return `${monthUtils.format(date, 'EEEE')} · ${day}`;
  }

  function setView(next: 'all' | 'review') {
    setLimit(PAGE_SIZE);
    setSelectedHint(0);
    setSelectedId(null);
    setSearchParams(next === 'review' ? { view: 'review' } : {}, {
      replace: true,
    });
  }

  const tabStyle = (isActive: boolean): CSSProperties => ({
    height: 34,
    padding: '0 14px',
    borderRadius: 9,
    fontSize: 14,
    fontWeight: 700,
    color: isActive ? theme.pageText : tideColors.label,
    backgroundColor: isActive ? theme.cardBackground : 'transparent',
    boxShadow: isActive ? '0 1px 2px rgba(21, 32, 30, 0.08)' : 'none',
  });

  return (
    <TidePage
      title={t('Transactions')}
      subtitle={
        reviewCount > 0
          ? t('{{count}} waiting for a category', { count: reviewCount })
          : t('Everything has a category')
      }
      actions={
        <Button
          variant="normal"
          onPress={() => syncAndDownload.mutate({})}
          isDisabled={syncAndDownload.isPending}
          style={{
            height: 40,
            padding: '0 16px',
            borderRadius: 10,
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <SvgTideRefresh width={17} height={17} />
          {syncAndDownload.isPending ? t('Syncing…') : t('Sync banks')}
        </Button>
      }
    >
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <View
          role="group"
          aria-label={t('Show')}
          style={{
            flexDirection: 'row',
            gap: 2,
            padding: 4,
            borderRadius: 12,
            backgroundColor: '#e8eeec',
          }}
        >
          <Button
            variant="bare"
            aria-pressed={view === 'all'}
            onPress={() => setView('all')}
            style={tabStyle(view === 'all')}
          >
            <Trans>All</Trans>
          </Button>
          <Button
            variant="bare"
            aria-pressed={view === 'review'}
            onPress={() => setView('review')}
            style={tabStyle(view === 'review')}
          >
            {t('To review ({{count}})', { count: reviewCount })}
          </Button>
        </View>
        <input
          type="search"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setLimit(PAGE_SIZE);
          }}
          placeholder={t('Search merchants, categories, notes, amounts')}
          aria-label={t('Search transactions')}
          style={{ ...controlStyle, flex: '1 1 260px', minWidth: 0 }}
        />
        <select
          value={accountId}
          onChange={e => setAccountId(e.target.value)}
          aria-label={t('Account')}
          style={{ ...controlStyle, flex: '0 1 200px', minWidth: 0 }}
        >
          <option value="">
            <Trans>All accounts</Trans>
          </option>
          {accounts
            .filter(account => !account.closed)
            .map(account => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
        </select>
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          aria-label={t('Category')}
          style={{ ...controlStyle, flex: '0 1 200px', minWidth: 0 }}
        >
          <option value="">
            <Trans>All categories</Trans>
          </option>
          {categoryGroups.map(group => (
            <optgroup key={group.id} label={group.name}>
              {(group.categories ?? []).map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 20,
          alignItems: 'flex-start',
        }}
      >
        <View
          style={{
            ...tideCard,
            flex: '1 1 560px',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {transactions.length === 0 && !isLoading ? (
            <View
              style={{
                alignItems: 'center',
                gap: 10,
                padding: '56px 24px',
                textAlign: 'center',
              }}
            >
              <View
                aria-hidden="true"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: tideColors.tealSoft,
                  color: tideColors.teal,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SvgTideCheck width={26} height={26} />
              </View>
              <View style={{ fontSize: 16, fontWeight: 700 }}>
                {view === 'review' && !deferredSearch ? (
                  <Trans>You're all caught up</Trans>
                ) : (
                  <Trans>No transactions match</Trans>
                )}
              </View>
            </View>
          ) : (
            groupByDay(transactions).map(group => (
              <View key={group.date} role="group" aria-label={group.date}>
                <View
                  style={{
                    ...tideSectionLabel,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: '10px 20px',
                    backgroundColor: '#f8faf9',
                    borderBottom: `1px solid ${tideColors.rowDivider}`,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <span>{dayLabel(group.date)}</span>
                  <span>{money(group.total, { sign: true })}</span>
                </View>
                {group.transactions.map(transaction => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    needsReview={needsReview(transaction)}
                    isSelected={transaction.id === selected?.id}
                    onSelect={selectTransaction}
                  />
                ))}
              </View>
            ))
          )}
          {hasMore && (
            <Button
              variant="bare"
              onPress={() => setLimit(limit + PAGE_SIZE)}
              style={{
                padding: 16,
                fontSize: 14,
                fontWeight: 700,
                color: tideColors.teal,
              }}
            >
              <Trans>Show more</Trans>
            </Button>
          )}
        </View>

        {selected && (
          <View
            style={{
              flex: '0 1 380px',
              minWidth: 300,
              position: 'sticky',
              top: 0,
            }}
          >
            <TransactionDetail
              key={selected.id}
              transaction={selected}
              isOnBudget={!offBudget.has(selected.account)}
            />
          </View>
        )}
      </View>
    </TidePage>
  );
}
