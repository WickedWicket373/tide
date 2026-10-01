import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { View } from '@actual-app/components/view';

import { useSyncAndDownloadMutation } from '#accounts';
import { SvgTideRefresh } from '#components/tide/icons';
import { TidePage } from '#components/tide/TidePage';
import { replaceModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

import { AccountGroupCard } from './AccountGroupCard';
import { NetWorthCard } from './NetWorthCard';
import { OwnOweCard } from './OwnOweCard';
import { useNetWorthData } from './useNetWorthData';
import type { AccountKind, RangeId } from './useNetWorthData';

const KIND_ORDER: AccountKind[] = [
  'cash',
  'credit',
  'investments',
  'property',
  'vehicles',
  'other',
  'loans',
];

const KIND_COLORS: Record<AccountKind, string> = {
  cash: '#5ed3b5',
  investments: '#0e7c72',
  property: '#8fa8d6',
  vehicles: '#b6a2e0',
  other: '#9aa8a4',
  credit: '#e8c08f',
  loans: '#c97a32',
};

export function TideAccounts() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [range, setRange] = useState<RangeId>('1M');
  const syncAndDownload = useSyncAndDownloadMutation();
  const { days, total, accounts } = useNetWorthData(range);

  const kindLabel: Record<AccountKind, string> = {
    cash: t('Cash'),
    credit: t('Credit cards'),
    investments: t('Investments'),
    property: t('Property'),
    vehicles: t('Vehicles'),
    other: t('Other assets'),
    loans: t('Loans'),
  };

  const groups = KIND_ORDER.map(kind => ({
    kind,
    items: accounts.filter(item => item.kind === kind),
  })).filter(group => group.items.length > 0);

  const assets = groups
    .map(group => ({
      label: kindLabel[group.kind],
      color: KIND_COLORS[group.kind],
      amount: group.items.reduce(
        (sum, item) => sum + Math.max(0, item.balance),
        0,
      ),
    }))
    .filter(slice => slice.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const debts = groups
    .map(group => ({
      label: kindLabel[group.kind],
      color: KIND_COLORS[group.kind],
      amount: group.items.reduce(
        (sum, item) => sum + Math.max(0, -item.balance),
        0,
      ),
    }))
    .filter(slice => slice.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <TidePage
      title={t('Accounts')}
      actions={
        <>
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
            {syncAndDownload.isPending ? t('Syncing…') : t('Sync all')}
          </Button>
          <Button
            variant="primary"
            onPress={() =>
              dispatch(
                replaceModal({ modal: { name: 'add-account', options: {} } }),
              )
            }
            style={{
              height: 40,
              padding: '0 16px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <Trans>Add account</Trans>
          </Button>
        </>
      }
    >
      <NetWorthCard
        days={days}
        total={total}
        range={range}
        onRangeChange={setRange}
      />
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 20,
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: '2 1 560px', minWidth: 0, gap: 16 }}>
          {groups.map(group => (
            <AccountGroupCard
              key={group.kind}
              title={kindLabel[group.kind]}
              items={group.items}
            />
          ))}
        </View>
        <View style={{ flex: '1 1 320px', minWidth: 0 }}>
          <OwnOweCard assets={assets} debts={debts} />
        </View>
      </View>
    </TidePage>
  );
}
