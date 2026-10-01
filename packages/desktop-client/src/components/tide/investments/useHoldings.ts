import { useEffect, useState } from 'react';

import { send } from '@actual-app/core/platform/client/connection';

import { useSyncServerStatus } from '#hooks/useSyncServerStatus';

export type Holding = {
  id: string;
  symbol: string;
  description: string;
  shares: number | null;
  marketValue: number;
  /** Null when the bank doesn't report what was paid. */
  costBasis: number | null;
  accountId: string;
  accountName: string;
};

export type HoldingsAccount = {
  id: string;
  name: string;
  org: string;
  balance: number;
  holdings: Holding[];
};

type CacheEntry = { fetchedAt: number; accounts: HoldingsAccount[] };

const CACHE_KEY = 'tide-holdings-v1';
// SimpleFIN allows about 24 requests a day, so reuse a recent answer.
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

function readCache(): CacheEntry | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      'fetchedAt' in parsed &&
      'accounts' in parsed &&
      Array.isArray(parsed.accounts) &&
      // An empty answer isn't worth keeping; ask again next visit.
      parsed.accounts.length > 0
    ) {
      return parsed as CacheEntry;
    }
  } catch {
    // Storage can be unavailable; fall through to a fresh fetch.
  }
  return null;
}

function writeCache(entry: CacheEntry) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Not fatal: the page still shows what it fetched.
  }
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toCents(value: unknown) {
  return Math.round((toNumber(value) ?? 0) * 100);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

/** Turns SimpleFIN's account list into the shape the page uses. */
function parseAccounts(response: unknown): HoldingsAccount[] {
  const root = asRecord(response);
  const data = asRecord(root.data ?? root);
  const accounts = Array.isArray(data.accounts) ? data.accounts : [];
  return accounts
    .map(item => {
      const account = asRecord(item);
      const id = String(account.id ?? '');
      const name = String(account.name ?? '');
      const holdings = (
        Array.isArray(account.holdings) ? account.holdings : []
      ).map((entry, index) => {
        const holding = asRecord(entry);
        const cost = toNumber(holding.cost_basis);
        return {
          id: String(holding.id ?? `${id}-${index}`),
          symbol: String(holding.symbol ?? '').toUpperCase(),
          description: String(holding.description ?? holding.symbol ?? ''),
          shares: toNumber(holding.shares),
          marketValue: toCents(holding.market_value),
          // A cost basis of exactly 0 almost always means "not reported".
          costBasis: cost && cost > 0 ? Math.round(cost * 100) : null,
          accountId: id,
          accountName: name,
        } satisfies Holding;
      });
      return {
        id,
        name,
        org: String(asRecord(account.org).name ?? ''),
        balance: toCents(account.balance),
        holdings,
      } satisfies HoldingsAccount;
    })
    .filter(account => account.holdings.length > 0);
}

type Status = 'idle' | 'loading' | 'ready' | 'error' | 'no-server';

/**
 * Investment holdings from the bank connection (SimpleFIN). Actual doesn't
 * keep holdings, so they're fetched from the server and cached in this
 * browser for a few hours.
 */
export function useHoldings() {
  const serverStatus = useSyncServerStatus();
  const [entry, setEntry] = useState<CacheEntry | null>(readCache);
  const [status, setStatus] = useState<Status>(entry ? 'ready' : 'idle');

  async function refresh() {
    setStatus('loading');
    try {
      const response: unknown = await send('simplefin-accounts', {
        withHoldings: true,
      });
      const record = asRecord(response);
      if (record.error || record.error_code) {
        setStatus('error');
        return;
      }
      const next = { fetchedAt: Date.now(), accounts: parseAccounts(response) };
      writeCache(next);
      setEntry(next);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  const isStale = !entry || Date.now() - entry.fetchedAt > MAX_AGE_MS;
  useEffect(() => {
    if (serverStatus === 'online' && isStale && status === 'idle') {
      void refresh();
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- fetch once per visit
  }, [serverStatus]);

  return {
    accounts: entry?.accounts ?? [],
    fetchedAt: entry?.fetchedAt ?? null,
    status: serverStatus === 'no-server' && !entry ? 'no-server' : status,
    refresh,
  };
}

export type AssetClass = 'us' | 'intl' | 'bonds' | 'cash' | 'other';

/** Best guess at a fund's asset class from its symbol and name. */
export function assetClass(holding: Holding): AssetClass {
  const text = `${holding.symbol} ${holding.description}`;
  if (/money market|cash|spaxx|fdrxx|spr?xx|fzfxx|core position/i.test(text)) {
    return 'cash';
  }
  if (/bond|treasury|income fund|aggregate|tips\b|fixed income/i.test(text)) {
    return 'bonds';
  }
  if (
    /international|intl|emerging|ex[- ]?us|global ex|developed|world ex/i.test(
      text,
    )
  ) {
    return 'intl';
  }
  if (/crypto|bitcoin|ethereum|gold|commodit/i.test(text)) {
    return 'other';
  }
  return 'us';
}
