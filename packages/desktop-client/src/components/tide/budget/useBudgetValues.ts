import { send } from '@actual-app/core/platform/client/connection';
import {
  amountToInteger,
  currencyToAmount,
} from '@actual-app/core/shared/util';

import { useSheetValue } from '#hooks/useSheetValue';
import { useSyncedPref } from '#hooks/useSyncedPref';
import type { Binding, SheetFields } from '#spreadsheet';
import { envelopeBudget, trackingBudget } from '#spreadsheet/bindings';

type BudgetSheet = 'envelope-budget' | 'tracking-budget';

/** Reads one number from the current month's budget sheet (0 when empty). */
export function useBudgetNumber(
  binding: Binding<BudgetSheet, SheetFields<BudgetSheet>>,
): number {
  return Number(
    useSheetValue<BudgetSheet, SheetFields<BudgetSheet>>(binding) ?? 0,
  );
}

/** The sheet bindings for the budget type this file uses. */
export function useBudgetBindings() {
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  const isTracking = budgetType === 'tracking';
  return {
    isTracking,
    bindings: isTracking ? trackingBudget : envelopeBudget,
  };
}

/** Budgeted, spent (positive for money out) and remaining for a category. */
export function useCategoryNumbers(id: string) {
  const { bindings } = useBudgetBindings();
  const budgeted = useBudgetNumber(bindings.catBudgeted(id));
  const sum = useBudgetNumber(bindings.catSumAmount(id));
  const balance = useBudgetNumber(bindings.catBalance(id));
  return { budgeted, sum, balance };
}

/** Same numbers for a whole category group. */
export function useGroupNumbers(id: string) {
  const { bindings } = useBudgetBindings();
  const budgeted = useBudgetNumber(bindings.groupBudgeted(id));
  const sum = useBudgetNumber(bindings.groupSumAmount(id));
  const balance = useBudgetNumber(bindings.groupBalance(id));
  return { budgeted, sum, balance };
}

/**
 * Parses what the user typed into a budget cell ("1,250", "$80.50") and
 * saves it. Returns false when the text isn't an amount.
 */
export async function saveBudgetAmount(
  month: string,
  category: string,
  text: string,
) {
  const amount = currencyToAmount(text.replace(/[^0-9.,-]/g, '') || '0');
  if (amount == null) {
    return false;
  }
  await send('budget/budget-amount', {
    month,
    category,
    amount: amountToInteger(amount),
  });
  return true;
}

/** A field that only exists in the envelope budget sheet. */
export function useEnvelopeNumber(field: SheetFields<'envelope-budget'>) {
  return Number(
    useSheetValue<'envelope-budget', SheetFields<'envelope-budget'>>(field) ??
      0,
  );
}

/** A field that only exists in the tracking budget sheet. */
export function useTrackingNumber(field: SheetFields<'tracking-budget'>) {
  return Number(
    useSheetValue<'tracking-budget', SheetFields<'tracking-budget'>>(field) ??
      0,
  );
}
