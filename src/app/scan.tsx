import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brackets } from '../components/Brackets';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { PressableScale } from '../components/PressableScale';
import { Screen } from '../components/Screen';
import { Signal } from '../components/Signal';
import { Txt } from '../components/Txt';
import { color, radius, space, touch } from '../theme/tokens';
import { typography } from '../theme/type';

const FRAME = 260;

export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [manual, setManual] = useState(false);
  const locked = useRef(false);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  const submit = (code: string) => {
    if (locked.current || !code.trim()) return;
    locked.current = true;
    router.replace({ pathname: '/verify', params: { code: code.trim() } });
  };

  if (manual) return <ManualEntry onSubmit={submit} onCancel={() => setManual(false)} />;

  // Ainda consultando a permissão: fundo neutro, sem piscar a tela de pedido.
  if (!permission) return <Screen>{null}</Screen>;

  if (!permission.granted) {
    const blocked = !permission.canAskAgain;
    return (
      <Screen
        left={{ icon: 'close', label: 'Fechar', onPress: close }}
        centered
        footer={
          <>
            <Button
              label={blocked ? 'Abrir ajustes' : 'Ativar câmera'}
              icon="camera-outline"
              onPress={blocked ? () => Linking.openSettings() : requestPermission}
            />
            <Button label="Digitar código" variant="ghost" onPress={() => setManual(true)} />
          </>
        }
      >
        <View style={styles.prime}>
          <Signal icon="camera-outline" tone="cyan" enter="none" />
          <Txt variant="display" center>
            Ative a câmera
          </Txt>
          <Txt variant="body" tone={color.muted} center>
            {blocked
              ? 'A câmera está desligada para o Black Node. Ligue nos ajustes do celular.'
              : 'Ela serve só para ler os códigos dos blocos escondidos pelo resort.'}
          </Txt>
        </View>
      </Screen>
    );
  }

  return <Viewfinder onScan={(r) => submit(r.data)} onClose={close} onManual={() => setManual(true)} />;
}

function Viewfinder({
  onScan,
  onClose,
  onManual,
}: {
  onScan: (r: BarcodeScanningResult) => void;
  onClose: () => void;
  onManual: () => void;
}) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [torch, setTorch] = useState(false);
  const sweep = useSharedValue(0);

  // Linha de varredura: indica que o leitor está ativo.
  useEffect(() => {
    if (reduced) return;
    sweep.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [reduced, sweep]);

  const line = useAnimatedStyle(() => ({ transform: [{ translateY: sweep.value * (FRAME - 4) }] }));

  return (
    <View style={styles.root}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onScan}
      />
      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom + space.lg }]}>
        <View style={styles.top}>
          <RoundButton icon="close" label="Fechar scanner" onPress={onClose} />
          <View style={styles.status}>
            <View style={styles.dot} />
            <Txt variant="label">Procurando bloco</Txt>
          </View>
          <RoundButton
            icon={torch ? 'flashlight-off' : 'flashlight'}
            label={torch ? 'Desligar lanterna' : 'Ligar lanterna'}
            onPress={() => setTorch((t) => !t)}
          />
        </View>

        <View style={styles.middle}>
          <Brackets style={styles.frame} size={36} thickness={4}>
            {!reduced ? <Animated.View style={[styles.sweep, line]} /> : null}
          </Brackets>
        </View>

        <View style={styles.bottom}>
          <Txt variant="title" center>
            Aponte para o código do bloco
          </Txt>
          <Button label="Digitar código" variant="ghost" icon="keyboard-outline" onPress={onManual} />
        </View>
      </View>
    </View>
  );
}

function RoundButton({ icon, label, onPress }: { icon: 'close' | 'flashlight' | 'flashlight-off'; label: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.round}>
      <Icon name={icon} />
    </PressableScale>
  );
}

function ManualEntry({ onSubmit, onCancel }: { onSubmit: (code: string) => void; onCancel: () => void }) {
  const [code, setCode] = useState('');
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        title="Digitar código"
        left={{ icon: 'chevron-left', label: 'Voltar para a câmera', onPress: onCancel }}
        footer={<Button label="Verificar" icon="cube-scan" onPress={() => onSubmit(code)} disabled={!code.trim()} />}
      >
        <View style={styles.manual}>
          <Txt variant="label" tone={color.muted} nativeID="code-label">
            Código do bloco
          </Txt>
          <TextInput
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            placeholder="BLACKNODE-00-XXXX"
            placeholderTextColor={color.muted}
            autoCapitalize="characters"
            autoCorrect={false}
            autoComplete="off"
            textContentType="none"
            keyboardType="default"
            returnKeyType="go"
            autoFocus
            onSubmitEditing={() => onSubmit(code)}
            accessibilityLabelledBy="code-label"
            accessibilityLabel="Código do bloco"
            selectionColor={color.primary}
            style={styles.input}
          />
          <Txt variant="body" tone={color.muted}>
            Está escrito embaixo do QR Code.
          </Txt>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: color.bg },
  prime: { gap: space.lg, alignItems: 'center' },
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, justifyContent: 'space-between' },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.sm,
    backgroundColor: color.scrim,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.primary },
  round: {
    width: touch.icon,
    height: touch.icon,
    borderRadius: touch.icon / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.scrim,
  },
  middle: { alignItems: 'center' },
  frame: { width: FRAME, height: FRAME, overflow: 'hidden' },
  sweep: { position: 'absolute', left: 12, right: 12, top: 0, height: 2, backgroundColor: color.primary, opacity: 0.8 },
  bottom: {
    marginHorizontal: space.screen,
    padding: space.lg,
    gap: space.xs,
    borderRadius: radius.md,
    backgroundColor: color.scrim,
  },
  manual: { gap: space.md, paddingTop: space.lg },
  input: {
    minHeight: touch.button,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.lineStrong,
    backgroundColor: color.surface,
    paddingHorizontal: space.lg,
    color: color.text,
    ...typography.input,
  },
});
