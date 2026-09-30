import type { ReactNode } from 'react';

import { View } from '@actual-app/components/view';

import { categoryTone, tidePill } from '#components/tide/tokens';

type CategoryPillProps = {
  /** Category id, used to pick a stable color. Null for neutral pills. */
  id: string | null;
  children: ReactNode;
  tone?: 'neutral' | 'attention';
};

const NEUTRAL = { bg: '#eef2f1', fg: '#4e5c58', dot: '#7a8783' };
const ATTENTION = { bg: '#fdf3dc', fg: '#8a6410', dot: '#d9a21b' };

export function CategoryPill({ id, children, tone }: CategoryPillProps) {
  const colors =
    tone === 'attention'
      ? ATTENTION
      : tone === 'neutral' || !id
        ? NEUTRAL
        : categoryTone(id);
  return (
    <View
      style={{
        ...tidePill(colors.bg, colors.fg),
        padding: '3px 10px',
        fontSize: 12.5,
        maxWidth: '100%',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          flexShrink: 0,
          borderRadius: '50%',
          backgroundColor: colors.dot,
        }}
      />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {children}
      </span>
    </View>
  );
}
