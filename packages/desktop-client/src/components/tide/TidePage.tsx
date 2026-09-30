import type { ReactNode } from 'react';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

type TidePageProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

/** Page frame shared by Tide screens: title row plus a centered column. */
export function TidePage({
  title,
  subtitle,
  actions,
  children,
}: TidePageProps) {
  return (
    <View
      role="main"
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '44px clamp(16px, 3vw, 40px) 56px',
        color: theme.pageText,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <View style={{ gap: 4 }}>
            {subtitle && (
              <View
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: theme.pageTextLight,
                }}
              >
                {subtitle}
              </View>
            )}
            <h1
              style={{
                margin: 0,
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: '-0.025em',
              }}
            >
              {title}
            </h1>
          </View>
          {actions && (
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              {actions}
            </View>
          )}
        </View>
        {children}
      </View>
    </View>
  );
}
