import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { zap, zapType } from '../../theme/zap';
import { Avatar } from '../../zap/Bubbles';
import { DECOYS, HACKER_NUMBER } from '../../zap/script';
import { clock, preview, useZap } from '../../zap/store';

// Lista de conversas do Zap: o hacker no topo, com mensagem não lida.
// Segurar o título "Zap" por 2 s pula direto para o BLACK NODE (atalho do recreador).

export default function Chats() {
  const insets = useSafeAreaInsets();
  const { thread, typing, unread } = useZap();
  const last = thread[thread.length - 1];
  const now = Date.now();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onLongPress={() => router.replace('/zap/invasao')}
          delayLongPress={2000}
          accessibilityLabel="Zap"
          style={styles.flex}
        >
          <Text style={[zapType.title, styles.brand]}>Zap</Text>
        </Pressable>
        <MaterialCommunityIcons name="camera-outline" size={24} color={zap.text} />
        <MaterialCommunityIcons name="dots-vertical" size={24} color={zap.text} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
        <View style={styles.search}>
          <MaterialCommunityIcons name="magnify" size={22} color={zap.muted} />
          <Text style={[zapType.body, { color: zap.muted }]}>Pesquisar</Text>
        </View>
        <View style={styles.filters}>
          {['Tudo', 'Não lidas', 'Favoritas', 'Grupos'].map((f, i) => (
            <View key={f} style={[styles.filter, i === 0 && styles.filterOn]}>
              <Text style={[zapType.preview, { color: i === 0 ? zap.badge : zap.muted }]}>{f}</Text>
            </View>
          ))}
        </View>

        <Row
          name={HACKER_NUMBER}
          time={last ? clock(last.at) : ''}
          unread={unread}
          text={typing ? 'digitando...' : last ? `${last.mine ? '✓✓ ' : ''}${preview(last.part)}` : ''}
          typing={typing}
          onPress={() => router.push({ pathname: '/zap/[chat]', params: { chat: 'hacker' } })}
        />
        {DECOYS.map((d) => {
          const m = d.messages[d.messages.length - 1];
          return (
            <Row
              key={d.id}
              name={d.name}
              group={d.group}
              time={clock(now - m.minutesAgo * 60_000)}
              unread={d.unread}
              text={`${m.mine ? '✓✓ ' : m.from ? `${m.from}: ` : ''}${m.text}`}
              onPress={() => router.push({ pathname: '/zap/[chat]', params: { chat: d.id } })}
            />
          );
        })}

        <View style={styles.lock}>
          <MaterialCommunityIcons name="lock" size={12} color={zap.muted} />
          <Text style={[zapType.small, { color: zap.muted }]}>Suas mensagens pessoais são protegidas</Text>
        </View>
      </ScrollView>

      <View style={[styles.fab, { bottom: insets.bottom + 80 }]}>
        <MaterialCommunityIcons name="message-plus" size={24} color={zap.onBadge} />
      </View>

      <View style={[styles.tabs, { paddingBottom: insets.bottom + 8 }]}>
        <Tab icon="message-text" label="Conversas" active badge={unread} />
        <Tab icon="circle-double" label="Atualizações" />
        <Tab icon="account-group-outline" label="Comunidades" />
        <Tab icon="phone-outline" label="Ligações" />
      </View>
    </View>
  );
}

function Row({
  name,
  text,
  time,
  unread,
  typing,
  group,
  onPress,
}: {
  name: string;
  text: string;
  time: string;
  unread: number;
  typing?: boolean;
  group?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: zap.divider }}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: zap.divider }]}
      accessibilityRole="button"
      accessibilityLabel={`${name}. ${unread ? `${unread} não lidas. ` : ''}${text}`}
    >
      <Avatar group={group} />
      <View style={styles.rowBody}>
        <View style={styles.rowLine}>
          <Text style={[zapType.name, { color: zap.text }, styles.flex]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[zapType.small, { color: unread ? zap.badge : zap.muted }]}>{time}</Text>
        </View>
        <View style={styles.rowLine}>
          <Text
            style={[zapType.preview, { color: typing ? zap.badge : zap.muted }, styles.flex]}
            numberOfLines={1}
          >
            {text}
          </Text>
          {unread ? (
            <View style={styles.badge}>
              <Text style={[zapType.small, styles.badgeText]}>{unread}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function Tab({
  icon,
  label,
  active,
  badge,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  active?: boolean;
  badge?: number;
}) {
  return (
    <View style={styles.tab}>
      <View style={[styles.tabIcon, active && styles.tabIconOn]}>
        <MaterialCommunityIcons name={icon} size={22} color={zap.text} />
        {badge ? (
          <View style={styles.tabBadge}>
            <Text style={[zapType.tiny, styles.badgeText]}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[zapType.small, { color: zap.text, fontWeight: active ? '600' : '400' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: zap.list },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 22, paddingHorizontal: 16, height: 60 },
  brand: { color: zap.text, fontSize: 24 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginTop: 4, paddingHorizontal: 14, height: 44, borderRadius: 22, backgroundColor: zap.bar },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  filter: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: zap.bar },
  filterOn: { backgroundColor: zap.accentDim },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 10 },
  rowBody: { flex: 1, gap: 3 },
  rowLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: zap.badge, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: zap.onBadge, fontWeight: '700' },
  lock: { flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  fab: { position: 'absolute', right: 16, width: 56, height: 56, borderRadius: 16, backgroundColor: zap.accent, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: zap.list, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: zap.divider, paddingTop: 10 },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  tabIcon: { width: 60, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tabIconOn: { backgroundColor: zap.accentDim },
  tabBadge: { position: 'absolute', top: -2, right: 8, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: zap.badge, alignItems: 'center', justifyContent: 'center' },
});
