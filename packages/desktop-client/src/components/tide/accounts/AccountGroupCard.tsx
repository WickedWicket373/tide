import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type { TFunction } from 'i18next';

import { Link } from '#components/common/Link';
import { MerchantLogo } from '#components/tide/MerchantLogo';
import { tideCard, tideColors } from '#components/tide/tokens';
import { useTideMoney } from '#components/tide/useTideMoney';

import { Sparkline } from './Sparkline';
import type { AccountSeries } from './useNetWorthData';

function syncedLabel(lastSync: string | null, t: TFunction) {
  if (!lastSync) return null;
  const ms = Number(lastSync);
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const minutes = Math.max(0, Math.round((Date.now() - ms) / 60000));
  if (minutes < 2) return t('just now');
  if (minutes < 60) return t('{{count}} min ago', { count: minutes });
  const hours = Math.round(minutes / 60);
  if (hours < 48) return t('{{count}} hours ago', { count: hours });
  return t('{{count}} days ago', { count: Math.round(hours / 24) });
}

type AccountGroupCardProps = {
  title: string;
  items: AccountSeries[];
};

export function AccountGroupCard({ title, items }: AccountGroupCardProps) {
  const { t } = useTranslation();
  const money = useTideMoney();
  const total = items.reduce((sum, item) => sum + item.balance, 0);
  const startTotal = items.reduce(
    (sum, item) => sum + (item.series[0] ?? 0),
    0,
  );
  const change = total - startTotal;
  const percent = startTotal !== 0 ? (change / Math.abs(startTotal)) * 100 : 0;

  return (
    <View
      aria-label={title}
      style={{ ...tideCard, overflow: 'hidden', flexShrink: 0 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          padding: '16px 22px',
          borderBottom: `1px solid ${tideColors.rowDivider}`,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{title}</h2>
          {change !== 0 && (
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: change > 0 ? tideColors.tealDark : tideColors.over,
              }}
            >
              {startTotal !== 0
                ? t('{{amount}} ({{percent}}%) in this period', {
                    amount: money(change, { decimals: false, sign: true }),
                    percent: Math.abs(percent).toFixed(1),
                  })
                : t('{{amount}} in this period', {
                    amount: money(change, { decimals: false, sign: true }),
                  })}
            </span>
          )}
        </View>
        <span style={{ fontSize: 18, fontWeight: 800 }}>{money(total)}</span>
      </View>
      {items.map(({ account, balance, series }) => {
        const synced = syncedLabel(account.last_sync, t);
        const detail = [
          account.offbudget ? t('Off budget') : t('On budget'),
          account.bankName,
        ]
          .filter(Boolean)
          .join(' · ');
        return (
          <Link
            key={account.id}
            variant="internal"
            to={`/accounts/${account.id}`}
            style={{
              display: 'grid',
              gridTemplateColumns:
                '40px minmax(0, 1fr) auto minmax(max-content, 130px)',
              alignItems: 'center',
              columnGap: 14,
              padding: '12px 22px',
              borderTop: `1px solid ${tideColors.rowDivider}`,
              color: theme.pageText,
              textDecoration: 'none',
            }}
          >
            <MerchantLogo name={account.bankName || account.name} size={40} />
            <View style={{ minWidth: 0, gap: 2 }}>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {account.name}
              </span>
              <span style={{ fontSize: 12.5, color: tideColors.subtle }}>
                {detail}
              </span>
            </View>
            <Sparkline
              values={series}
              color={balance < 0 ? tideColors.over : tideColors.teal}
            />
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {money(balance)}
              </span>
              {synced && (
                <span style={{ fontSize: 12, color: tideColors.subtle }}>
                  {synced}
                </span>
              )}
            </View>
          </Link>
        );
      })}
    </View>
  );
}
