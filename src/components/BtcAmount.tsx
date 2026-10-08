import { StyleSheet, View } from 'react-native';
import { color, space } from '../theme/tokens';
import { Txt } from './Txt';

// Número principal da carteira. Algarismos em display, unidade em mono.
// `millions`: no roteiro do hacker cada bloco vale 1 milhão ("6 MI BTC").
export function BtcAmount({ value, tone = color.text, millions }: { value: number; tone?: string; millions?: boolean }) {
  const label = millions ? `${value} ${value === 1 ? 'milhão' : 'milhões'} de BTC` : `${value} BTC`;
  return (
    <View style={styles.row} accessible accessibilityLabel={label}>
      <Txt variant="hero" tone={tone}>
        {value}
      </Txt>
      <Txt variant="title" tone={color.muted} style={styles.unit}>
        {millions ? 'MI BTC' : 'BTC'}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  unit: { marginBottom: space.md },
});
