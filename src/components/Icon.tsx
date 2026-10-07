import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { color } from '../theme/tokens';

// Família única de ícones do app.
export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const SIZE = { sm: 20, md: 26, lg: 40, xl: 64 } as const;

export function Icon({
  name,
  size = 'md',
  tone = color.text,
}: {
  name: IconName;
  size?: keyof typeof SIZE;
  tone?: string;
}) {
  return <MaterialCommunityIcons name={name} size={SIZE[size]} color={tone} />;
}
