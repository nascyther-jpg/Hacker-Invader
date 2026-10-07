import { StyleSheet, View } from 'react-native';
import { color, space } from '../theme/tokens';
import { Txt } from './Txt';

// Número principal da carteira. Algarismos em display, unidade em mono.
export function BtcAmount({ value, tone = color.text }: { value: number; tone?: string }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${value} BTC`}>
      <Txt variant="hero" tone={tone}>
        {value}
      </Txt>
      <Txt variant="title" tone={color.muted} style={styles.unit}>
        BTC
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  unit: { marginBottom: space.md },
});
