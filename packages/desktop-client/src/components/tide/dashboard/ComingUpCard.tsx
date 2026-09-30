import { Trans, useTranslation } from 'react-i18next';

import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { Link } from '#components/common/Link';
import { tideCard, tideCardTitle, tideColors } from '#components/tide/tokens';
import { useTideMoney } from '#components/tide/useTideMoney';

import { scheduleAmount } from './useDashboardData';
import type { UpcomingRow } from './useDashboardData';

type ComingUpCardProps = {
  rows: ReadonlyArray<UpcomingRow>;
};

export function ComingUpCard({ rows }: ComingUpCardProps) {
  const { t } = useTranslation();
  const money = useTideMoney();
  const total = rows.reduce((sum, row) => sum + scheduleAmount(row._amount), 0);

  return (
    <View
      style={{
        ...tideCard,
        flex: '1 1 340px',
        minWidth: 0,
        padding: '22px 0 14px',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          padding: '0 24px 10px',
        }}
      >
        <h2 style={tideCardTitle}>
          <Trans>Coming up</Trans>
        </h2>
        <View
          style={{ fontSize: 13, fontWeight: 600, color: tideColors.subtle }}
        >
          {t('Next 14 days')}
        </View>
      </View>

      {rows.length === 0 ? (
        <View
          style={{
            padding: '12px 24px 8px',
            fontSize: 14,
            color: tideColors.subtle,
            gap: 8,
          }}
        >
          <Trans>No bills scheduled in the next two weeks.</Trans>
          <Link
            variant="internal"
            to="/schedules"
            style={{ fontWeight: 700, color: tideColors.teal }}
          >
            {t('Set up recurring bills →')}
          </Link>
        </View>
      ) : (
        <>
          {rows.map(row => {
            const amount = scheduleAmount(row._amount);
            return (
              <View
                key={row.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 24px',
                  borderTop: `1px solid ${tideColors.rowDivider}`,
                }}
              >
                <View
                  style={{
                    width: 44,
                    flexShrink: 0,
                    alignItems: 'center',
                    lineHeight: 1.1,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: tideColors.tealDark,
                      textTransform: 'uppercase',
                    }}
                  >
                    {monthUtils.format(row.next_date, 'MMM')}
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 800 }}>
                    {monthUtils.getDay(row.next_date)}
                  </span>
                </View>
                <View style={{ gap: 2, minWidth: 0, flex: 1 }}>
                  <View style={{ fontSize: 15, fontWeight: 600 }}>
                    {row.payeeName || row.name || t('Scheduled payment')}
                  </View>
                  <View style={{ fontSize: 13, color: tideColors.subtle }}>
                    {row.accountName ?? ''}
                  </View>
                </View>
                <View
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: amount > 0 ? tideColors.income : undefined,
                  }}
                >
                  {money(amount, { sign: true })}
                </View>
              </View>
            );
          })}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: '12px 24px 4px',
              borderTop: `1px solid ${tideColors.rowDivider}`,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <span>
              <Trans>Net scheduled</Trans>
            </span>
            <span>{money(total, { sign: true })}</span>
          </View>
        </>
      )}
    </View>
  );
}
