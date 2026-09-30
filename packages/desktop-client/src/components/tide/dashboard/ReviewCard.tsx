import { Trans, useTranslation } from 'react-i18next';

import { View } from '@actual-app/components/view';

import { Link } from '#components/common/Link';
import { SvgTideCheck } from '#components/tide/icons';
import { MerchantLogo } from '#components/tide/MerchantLogo';
import { TideCountBadge } from '#components/tide/TideCountBadge';
import { tideCard, tideCardTitle, tideColors } from '#components/tide/tokens';
import { useTideMoney } from '#components/tide/useTideMoney';

import type { ReviewRow } from './useDashboardData';

type ReviewCardProps = {
  rows: ReadonlyArray<ReviewRow>;
  totalCount: number;
};

/**
 * Transactions that still need attention: on-budget spending with no
 * category yet. Links into the Transactions page's "To review" view.
 */
export function ReviewCard({ rows, totalCount }: ReviewCardProps) {
  const { t } = useTranslation();
  const money = useTideMoney();
  const reviewPath = '/transactions?view=review';

  return (
    <View
      style={{
        ...tideCard,
        flex: '2 1 340px',
        minWidth: 0,
        padding: '22px 0 10px',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '0 24px 12px',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <h2 style={tideCardTitle}>
            <Trans>To review</Trans>
          </h2>
          {totalCount > 0 && <TideCountBadge count={totalCount} />}
        </View>
      </View>

      {rows.length === 0 ? (
        <View
          style={{
            alignItems: 'center',
            gap: 10,
            padding: '36px 24px',
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
            <Trans>You're all caught up</Trans>
          </View>
          <View
            style={{ fontSize: 14, color: tideColors.subtle, maxWidth: 260 }}
          >
            <Trans>
              Every transaction has a category. New ones show up here after your
              next bank sync.
            </Trans>
          </View>
        </View>
      ) : (
        <View>
          {rows.map(row => {
            const name =
              row.payeeName || row.importedPayee || t('Unknown payee');
            return (
              <Link
                key={row.id}
                variant="internal"
                to={reviewPath}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 24px',
                  borderTop: `1px solid ${tideColors.rowDivider}`,
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                <MerchantLogo name={name} />
                <View style={{ gap: 3, minWidth: 0, flex: 1 }}>
                  <View
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {name}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      alignSelf: 'flex-start',
                      padding: '3px 10px',
                      borderRadius: 999,
                      backgroundColor: '#fdf1d8',
                      color: '#7f5500',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: tideColors.nearLimit,
                      }}
                    />
                    <Trans>Needs a category</Trans>
                  </View>
                </View>
                <View
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: row.amount > 0 ? tideColors.income : undefined,
                  }}
                >
                  {money(row.amount, { sign: true })}
                </View>
              </Link>
            );
          })}
        </View>
      )}

      <Link
        variant="internal"
        to={reviewPath}
        style={{
          margin: '4px 24px 8px',
          minHeight: 40,
          display: 'flex',
          alignItems: 'center',
          fontSize: 14,
          fontWeight: 700,
          color: tideColors.teal,
          textDecoration: 'none',
        }}
      >
        {rows.length ? t('Review all →') : t('See all transactions →')}
      </Link>
    </View>
  );
}
