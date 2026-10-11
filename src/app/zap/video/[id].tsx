import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEventListener } from 'expo';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { zap, zapType } from '../../../theme/zap';
import { HACKER_NUMBER } from '../../../zap/script';
import { VIDEOS, type VideoId } from '../../../zap/videos';

// Player do vídeo recebido no Zap, em tela cheia. Fecha sozinho no fim.

export default function VideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!(id in VIDEOS)) return <Redirect href="/zap" />;
  return <Player id={id as VideoId} />;
}

function Player({ id }: { id: VideoId }) {
  const insets = useSafeAreaInsets();
  const close = () => (router.canGoBack() ? router.back() : router.replace({ pathname: '/zap/[chat]', params: { chat: 'hacker' } }));
  const player = useVideoPlayer(VIDEOS[id].source, (p) => p.play());
  useEventListener(player, 'playToEnd', close);

  return (
    <View style={styles.root}>
      <VideoView player={player} style={styles.video} contentFit="contain" nativeControls />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Fechar vídeo">
          <MaterialCommunityIcons name="arrow-left" size={26} color={zap.text} />
        </Pressable>
        <View>
          <Text style={[zapType.name, { color: zap.text }]}>{HACKER_NUMBER}</Text>
          <Text style={[zapType.small, { color: zap.muted }]}>{VIDEOS[id].title}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: zap.camArt },
  video: { flex: 1, width: '100%' },
  top: { position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingBottom: 8 },
});
