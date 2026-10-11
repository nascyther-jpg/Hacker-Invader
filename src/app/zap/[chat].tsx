import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { zap, zapType } from '../../theme/zap';
import { Avatar, Bubble, SystemNote, TypingBubble } from '../../zap/Bubbles';
import { DECOYS, HACKER_NUMBER, HACKER_PUSHNAME, type Part, type Reply } from '../../zap/script';
import { useZap } from '../../zap/store';
import type { VideoId } from '../../zap/videos';

// Conversa do Zap. No chat do hacker o recreador responde tocando numa sugestão:
// ela aparece no campo de texto e vai com o botão de enviar.

type Item =
  | { key: string; type: 'msg'; part: Part; mine: boolean; at: number; tail: boolean; read: boolean; from?: string }
  | { key: string; type: 'typing' }
  | { key: string; type: 'note'; text: string; tone?: string }
  | { key: string; type: 'unknown' };

export default function Chat() {
  const { chat } = useLocalSearchParams<{ chat: string }>();
  if (chat === 'hacker') return <HackerChat />;
  const decoy = DECOYS.find((d) => d.id === chat);
  if (!decoy) return <Redirect href="/zap" />;
  return <DecoyChat id={decoy.id} />;
}

function HackerChat() {
  const { thread, typing, replies, reply, markSeen, restart } = useZap();
  const [draft, setDraft] = useState<Reply | null>(null);

  useEffect(() => {
    markSeen();
  }, [thread.length, markSeen]);

  // Saiu a resposta escolhida: limpa o campo.
  useEffect(() => {
    if (!replies.length) setDraft(null);
  }, [replies]);

  const items = useMemo<Item[]>(() => {
    const lastHacker = thread.reduce((acc, m, i) => (m.mine ? acc : i), -1);
    const list: Item[] = [
      { key: 'today', type: 'note', text: 'HOJE', tone: zap.muted },
      { key: 'e2e', type: 'note', text: '🔒 As mensagens e as ligações são protegidas com a criptografia de ponta a ponta. Ninguém fora desta conversa pode ler ou ouvir. Ninguém?' },
      { key: 'unknown', type: 'unknown' },
      ...thread.map<Item>((m, i) => ({
        key: String(m.id),
        type: 'msg',
        part: m.part,
        mine: m.mine,
        at: m.at,
        tail: i === 0 || thread[i - 1].mine !== m.mine,
        read: i < lastHacker || typing,
      })),
    ];
    if (typing) list.push({ key: 'typing', type: 'typing' });
    return list.reverse();
  }, [thread, typing]);

  const menu = () =>
    Alert.alert('Reiniciar conversa?', 'O hacker manda tudo de novo, desde o "Oi".', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Reiniciar', style: 'destructive', onPress: restart },
    ]);

  return (
    <ChatFrame
      name={HACKER_NUMBER}
      subtitle={typing ? 'digitando...' : 'online'}
      highlight={typing}
      items={items}
      onMenu={menu}
      onLink={(to) => (to === 'acesso' ? router.push('/zap/invasao') : router.replace('/complete'))}
      onVideo={(id) => router.push({ pathname: '/zap/video/[id]', params: { id } })}
      footer={
        <>
          {replies.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {replies.map((r) => (
                <Pressable
                  key={r.label}
                  onPress={() => setDraft(r)}
                  style={[styles.chip, draft === r && styles.chipOn]}
                  accessibilityRole="button"
                  accessibilityLabel={`Responder: ${r.label}`}
                >
                  <Text style={[zapType.preview, { color: zap.badge }]}>{r.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
          <InputBar
            text={draft?.label}
            onSend={draft ? () => reply(draft) : undefined}
          />
        </>
      }
    />
  );
}

function DecoyChat({ id }: { id: string }) {
  const decoy = DECOYS.find((d) => d.id === id)!;
  const now = Date.now();
  const items = useMemo<Item[]>(() => {
    const list: Item[] = [{ key: 'today', type: 'note', text: 'HOJE', tone: zap.muted }];
    decoy.messages.forEach((m, i) => {
      const prev = decoy.messages[i - 1];
      list.push({
        key: String(i),
        type: 'msg',
        part: { kind: 'text', text: m.text },
        mine: Boolean(m.mine),
        at: now - m.minutesAgo * 60_000,
        tail: !prev || Boolean(prev.mine) !== Boolean(m.mine) || prev.from !== m.from,
        read: true,
        from: decoy.group && !m.mine && (!prev || prev.from !== m.from) ? m.from : undefined,
      });
    });
    return list.reverse();
  }, [decoy]);

  return (
    <ChatFrame
      name={decoy.name}
      group={decoy.group}
      subtitle={decoy.group ? 'Ana, Bruno, Você' : 'visto por último hoje'}
      items={items}
      footer={<InputBar />}
    />
  );
}

function ChatFrame({
  name,
  subtitle,
  highlight,
  group,
  items,
  footer,
  onMenu,
  onLink,
  onVideo,
}: {
  name: string;
  subtitle: string;
  highlight?: boolean;
  group?: boolean;
  items: Item[];
  footer: React.ReactNode;
  onMenu?: () => void;
  onLink?: (to: 'acesso' | 'carteira') => void;
  onVideo?: (id: VideoId) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/zap'))}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={styles.back}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={zap.text} />
          <Avatar size={38} group={group} />
        </Pressable>
        <View style={styles.flex}>
          <Text style={[zapType.name, { color: zap.text }]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[zapType.small, { color: highlight ? zap.badge : zap.muted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <MaterialCommunityIcons name="video-outline" size={25} color={zap.text} />
        <MaterialCommunityIcons name="phone-outline" size={23} color={zap.text} />
        <Pressable onPress={onMenu} hitSlop={10} accessibilityRole="button" accessibilityLabel="Mais opções">
          <MaterialCommunityIcons name="dots-vertical" size={24} color={zap.text} />
        </Pressable>
      </View>

      <FlatList
        inverted
        data={items}
        keyExtractor={(i) => i.key}
        contentContainerStyle={styles.list}
        style={styles.flex}
        renderItem={({ item }) => {
          switch (item.type) {
            case 'msg':
              return (
                <Bubble
                  part={item.part}
                  mine={item.mine}
                  at={item.at}
                  tail={item.tail}
                  read={item.read}
                  from={item.from}
                  onLink={onLink}
                  onVideo={onVideo}
                />
              );
            case 'typing':
              return <TypingBubble />;
            case 'note':
              return <SystemNote tone={item.tone}>{item.text}</SystemNote>;
            case 'unknown':
              return <UnknownSender />;
          }
        }}
      />

      <View style={{ paddingBottom: insets.bottom + 6 }}>{footer}</View>
    </View>
  );
}

// Aviso de número fora da agenda, com o "nome" que o hacker escolheu.
function UnknownSender() {
  return (
    <View style={styles.unknown}>
      <Avatar size={64} />
      <Text style={[zapType.name, { color: zap.text }]}>{HACKER_NUMBER}</Text>
      <Text style={[zapType.preview, { color: zap.muted }]}>~{HACKER_PUSHNAME}</Text>
      <Text style={[zapType.small, { color: zap.muted, textAlign: 'center' }]}>
        Não está nos seus contatos · Nenhum grupo em comum
      </Text>
      <View style={styles.unknownActions}>
        <View style={styles.unknownButton}>
          <MaterialCommunityIcons name="block-helper" size={16} color={zap.rec} />
          <Text style={[zapType.preview, { color: zap.rec }]}>Bloquear</Text>
        </View>
        <View style={styles.unknownButton}>
          <MaterialCommunityIcons name="account-plus" size={18} color={zap.badge} />
          <Text style={[zapType.preview, { color: zap.badge }]}>Adicionar</Text>
        </View>
      </View>
    </View>
  );
}

function InputBar({ text, onSend }: { text?: string; onSend?: () => void }) {
  return (
    <View style={styles.inputRow}>
      <View style={styles.input}>
        <MaterialCommunityIcons name="sticker-emoji" size={24} color={zap.muted} />
        <Text style={[zapType.body, styles.flex, { color: text ? zap.text : zap.muted }]} numberOfLines={3}>
          {text ?? 'Mensagem'}
        </Text>
        <MaterialCommunityIcons name="paperclip" size={23} color={zap.muted} style={styles.clip} />
        {text ? null : <MaterialCommunityIcons name="camera-outline" size={23} color={zap.muted} />}
      </View>
      <Pressable
        onPress={onSend}
        disabled={!onSend}
        style={({ pressed }) => [styles.send, pressed && { opacity: 0.8 }]}
        accessibilityRole="button"
        accessibilityLabel={text ? 'Enviar' : 'Gravar áudio'}
      >
        <MaterialCommunityIcons name={text ? 'send' : 'microphone'} size={24} color={zap.onBadge} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: zap.bg },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingRight: 14, height: 60, backgroundColor: zap.list },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingLeft: 6 },
  list: { paddingVertical: 8 },
  unknown: { alignItems: 'center', gap: 4, marginHorizontal: 32, marginVertical: 8, padding: 16, borderRadius: 12, backgroundColor: zap.system },
  unknownActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  unknownButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: zap.divider },
  chips: { gap: 8, paddingHorizontal: 8, paddingBottom: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: zap.accent, backgroundColor: zap.bar },
  chipOn: { backgroundColor: zap.accentDim },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingHorizontal: 6 },
  input: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 50, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 25, backgroundColor: zap.bar },
  clip: { transform: [{ rotate: '-45deg' }] },
  send: { width: 50, height: 50, borderRadius: 25, backgroundColor: zap.accent, alignItems: 'center', justifyContent: 'center' },
});
