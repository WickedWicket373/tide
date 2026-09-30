import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { send } from '@actual-app/core/platform/client/connection';
import * as monthUtils from '@actual-app/core/shared/months';

import { CategoryAutocomplete } from '#components/autocomplete/CategoryAutocomplete';
import { Link } from '#components/common/Link';
import { CategoryPill } from '#components/tide/CategoryPill';
import { MerchantLogo } from '#components/tide/MerchantLogo';
import {
  tideCard,
  tideColors,
  tideSectionLabel,
} from '#components/tide/tokens';
import { useTideMoney } from '#components/tide/useTideMoney';

import { displayName } from './useTideTransactions';
import type { TideTransaction } from './useTideTransactions';

type TransactionDetailProps = {
  transaction: TideTransaction;
  isOnBudget: boolean;
};

async function updateTransaction(
  id: string,
  fields: { category?: string; notes?: string },
) {
  await send('transactions-batch-update', {
    updated: [{ id, ...fields }],
    learnCategories: true,
  });
}

export function TransactionDetail({
  transaction,
  isOnBudget,
}: TransactionDetailProps) {
  const { t } = useTranslation();
  const money = useTideMoney();
  const [isChoosingCategory, setIsChoosingCategory] = useState(false);
  const [notes, setNotes] = useState(transaction.notes ?? '');

  const name = displayName(transaction, t('No payee'));
  const bankText = transaction.imported_payee?.trim();
  const showBankText = bankText && bankText !== name;
  const isTransfer = !!transaction.transferAccount;
  const canCategorize = isOnBudget && !isTransfer;

  function saveNotes() {
    const next = notes.trim() ? notes : '';
    if (next !== (transaction.notes ?? '')) {
      void updateTransaction(transaction.id, { notes: next });
    }
  }

  return (
    <View
      aria-label={t('Transaction details')}
      style={{
        ...tideCard,
        padding: 24,
        gap: 20,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <MerchantLogo name={name} size={54} />
        <View style={{ minWidth: 0, gap: 3 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 21,
              fontWeight: 800,
              letterSpacing: '-0.015em',
              overflowWrap: 'anywhere',
            }}
          >
            {name}
          </h2>
          {showBankText && (
            <span
              style={{
                fontSize: 12.5,
                color: tideColors.subtle,
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                overflowWrap: 'anywhere',
              }}
            >
              {t('Bank shows: {{text}}', { text: bankText })}
            </span>
          )}
        </View>
      </View>

      <View style={{ gap: 4 }}>
        <span
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
            color: transaction.amount > 0 ? tideColors.income : theme.pageText,
          }}
        >
          {money(transaction.amount, { sign: transaction.amount > 0 })}
        </span>
        <span style={{ fontSize: 14, color: tideColors.subtle }}>
          {`${monthUtils.format(transaction.date, 'MMM d, yyyy')} · ${
            transaction.accountName ?? ''
          }`}
        </span>
      </View>

      <View style={{ gap: 10 }}>
        <span style={tideSectionLabel}>
          <Trans>Category</Trans>
        </span>
        {!canCategorize ? (
          <View style={{ fontSize: 14, color: tideColors.subtle }}>
            {isTransfer ? (
              <Trans>
                Transfers between your accounts don't need a category.
              </Trans>
            ) : (
              <Trans>Off-budget accounts don't use categories.</Trans>
            )}
          </View>
        ) : isChoosingCategory ? (
          <CategoryAutocomplete
            value={transaction.category}
            openOnFocus
            focused
            inputProps={{
              placeholder: t('Search categories…'),
              'aria-label': t('Category'),
              autoFocus: true,
              onBlur: () => setIsChoosingCategory(false),
            }}
            onClose={() => setIsChoosingCategory(false)}
            onSelect={id => {
              setIsChoosingCategory(false);
              if (id && id !== transaction.category) {
                void updateTransaction(transaction.id, { category: id });
              }
            }}
          />
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            {transaction.category ? (
              <CategoryPill id={transaction.category}>
                {transaction.categoryName}
              </CategoryPill>
            ) : (
              <CategoryPill id={null} tone="attention">
                <Trans>Needs category</Trans>
              </CategoryPill>
            )}
            <Button
              variant="normal"
              onPress={() => setIsChoosingCategory(true)}
              style={{ borderRadius: 10, fontWeight: 600, padding: '6px 12px' }}
            >
              {transaction.category ? t('Change') : t('Choose')}
            </Button>
          </View>
        )}
      </View>

      <View style={{ gap: 10 }}>
        <label htmlFor="tide-transaction-notes" style={tideSectionLabel}>
          <Trans>Notes</Trans>
        </label>
        <textarea
          id="tide-transaction-notes"
          value={notes}
          placeholder={t('Add a note')}
          onChange={e => setNotes(e.target.value)}
          onBlur={saveNotes}
          rows={2}
          style={{
            font: 'inherit',
            fontSize: 14,
            color: theme.pageText,
            padding: '10px 12px',
            borderRadius: 10,
            border: `1px solid ${theme.cardBorder}`,
            backgroundColor: theme.tableBackground,
            resize: 'vertical',
            minHeight: 56,
          }}
        />
      </View>

      <Link
        variant="internal"
        to={`/accounts/${transaction.account}`}
        style={{
          alignSelf: 'center',
          fontSize: 14,
          fontWeight: 700,
          color: tideColors.teal,
          textDecoration: 'none',
        }}
      >
        <Trans>Open in account register</Trans>
      </Link>
    </View>
  );
}
