import { Text, type TextProps } from 'react-native';
import { color } from '../theme/tokens';
import { typography, type TypeVariant } from '../theme/type';

type Props = TextProps & {
  variant?: TypeVariant;
  tone?: string;
  center?: boolean;
};

// Textos de interface (rótulos, botões) limitam o Dynamic Type; textos de leitura não.
const CHROME: TypeVariant[] = ['label', 'button', 'hero', 'display'];

export function Txt({ variant = 'body', tone = color.text, center, style, ...rest }: Props) {
  return (
    <Text
      maxFontSizeMultiplier={CHROME.includes(variant) ? 1.3 : undefined}
      style={[typography[variant], { color: tone, includeFontPadding: false }, center && { textAlign: 'center' }, style]}
      {...rest}
    />
  );
}
