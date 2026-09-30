import type { CSSProperties } from 'react';

import { theme } from '@actual-app/components/theme';

/**
 * Tide design tokens. Colors that exist in the theme come from `theme` so the
 * Tide theme (tide.css) stays the single source of truth; the rest are Tide
 * accents with no stock-theme equivalent. Spec: tide/DESIGN.md.
 */
export const tideColors = {
  teal: '#0e7c72',
  tealDark: '#0a5f57',
  tealSoft: '#dff2ec',
  tealSofter: '#f1f8f6',
  mint: '#5ed3b5',
  mintStrong: '#3fbf9e',
  onTrack: '#1c9585',
  nearLimit: '#d9a21b',
  over: '#c94a31',
  overPillBg: '#fbe7e2',
  overPillText: '#a73a24',
  goodPillBg: '#e1f4ee',
  zeroPillBg: '#edf1f0',
  zeroPillText: '#4e5c58',
  income: '#0a6e57',
  track: '#e8eeec',
  rowDivider: '#eef2f1',
  headerBand: '#f8faf9',
  subtle: '#5b6a65',
  label: '#4e5c58',
  lastPeriod: '#9aa8a4',
} as const;

export const tideCard: CSSProperties = {
  backgroundColor: theme.cardBackground,
  border: `1px solid ${theme.cardBorder}`,
  borderRadius: 16,
};

export const tideCardTitle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  letterSpacing: '-0.01em',
  color: theme.pageText,
};

export const tideSectionLabel: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: tideColors.label,
};

export const tidePill = (background: string, color: string): CSSProperties => ({
  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  padding: '4px 12px',
  borderRadius: 999,
  backgroundColor: background,
  color,
  fontSize: 13,
  fontWeight: 700,
  whiteSpace: 'nowrap',
});

/** Progress bar color for spent/budgeted, per DESIGN.md. */
export function progressColor(percent: number, isFixed = false) {
  if (percent > 100) return tideColors.over;
  if (!isFixed && percent >= 90) return tideColors.nearLimit;
  return tideColors.onTrack;
}

const CATEGORY_TONES: ReadonlyArray<{ bg: string; fg: string; dot: string }> = [
  { bg: '#e1f4ee', fg: '#0a6e57', dot: '#2fa36b' },
  { bg: '#fbe7e1', fg: '#b3452b', dot: '#e26b4a' },
  { bg: '#ece6fa', fg: '#5b3fb0', dot: '#8466d8' },
  { bg: '#fbf0d6', fg: '#8a6410', dot: '#d9a21b' },
  { bg: '#f1e7dd', fg: '#7a5230', dot: '#a0724a' },
  { bg: '#e2ebfb', fg: '#2f5db8', dot: '#4f7fda' },
  { bg: '#dff0f8', fg: '#1f6d9a', dot: '#3a8dc2' },
  { bg: '#fae4ee', fg: '#a8386b', dot: '#d2588f' },
];

/** Stable soft color for a category pill, picked from its id. */
export function categoryTone(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_TONES[hash % CATEGORY_TONES.length];
}
