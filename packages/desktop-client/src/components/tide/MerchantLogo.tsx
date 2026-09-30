import { View } from '@actual-app/components/view';

const LOGO_COLORS = [
  '#27466e',
  '#9e3b32',
  '#b7860b',
  '#7a3b21',
  '#2f3b4a',
  '#2b7a4b',
  '#2c4f93',
  '#8c1c24',
  '#5e6e69',
  '#6a4c93',
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return LOGO_COLORS[hash % LOGO_COLORS.length];
}

type MerchantLogoProps = {
  name: string;
  size?: number;
};

/**
 * Circle with the merchant's initial. Stands in until real merchant logos
 * (phase 3) are available.
 */
export function MerchantLogo({ name, size = 38 }: MerchantLogoProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <View
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        backgroundColor: colorFor(name),
        color: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.round(size * 0.4),
        fontWeight: 700,
      }}
    >
      {initial}
    </View>
  );
}
