import { useFormat } from '#hooks/useFormat';
import { useSyncedPref } from '#hooks/useSyncedPref';

type MoneyOptions = {
  /** Show cents. Defaults to true. */
  decimals?: boolean;
  /** Prefix positive amounts with "+". */
  sign?: boolean;
};

/**
 * Formats Actual integer amounts (cents) the Tide way: currency symbol always
 * shown (falling back to "$" when no currency is set) and "-"/"+" in front.
 */
export function useTideMoney() {
  const format = useFormat();
  const [currencyCode] = useSyncedPref('defaultCurrencyCode');

  return (
    amount: number,
    { decimals = true, sign = false }: MoneyOptions = {},
  ) => {
    const body = format(
      Math.abs(amount),
      decimals ? 'financial' : 'financial-no-decimals',
    );
    const withSymbol = currencyCode ? body : `$${body}`;
    const prefix = amount < 0 ? '-' : sign && amount > 0 ? '+' : '';
    return prefix + withSymbol;
  };
}
