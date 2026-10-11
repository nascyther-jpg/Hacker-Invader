import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { zapCheckpoints } from '../game/config';
import { useMission } from '../game/store';
import { zap, zapType } from '../theme/zap';
import { Avatar } from './Bubbles';
import { HACKER_NUMBER, checkpoint } from './script';
import { preview, useZap } from './store';

// Liga o BLACK NODE ao Zap: a cada 3 blocos (e no último) o hacker manda mensagem com vídeo,
// e uma notificação aparece no topo enquanto o recreador está no BLACK NODE.

export function ZapBridge() {
  const { btc, total, story, snape, startedAt, unmasked, unmask } = useMission();
  const { checkpoints, step, sendCheckpoint, newMission } = useZap();

  // Missão nova: as mensagens por bloco valem de novo.
  useEffect(() => {
    if (startedAt !== null) newMission();
  }, [startedAt, newMission]);

  useEffect(() => {
    if (!story || startedAt === null) return;
    for (const i of zapCheckpoints(total)) {
      if (btc >= i && !checkpoints.includes(i)) sendCheckpoint(i, checkpoint(i, total, snape));
    }
  }, [btc, total, story, snape, startedAt, checkpoints, sendCheckpoint]);

  // Final do Snape: acertou o apelido hacker no Zap = hacker desmascarado.
  useEffect(() => {
    if (snape && step === 'snapeAcertou' && !unmasked) unmask();
  }, [snape, step, unmasked, unmask]);

  return <Banner />;
}

// Notificação no estilo do celular: some ao abrir o Zap ou ao fechar no X.
function Banner() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { thread, seen, unlocked, unlockedAt } = useZap();
  const [dismissed, setDismissed] = useState(0);
  // Só mensagens novas depois que o BLACK NODE abriu, ainda não vistas nem dispensadas.
  const fresh = thread.slice(Math.max(seen, unlockedAt, dismissed)).filter((m) => !m.mine);
  const last = fresh[fresh.length - 1];
  const unread = fresh.length;
  const visible = unlocked && last && !pathname.startsWith('/zap');

  if (!visible) return null;
  return (
    <Animated.View
      entering={SlideInUp.duration(260)}
      exiting={SlideOutUp.duration(200)}
      style={[styles.wrap, { top: insets.top + 6 }]}
    >
      <Pressable
        onPress={() => router.push({ pathname: '/zap/[chat]', params: { chat: 'hacker' } })}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={`Nova mensagem de ${HACKER_NUMBER}: ${preview(last.part)}. Abrir o Zap.`}
      >
        <Avatar size={40} />
        <View style={styles.body}>
          <View style={styles.line}>
            <MaterialCommunityIcons name="message-text" size={14} color={zap.badge} />
            <Text style={[zapType.small, { color: zap.muted }]}>Zap · agora</Text>
          </View>
          <Text style={[zapType.preview, styles.name]} numberOfLines={1}>
            {HACKER_NUMBER}
            {unread > 1 ? ` (${unread} mensagens)` : ''}
          </Text>
          <Text style={[zapType.preview, { color: zap.text }]} numberOfLines={2}>
            {preview(last.part)}
          </Text>
        </View>
        <Pressable
          onPress={() => setDismissed(thread.length)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Dispensar notificação"
        >
          <MaterialCommunityIcons name="close" size={20} color={zap.muted} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 8, right: 8 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18, backgroundColor: zap.bar, borderWidth: StyleSheet.hairlineWidth, borderColor: zap.divider, elevation: 8 },
  body: { flex: 1, gap: 2 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { color: zap.text, fontWeight: '600' },
});
