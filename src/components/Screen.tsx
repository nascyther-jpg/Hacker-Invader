import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, space, touch } from '../theme/tokens';
import { Chamfer } from './Chamfer';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Txt } from './Txt';

type HeaderAction = { icon: IconName; label: string; onPress: () => void };

type Props = {
  children: ReactNode;
  /** Rótulo mono do cabeçalho (ex.: "PISTA 02"). */
  title?: string;
  left?: HeaderAction;
  right?: HeaderAction;
  /** Ações fixas no rodapé, respeitando a área segura. */
  footer?: ReactNode;
  scroll?: boolean;
  /** Centraliza o conteúdo: só para interstícios (boot, resultado, conclusão). */
  centered?: boolean;
};

export function Screen({ children, title, left, right, footer, scroll, centered }: Props) {
  const insets = useSafeAreaInsets();
  const hasHeader = Boolean(title || left || right);

  const body = (
    <View style={[styles.content, centered && styles.centered]}>{children}</View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {hasHeader ? (
        <View style={styles.header}>
          <HeaderButton action={left} />
          {title ? (
            <Txt variant="label" tone={color.muted} numberOfLines={1} style={styles.title}>
              {title}
            </Txt>
          ) : (
            <View style={styles.title} />
          )}
          <HeaderButton action={right} />
        </View>
      ) : null}

      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scroll, !footer && { paddingBottom: insets.bottom + space.xl }]}
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
      ) : (
        body
      )}

      {footer ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>{footer}</View>
      ) : !scroll ? (
        <View style={{ height: insets.bottom }} />
      ) : null}
    </View>
  );
}

function HeaderButton({ action }: { action?: HeaderAction }) {
  if (!action) return <View style={styles.headerSlot} />;
  return (
    <PressableScale
      onPress={action.onPress}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      hitSlop={8}
      style={styles.headerSlot}
    >
      <Chamfer cut="sm" fill={color.surface} stroke={color.line} style={styles.headerButton}>
        <Icon name={action.icon} tone={color.text} />
      </Chamfer>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.md,
    minHeight: touch.icon + space.sm,
  },
  title: { flex: 1, textAlign: 'center' },
  headerSlot: { width: touch.icon, height: touch.icon },
  headerButton: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: space.screen, gap: space.xl },
  centered: { justifyContent: 'center' },
  scroll: { flexGrow: 1, paddingTop: space.md },
  footer: {
    paddingHorizontal: space.screen,
    paddingTop: space.lg,
    gap: space.sm,
    backgroundColor: color.bg,
  },
});
