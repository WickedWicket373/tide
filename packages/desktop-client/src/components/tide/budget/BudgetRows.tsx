import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import {
  categoryTone,
  progressColor,
  tideColors,
  tidePill,
} from '#components/tide/tokens';
import { useTideMoney } from '#components/tide/useTideMoney';

import { saveBudgetAmount, useCategoryNumbers } from './useBudgetValues';

export const BUDGET_COLUMNS =
  'minmax(0, 1fr) minmax(96px, 130px) minmax(80px, 130px) minmax(80px, 130px)';

export const numberCell: CSSProperties = {
  textAlign: 'right',
  fontSize: 15,
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
};

export function RemainingPill({ amount }: { amount: number }) {
  const money = useTideMoney();
  const colors =
    amount < 0
      ? [tideColors.overPillBg, tideColors.overPillText]
      : amount > 0
        ? [tideColors.goodPillBg, tideColors.tealDark]
        : [tideColors.zeroPillBg, tideColors.zeroPillText];
  return (
    <View style={{ alignItems: 'flex-end' }}>
      <span style={{ ...tidePill(colors[0], colors[1]), padding: '3px 10px' }}>
        {money(amount, { decimals: false })}
      </span>
    </View>
  );
}

function CategoryName({ id, name }: { id: string; name: string }) {
  const tone = categoryTone(id);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        minWidth: 0,
        fontSize: 15,
        fontWeight: 700,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 24,
          height: 24,
          flexShrink: 0,
          borderRadius: 8,
          backgroundColor: tone.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: tone.dot,
          }}
        />
      </span>
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </span>
    </View>
  );
}

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <View
      style={{
        gridColumn: '1 / -1',
        height: 6,
        borderRadius: 3,
        backgroundColor: tideColors.track,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: 6,
          borderRadius: 3,
          width: `${Math.max(0, Math.min(100, percent))}%`,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

type BudgetInputProps = {
  month: string;
  categoryId: string;
  categoryName: string;
  amount: number;
};

function BudgetInput({
  month,
  categoryId,
  categoryName,
  amount,
}: BudgetInputProps) {
  const { t } = useTranslation();
  const money = useTideMoney();
  const [draft, setDraft] = useState<string | null>(null);
  const [isInvalid, setIsInvalid] = useState(false);

  async function commit() {
    if (draft === null) return;
    const ok = await saveBudgetAmount(month, categoryId, draft);
    setIsInvalid(!ok);
    if (ok) setDraft(null);
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      aria-label={t('Budget for {{category}}', { category: categoryName })}
      aria-invalid={isInvalid || undefined}
      value={draft ?? money(amount, { decimals: amount % 100 !== 0 })}
      onFocus={e => {
        setDraft((amount / 100).toFixed(amount % 100 === 0 ? 0 : 2));
        const input = e.currentTarget;
        requestAnimationFrame(() => input.select());
      }}
      onChange={e => setDraft(e.target.value)}
      onBlur={() => void commit()}
      onKeyDown={e => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') {
          setDraft(null);
          setIsInvalid(false);
          e.currentTarget.blur();
        }
      }}
      style={{
        ...numberCell,
        width: '100%',
        boxSizing: 'border-box',
        height: 36,
        padding: '0 10px',
        borderRadius: 9,
        border: `1px solid ${isInvalid ? tideColors.over : theme.cardBorder}`,
        backgroundColor: theme.tableBackground,
        color: theme.pageText,
        fontFamily: 'inherit',
      }}
    />
  );
}

const rowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: BUDGET_COLUMNS,
  alignItems: 'center',
  columnGap: 16,
  rowGap: 10,
  padding: '12px 22px 14px',
  borderTop: `1px solid ${tideColors.rowDivider}`,
};

type ExpenseRowProps = {
  month: string;
  id: string;
  name: string;
};

export function ExpenseRow({ month, id, name }: ExpenseRowProps) {
  const money = useTideMoney();
  const { budgeted, sum, balance } = useCategoryNumbers(id);
  const spent = -sum;
  const percent = budgeted > 0 ? (spent / budgeted) * 100 : spent > 0 ? 100 : 0;

  return (
    <View style={rowStyle}>
      <CategoryName id={id} name={name} />
      <BudgetInput
        month={month}
        categoryId={id}
        categoryName={name}
        amount={budgeted}
      />
      <span style={numberCell}>{money(spent, { decimals: false })}</span>
      <RemainingPill amount={balance} />
      <ProgressBar
        percent={percent}
        color={
          balance < 0 ? tideColors.over : progressColor(Math.min(percent, 100))
        }
      />
    </View>
  );
}

type IncomeRowProps = ExpenseRowProps & { isTracking: boolean };

export function IncomeRow({ month, id, name, isTracking }: IncomeRowProps) {
  const money = useTideMoney();
  const { budgeted, sum } = useCategoryNumbers(id);
  const expected = Math.max(0, budgeted - sum);

  return (
    <View style={rowStyle}>
      <CategoryName id={id} name={name} />
      {isTracking ? (
        <BudgetInput
          month={month}
          categoryId={id}
          categoryName={name}
          amount={budgeted}
        />
      ) : (
        <span />
      )}
      <span style={{ ...numberCell, color: tideColors.income }}>
        {money(sum, { decimals: false })}
      </span>
      {isTracking ? <RemainingPill amount={expected} /> : <span />}
      {isTracking && (
        <ProgressBar
          percent={budgeted > 0 ? (sum / budgeted) * 100 : 0}
          color={tideColors.onTrack}
        />
      )}
    </View>
  );
}

type SectionHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  columns: Array<{ label: ReactNode; value: ReactNode; color?: string }>;
};

export function SectionHeader({
  title,
  subtitle,
  columns,
}: SectionHeaderProps) {
  return (
    <View
      style={{
        display: 'grid',
        gridTemplateColumns: BUDGET_COLUMNS,
        alignItems: 'end',
        columnGap: 16,
        padding: '16px 22px 14px',
        backgroundColor: tideColors.headerBand,
      }}
    >
      <View style={{ gap: 2, minWidth: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 800 }}>{title}</span>
        {subtitle && (
          <span style={{ fontSize: 13, color: tideColors.subtle }}>
            {subtitle}
          </span>
        )}
      </View>
      {columns.map((column, i) => (
        <View key={i} style={{ alignItems: 'flex-end', gap: 2 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: tideColors.label,
            }}
          >
            {column.label}
          </span>
          <span style={{ ...numberCell, color: column.color }}>
            {column.value}
          </span>
        </View>
      ))}
    </View>
  );
}
