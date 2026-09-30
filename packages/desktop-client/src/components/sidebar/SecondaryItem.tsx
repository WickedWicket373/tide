// @ts-strict-ignore
import React from 'react';
import type {
  ComponentProps,
  ComponentType,
  CSSProperties,
  SVGProps,
} from 'react';

import { Block } from '@actual-app/components/block';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { tideColors } from '#components/tide/tokens';

import { accountNameStyle } from './Account';
import { ItemContent } from './ItemContent';

const fontWeight = 600;

type SecondaryItemProps = {
  title: string;
  to?: string;
  Icon?:
    | ComponentType<SVGProps<SVGElement>>
    | ComponentType<SVGProps<SVGSVGElement>>;
  style?: CSSProperties;
  onClick?: ComponentProps<typeof ItemContent>['onClick'];
  bold?: boolean;
  indent?: number;
  dataTestId?: string;
};

export function SecondaryItem({
  Icon,
  title,
  style,
  to,
  onClick,
  bold,
  indent = 0,
  dataTestId,
}: SecondaryItemProps) {
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 20,
      }}
    >
      {Icon && <Icon width={16} height={16} />}
      <Block style={{ marginLeft: Icon ? 10 : 0, color: 'inherit' }}>
        {title}
      </Block>
    </View>
  );

  return (
    <View data-testid={dataTestId} style={{ flexShrink: 0, ...style }}>
      <ItemContent
        style={{
          ...accountNameStyle,
          fontSize: 14,
          color: theme.sidebarItemText,
          paddingTop: 8,
          paddingBottom: 8,
          margin: '1px 10px',
          borderRadius: 9,
          paddingLeft: 12 + indent,
          fontWeight: bold ? fontWeight : null,
          ':hover': { backgroundColor: theme.sidebarItemBackgroundHover },
        }}
        to={to}
        onClick={onClick}
        activeStyle={{
          backgroundColor: tideColors.tealSoft,
          color: theme.sidebarItemTextSelected,
          fontWeight: bold ? fontWeight : null,
        }}
      >
        {content}
      </ItemContent>
    </View>
  );
}
