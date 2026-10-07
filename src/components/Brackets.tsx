import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { color } from '../theme/tokens';

// Moldura de mira: quatro cantos em L. É o motivo visual do BLACK NODE
// (a mesma linguagem do visor do scanner). Use no máximo uma vez por tela.

type Props = {
  children?: ReactNode;
  tone?: string;
  size?: number;
  thickness?: number;
  style?: StyleProp<ViewStyle>;
};

export function Brackets({ children, tone = color.primary, size = 22, thickness = 3, style }: Props) {
  const corner = { width: size, height: size, borderColor: tone, position: 'absolute' as const };
  return (
    <View style={style}>
      <View pointerEvents="none" style={[corner, { top: 0, left: 0, borderTopWidth: thickness, borderLeftWidth: thickness }]} />
      <View pointerEvents="none" style={[corner, { top: 0, right: 0, borderTopWidth: thickness, borderRightWidth: thickness }]} />
      <View pointerEvents="none" style={[corner, { bottom: 0, left: 0, borderBottomWidth: thickness, borderLeftWidth: thickness }]} />
      <View pointerEvents="none" style={[corner, { bottom: 0, right: 0, borderBottomWidth: thickness, borderRightWidth: thickness }]} />
      {children}
    </View>
  );
}

