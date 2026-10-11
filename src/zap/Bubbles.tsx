import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type TextProps } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { font } from '../theme/type';
import { zap, zapType } from '../theme/zap';
import type { Part } from './script';
import { clock } from './store';
import { VIDEOS, type VideoId } from './videos';

export function ZText({ style, ...rest }: TextProps) {
  return <Text style={[zapType.body, { color: zap.text }, style]} {...rest} />;
}

export function Avatar({ size = 50, group }: { size?: number; group?: boolean }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <MaterialCommunityIcons name={group ? 'account-group' : 'account'} size={size * 0.62} color={zap.avatar} />
    </View>
  );
}

/** Dois tiques: cinza = entregue, azul = lida. */
export function Ticks({ read }: { read: boolean }) {
  return <MaterialCommunityIcons name="check-all" size={16} color={read ? zap.read : zap.muted} />;
}

type BubbleProps = {
  part: Part;
  mine: boolean;
  at: number;
  /** Primeira de uma sequência do mesmo lado: ganha a "ponta". */
  tail: boolean;
  read?: boolean;
  from?: string;
  onLink?: (to: 'acesso' | 'carteira') => void;
  onVideo?: (id: VideoId) => void;
};

export function Bubble({ part, mine, at, tail, read = false, from, onLink, onVideo }: BubbleProps) {
  const bg = mine ? zap.bubbleOut : zap.bubbleIn;
  const media = part.kind === 'image' || part.kind === 'link' || part.kind === 'video';
  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      style={[styles.row, mine ? styles.rowMine : styles.rowTheirs, tail && styles.rowTail]}
    >
      {tail ? <View style={[styles.tail, mine ? styles.tailMine : styles.tailTheirs, { borderTopColor: bg }]} /> : null}
      <View
        style={[
          styles.bubble,
          { backgroundColor: bg },
          tail && (mine ? styles.cornerMine : styles.cornerTheirs),
          media && styles.bubbleMedia,
        ]}
      >
        {from ? <Text style={[zapType.small, styles.from]}>{from}</Text> : null}
        <Content part={part} mine={mine} onLink={onLink} onVideo={onVideo} />
        <View style={styles.meta}>
          <Text style={[zapType.tiny, { color: mine ? zap.metaMine : zap.muted }]}>{clock(at)}</Text>
          {mine ? <Ticks read={read} /> : null}
        </View>
      </View>
    </Animated.View>
  );
}

function Content({
  part,
  mine,
  onLink,
  onVideo,
}: {
  part: Part;
  mine: boolean;
  onLink?: BubbleProps['onLink'];
  onVideo?: BubbleProps['onVideo'];
}) {
  switch (part.kind) {
    case 'text':
      // Espaço invisível no fim da última linha para a hora (e os tiques) não cobrirem o texto.
      return (
        <ZText>
          {part.text}
          <Text style={styles.spacer}>{'\u00A0'.repeat(mine ? 20 : 13)}</Text>
        </ZText>
      );
    case 'image':
      return (
        <>
          <CameraFeed />
          {part.caption ? <ZText style={styles.caption}>{part.caption}</ZText> : null}
        </>
      );
    case 'file':
      return (
        <View style={styles.file}>
          <MaterialCommunityIcons name="file-lock" size={34} color={zap.rec} />
          <View style={styles.flex}>
            <ZText numberOfLines={1}>{part.name}</ZText>
            <Text style={[zapType.small, { color: zap.muted }]}>{part.size} · BTC</Text>
          </View>
        </View>
      );
    case 'audio':
      return <AudioNote seconds={part.seconds} />;
    case 'video':
      return <VideoThumb id={part.video} seconds={part.seconds} onPress={() => onVideo?.(part.video)} />;
    case 'link':
      return <InviteLink to={part.to} onPress={() => onLink?.(part.to)} />;
  }
}

// "Foto" da câmera do lobby: feita com Views, com chiado e REC piscando.
function CameraFeed() {
  const reduced = useReducedMotion();
  const blink = useSharedValue(1);
  useEffect(() => {
    if (!reduced) blink.value = withRepeat(withSequence(withTiming(0.2, { duration: 500 }), withTiming(1, { duration: 500 })), -1);
  }, [reduced, blink]);
  const dot = useAnimatedStyle(() => ({ opacity: blink.value }));

  return (
    <View style={styles.camera} accessible accessibilityLabel="Foto da câmera do lobby, com o hacker vendo tudo">
      {SCANLINES.map((top, i) => (
        <View key={i} style={[styles.scanline, { top, opacity: i % 3 === 0 ? 0.18 : 0.08 }]} />
      ))}
      <View style={styles.sofa} />
      <View style={styles.sofaRight} />
      <View style={styles.door} />
      <View style={styles.camTop}>
        <Animated.View style={[styles.recDot, dot]} />
        <Text style={styles.camText}>REC</Text>
        <View style={styles.flex} />
        <Text style={styles.camText}>CAM 04 · LOBBY</Text>
      </View>
      <Text style={[styles.camText, styles.camBottom]}>MAVSA RESORT · ACESSO: BLACK NODE</Text>
    </View>
  );
}
const SCANLINES = Array.from({ length: 22 }, (_, i) => i * 9);

// Áudio do hacker: a barra anda, mas o som chega "corrompido".
function AudioNote({ seconds }: { seconds: number }) {
  const [state, setState] = useState<'idle' | 'playing' | 'broken'>('idle');
  const progress = useSharedValue(0);
  const bar = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  const play = () => {
    if (state === 'playing') return;
    setState('playing');
    progress.value = 0;
    progress.value = withTiming(1, { duration: 2400 });
    setTimeout(() => setState('broken'), 2400);
  };

  return (
    <View>
      <View style={styles.audio}>
        <Avatar size={44} />
        <Pressable onPress={play} hitSlop={12} accessibilityRole="button" accessibilityLabel="Ouvir áudio">
          <MaterialCommunityIcons name={state === 'playing' ? 'pause' : 'play'} size={34} color={zap.muted} />
        </Pressable>
        <View style={styles.flex}>
          <View style={styles.wave}>
            {WAVE.map((h, i) => (
              <View key={i} style={[styles.waveBar, { height: h }]} />
            ))}
            <Animated.View style={[styles.waveFill, bar]} />
          </View>
          <Text style={[zapType.tiny, { color: zap.muted }]}>0:{String(seconds).padStart(2, '0')}</Text>
        </View>
      </View>
      {state === 'broken' ? (
        <Animated.Text entering={FadeIn} style={[zapType.small, styles.broken]}>
          ⚠ Áudio corrompido pelo hacker
        </Animated.Text>
      ) : null}
    </View>
  );
}
const WAVE = [6, 12, 18, 9, 22, 14, 7, 16, 24, 11, 6, 19, 13, 8, 21, 15, 9, 5, 12, 17, 10, 6, 14, 8];

// Link de convite com prévia: a única coisa com a cara do BLACK NODE dentro do Zap.
const LINKS = {
  acesso: {
    icon: 'cube-outline',
    title: 'BLACK NODE · Acesso ao nó secreto',
    text: 'Programa instalado neste celular. Só agentes autorizados.',
  },
  carteira: {
    icon: 'lock-open-variant-outline',
    title: 'BLACK NODE · Carteira desbloqueada',
    text: 'O hacker foi desmascarado. Os bitcoins voltaram para o resort.',
  },
} as const;

function InviteLink({ to, onPress }: { to: 'acesso' | 'carteira'; onPress?: () => void }) {
  const link = LINKS[to];
  return (
    <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel="Abrir o BLACK NODE">
      <View style={styles.preview}>
        <View style={styles.previewArt}>
          <MaterialCommunityIcons name={link.icon} size={40} color={zap.neon} />
          <Text style={styles.previewBrand}>BLACK NODE</Text>
        </View>
        <View style={styles.previewText}>
          <ZText style={styles.previewTitle}>{link.title}</ZText>
          <Text style={[zapType.small, { color: zap.muted }]} numberOfLines={2}>
            {link.text}
          </Text>
        </View>
      </View>
      <ZText style={styles.link}>blacknode://{to}</ZText>
    </Pressable>
  );
}

// Vídeo recebido: capa escura com play; abre o player em tela cheia.
function VideoThumb({ id, seconds, onPress }: { id: VideoId; seconds: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Ver vídeo: ${VIDEOS[id].title}`}>
      <View style={styles.video}>
        {SCANLINES.map((top, i) => (
          <View key={i} style={[styles.scanline, { top: top * 1.6, opacity: 0.06 }]} />
        ))}
        <MaterialCommunityIcons name="skull-outline" size={56} color={zap.rec} />
        <View style={styles.play}>
          <MaterialCommunityIcons name="play" size={36} color={zap.text} />
        </View>
        <View style={styles.videoMeta}>
          <MaterialCommunityIcons name="video" size={16} color={zap.text} />
          <Text style={[zapType.tiny, { color: zap.text }]}>0:{String(seconds).padStart(2, '0')}</Text>
        </View>
      </View>
      <View style={styles.videoSpacer} />
    </Pressable>
  );
}

export function TypingBubble() {
  return (
    <Animated.View entering={FadeIn.duration(150)} style={[styles.row, styles.rowTheirs, styles.rowTail]}>
      <View style={[styles.tail, styles.tailTheirs, { borderTopColor: zap.bubbleIn }]} />
      <View style={[styles.bubble, styles.cornerTheirs, styles.typing, { backgroundColor: zap.bubbleIn }]}>
        {[0, 1, 2].map((i) => (
          <Dot key={i} delay={i * 160} />
        ))}
      </View>
    </Animated.View>
  );
}

function Dot({ delay }: { delay: number }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(delay, withRepeat(withSequence(withTiming(-4, { duration: 260 }), withTiming(0, { duration: 260 })), -1));
  }, [delay, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[styles.dot, style]} />;
}

export function SystemNote({ children, tone = zap.systemText }: { children: string; tone?: string }) {
  return (
    <View style={styles.system}>
      <Text style={[zapType.small, { color: tone, textAlign: 'center' }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  avatar: { backgroundColor: zap.avatarBg, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' },
  row: { paddingHorizontal: 14, marginTop: 2, flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  rowTail: { marginTop: 10 },
  tail: { position: 'absolute', top: 0, width: 0, height: 0, borderTopWidth: 10, borderLeftWidth: 8, borderRightWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  tailMine: { right: 6 },
  tailTheirs: { left: 6 },
  bubble: { maxWidth: '82%', borderRadius: 8, paddingHorizontal: 8, paddingTop: 6, paddingBottom: 6 },
  bubbleMedia: { padding: 4, width: '78%' },
  cornerMine: { borderTopRightRadius: 0 },
  cornerTheirs: { borderTopLeftRadius: 0 },
  from: { color: zap.groupName, fontWeight: '600', marginBottom: 2 },
  spacer: { fontSize: 12, color: 'transparent' },
  meta: { position: 'absolute', right: 8, bottom: 4, flexDirection: 'row', alignItems: 'center', gap: 3 },
  caption: { paddingHorizontal: 4, paddingTop: 6, paddingBottom: 14 },
  file: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 6, padding: 10, marginBottom: 14, minWidth: 220 },
  camera: { height: 190, borderRadius: 6, backgroundColor: zap.camBg, overflow: 'hidden' },
  scanline: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: zap.camLine },
  sofa: { position: 'absolute', left: 24, bottom: 34, width: 90, height: 36, borderRadius: 6, backgroundColor: zap.camShape },
  sofaRight: { position: 'absolute', right: 24, bottom: 34, width: 70, height: 36, borderRadius: 6, backgroundColor: zap.camShape },
  door: { position: 'absolute', left: '42%', top: 40, width: 46, height: 92, backgroundColor: zap.camDoor, borderWidth: 2, borderColor: zap.camEdge },
  camTop: { position: 'absolute', top: 8, left: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  recDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: zap.rec },
  camText: { fontFamily: font.mono, fontSize: 11, color: zap.text, letterSpacing: 1 },
  camBottom: { position: 'absolute', bottom: 8, left: 10 },
  audio: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 44, paddingVertical: 4, minWidth: 240 },
  wave: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 26 },
  waveBar: { width: 3, borderRadius: 2, backgroundColor: zap.muted },
  waveFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(83,189,235,0.35)' },
  broken: { color: zap.rec, paddingHorizontal: 4, paddingBottom: 14 },
  preview: { borderRadius: 6, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.22)' },
  previewArt: { height: 120, backgroundColor: zap.camArt, alignItems: 'center', justifyContent: 'center', gap: 6 },
  previewBrand: { fontFamily: font.display, fontSize: 26, letterSpacing: 3, color: zap.neon },
  previewText: { padding: 8, gap: 2 },
  previewTitle: { fontWeight: '600', fontSize: 15 },
  link: { color: zap.link, textDecorationLine: 'underline', paddingHorizontal: 4, paddingTop: 6, paddingBottom: 16 },
  video: { height: 300, borderRadius: 6, backgroundColor: zap.camArt, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  play: { position: 'absolute', width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  videoMeta: { position: 'absolute', left: 8, bottom: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  videoSpacer: { height: 16 },
  typing: { flexDirection: 'row', gap: 4, paddingVertical: 14, paddingHorizontal: 14 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: zap.muted },
  system: { alignSelf: 'center', backgroundColor: zap.system, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginVertical: 8, marginHorizontal: 40 },
});
