import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { cut as cuts } from '../theme/tokens';

// Forma base do estilo Cyberpunk: retângulo com cantos cortados em 45°.
// Desenhada em SVG atrás do conteúdo, então funciona igual em iOS, Android e web.

export type Corner = 'tl' | 'tr' | 'br' | 'bl';

type Props = {
  children?: ReactNode;
  cut?: keyof typeof cuts | number;
  corners?: Corner[];
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  /** Cor do brilho em volta da borda. Um elemento por tela. */
  glow?: string;
  style?: StyleProp<ViewStyle>;
};

export function Chamfer({
  children,
  cut = 'md',
  corners = ['tl', 'br'],
  fill = 'transparent',
  stroke,
  strokeWidth = 1.5,
  glow,
  style,
}: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  const c = typeof cut === 'number' ? cut : cuts[cut];
  const points = shape(size.w, size.h, c, corners, stroke ? strokeWidth / 2 : 0);

  return (
    <View style={style} onLayout={onLayout}>
      {size.w > 0 ? (
        <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill} pointerEvents="none">
          {glow ? <Polygon points={points} fill="none" stroke={glow} strokeWidth={8} strokeOpacity={0.35} /> : null}
          <Polygon points={points} fill={fill} stroke={stroke ?? 'none'} strokeWidth={stroke ? strokeWidth : 0} />
        </Svg>
      ) : null}
      {children}
    </View>
  );
}

function shape(w: number, h: number, c: number, corners: Corner[], inset: number): string {
  const has = (k: Corner) => corners.includes(k);
  const l = inset;
  const t = inset;
  const r = w - inset;
  const b = h - inset;
  const k = Math.min(c, w / 2, h / 2);
  const pts: [number, number][] = [];
  if (has('tl')) pts.push([l, t + k], [l + k, t]);
  else pts.push([l, t]);
  if (has('tr')) pts.push([r - k, t], [r, t + k]);
  else pts.push([r, t]);
  if (has('br')) pts.push([r, b - k], [r - k, b]);
  else pts.push([r, b]);
  if (has('bl')) pts.push([l + k, b], [l, b - k]);
  else pts.push([l, b]);
  return pts.map(([x, y]) => `${x},${y}`).join(' ');
}
