import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { CategoryPill } from '#components/tide/CategoryPill';
import { MerchantLogo } from '#components/tide/MerchantLogo';
import { tideColors } from '#components/tide/tokens';
import { useTideMoney } from '#components/tide/useTideMoney';

import { displayName } from './useTideTransactions';
import type { TideTransaction } from './useTideTransactions';

type TransactionRowProps = {
  transaction: TideTransaction;
  needsReview: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

export function TransactionRow({
  transaction,
  needsReview,
  isSelected,
  onSelect,
}: TransactionRowProps) {
  const { t } = useTranslation();
  const money = useTideMoney();
  const name = displayName(transaction, t('No payee'));
  const isIncome = transaction.amount > 0;

  return (
    <Button
      variant="bare"
      aria-pressed={isSelected}
      onPress={() => onSelect(transaction.id)}
      style={({ isHovered }) => ({
        display: 'grid',
        gridTemplateColumns:
          '10px 38px minmax(0, 1.4fr) minmax(0, 1fr) minmax(max-content, auto)',
        alignItems: 'center',
        columnGap: 12,
        width: '100%',
        padding: '12px 20px 12px 14px',
        borderRadius: 0,
        borderBottom: `1px solid ${tideColors.rowDivider}`,
        textAlign: 'left',
        color: theme.pageText,
        backgroundColor: isSelected
          ? '#f1faf7'
          : isHovered
            ? '#f7faf9'
            : 'transparent',
      })}
    >
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: needsReview ? tideColors.onTrack : 'transparent',
        }}
      />
      <MerchantLogo name={name} />
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
          {name}
          {needsReview && (
            <span
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                overflow: 'hidden',
                clip: 'rect(0 0 0 0)',
              }}
            >
              <Trans>(needs review)</Trans>
            </span>
          )}
        </span>
        <span
          style={{
            fontSize: 12.5,
            color: tideColors.subtle,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {transaction.accountName}
        </span>
      </View>
      <View style={{ alignItems: 'flex-start', minWidth: 0 }}>
        {transaction.transferAccount ? (
          <CategoryPill id={null} tone="neutral">
            <Trans>Transfer</Trans>
          </CategoryPill>
        ) : transaction.category ? (
          <CategoryPill id={transaction.category}>
            {transaction.categoryName}
          </CategoryPill>
        ) : needsReview ? (
          <CategoryPill id={null} tone="attention">
            <Trans>Needs category</Trans>
          </CategoryPill>
        ) : (
          <CategoryPill id={null} tone="neutral">
            <Trans>Off budget</Trans>
          </CategoryPill>
        )}
      </View>
      <span
        style={{
          fontSize: 15,
          fontWeight: 700,
          textAlign: 'right',
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
          color: isIncome ? tideColors.income : theme.pageText,
        }}
      >
        {money(transaction.amount, { sign: isIncome })}
      </span>
    </Button>
  );
}
