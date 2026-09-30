import { Text } from '@actual-app/components/text';

import { tideColors } from './tokens';

type TideCountBadgeProps = {
  count: number;
};

/** Small teal count pill, e.g. the number of transactions to review. */
export function TideCountBadge({ count }: TideCountBadgeProps) {
  return (
    <Text
      style={{
        minWidth: 22,
        height: 22,
        padding: '0 7px',
        boxSizing: 'border-box',
        borderRadius: 999,
        backgroundColor: tideColors.teal,
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {count > 99 ? '99+' : count}
    </Text>
  );
}
