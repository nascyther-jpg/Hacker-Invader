import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { VOICE_SCRIPT, formatDuration } from '../game/config';
import { useMission } from '../game/store';
import { color, space } from '../theme/tokens';
import { Button } from './Button';
import { Chamfer } from './Chamfer';
import { StatusTag } from './StatusTag';
import { Txt } from './Txt';

// Gravação da voz do tio para a revelação final do roteiro do hacker.
// Fica na pasta de documentos do app: sobrevive ao reinício da missão.

const OPTIONS = { ...RecordingPresets.HIGH_QUALITY, directory: 'document' as const };

export function VoiceRecorder() {
  const { voiceUri, setVoice } = useMission();
  const recorder = useAudioRecorder(OPTIONS);
  const rec = useAudioRecorderState(recorder);
  const player = useAudioPlayer(voiceUri);
  const [busy, setBusy] = useState(false);

  const record = async () => {
    setBusy(true);
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert('Microfone bloqueado', 'Libere o microfone para o Black Node nas configurações do celular.');
        return;
      }
      player.pause();
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      Alert.alert('Não deu para gravar', 'Tente de novo.');
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    await recorder.stop();
    // Volta o áudio para o alto-falante.
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    if (recorder.uri) setVoice(recorder.uri);
  };

  const listen = async () => {
    await player.seekTo(0);
    player.play();
  };

  return (
    <Chamfer fill={color.surface} stroke={rec.isRecording ? color.danger : color.lineStrong} style={styles.box}>
      {rec.isRecording ? (
        <StatusTag label={`Gravando ${formatDuration(rec.durationMillis)}`} icon="record-circle-outline" tone="danger" />
      ) : voiceUri ? (
        <StatusTag label="Voz gravada" icon="check-decagram-outline" tone="primary" />
      ) : (
        <StatusTag label="Sem gravação" icon="microphone-off" tone="muted" />
      )}
      <Txt variant="body" tone={color.muted}>
        Grave você lendo esta fala. Ela toca no fim, quando o hacker se revela:
      </Txt>
      <Txt variant="bodyBold">“{VOICE_SCRIPT}”</Txt>
      <View style={styles.actions}>
        {rec.isRecording ? (
          <Button label="Parar" icon="stop" onPress={stop} />
        ) : (
          <Button
            label={voiceUri ? 'Gravar de novo' : 'Gravar minha voz'}
            icon="microphone"
            variant="secondary"
            disabled={busy}
            onPress={record}
          />
        )}
        {voiceUri && !rec.isRecording ? (
          <Button label="Ouvir" icon="play" variant="secondary" onPress={listen} />
        ) : null}
      </View>
    </Chamfer>
  );
}

const styles = StyleSheet.create({
  box: { padding: space.lg, gap: space.md },
  actions: { gap: space.sm },
});
