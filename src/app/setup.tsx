import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../components/Button';
import { Chamfer } from '../components/Chamfer';
import { Choice } from '../components/Choice';
import { Icon } from '../components/Icon';
import { PressableScale } from '../components/PressableScale';
import { Screen } from '../components/Screen';
import { Txt } from '../components/Txt';
import { VoiceRecorder } from '../components/VoiceRecorder';
import {
  MIN_NODES,
  PERIODS,
  STORY,
  TEAMS,
  durationText,
  hackerMessage,
  millions,
  whatsappMessage,
  maxNodesFor,
  pad2,
  placesFor,
  routeFor,
  type Mode,
  type Period,
  type Team,
} from '../game/config';
import { useMission } from '../game/store';
import { openWhatsApp } from '../game/whatsapp';
import { color, space, touch } from '../theme/tokens';

// Configuração do recreador, antes de entregar o celular às crianças:
// roteiro do hacker (mensagem no WhatsApp e voz do tio), período (Dia/Noite), número de pistas,
// modo de jogo e, no Hacker vs Hacker, o time deste aparelho.

export default function Setup() {
  const { setup, start } = useMission();
  const [total, setTotal] = useState(setup.total);
  const [mode, setMode] = useState<Mode>(setup.mode);
  const [team, setTeam] = useState<Team>(setup.team);
  const [period, setPeriod] = useState<Period>(setup.period);
  const [story, setStory] = useState(setup.story);
  const versus = mode === 'versus';
  const max = maxNodesFor(period);
  const route = routeFor(period, total);

  // À noite há menos lugares permitidos: o número de pistas acompanha.
  const choosePeriod = (p: Period) => {
    setPeriod(p);
    setTotal((t) => Math.min(t, maxNodesFor(p)));
  };

  const chooseStory = (on: boolean) => {
    setStory(on);
    if (on) setTotal(Math.min(STORY.nodes, max));
  };

  const begin = () => {
    start({ total, mode, team, period, story });
    // No roteiro, o hacker invade a tela assim que a missão começa.
    router.replace(story ? { pathname: '/hack/[stage]', params: { stage: 'inicio' } } : '/home');
  };

  return (
    <Screen
      title="Configuração do recreador"
      scroll
      footer={
        <Button
          label="Iniciar missão"
          icon="play"
          onPress={begin}
          accessibilityHint={
            story
              ? 'Começa a missão e liga a contagem regressiva'
              : versus
                ? `Começa a missão do ${TEAMS[team].name} e liga o cronômetro`
                : 'Começa a missão'
          }
        />
      }
    >
      <View style={styles.section}>
        <Txt variant="label" tone={color.muted}>
          Roteiro
        </Txt>
        <View style={styles.list} accessibilityRole="radiogroup">
          <Choice
            label="Roteiro do hacker"
            description={`O hacker manda mensagem, invade o celular no meio e se revela no fim com a sua voz. Cada bloco vale 1 milhão de BTC e o relógio corre ${durationText(STORY.minutes)}.`}
            icon="skull-outline"
            tone="danger"
            selected={story}
            onPress={() => chooseStory(true)}
          />
          <Choice
            label="Caça livre"
            description="Só as pistas e a carteira, sem história nem prazo."
            icon="map-search-outline"
            selected={!story}
            onPress={() => chooseStory(false)}
          />
        </View>
      </View>

      {story ? (
        <>
          <View style={styles.section}>
            <Txt variant="label" tone={color.muted}>
              1. Mensagem no WhatsApp
            </Txt>
            <Chamfer fill={color.surface} stroke={color.lineStrong} style={styles.box}>
              <Txt variant="body">{hackerMessage('inicio', total)}</Txt>
            </Chamfer>
            <Button
              label="Mandar no grupo"
              icon="whatsapp"
              variant="secondary"
              onPress={() => openWhatsApp(whatsappMessage(total))}
              accessibilityHint="Abre o WhatsApp com a mensagem do hacker pronta para mandar no grupo"
            />
            <Txt variant="body" tone={color.muted}>
              Mande no grupo das crianças e depois toque em Iniciar missão.
            </Txt>
          </View>

          <View style={styles.section}>
            <Txt variant="label" tone={color.muted}>
              2. Voz do hacker
            </Txt>
            <VoiceRecorder />
          </View>

          <View style={styles.section}>
            <Txt variant="label" tone={color.muted}>
              3. Crachá do hacker
            </Txt>
            <Txt variant="body" tone={color.muted}>
              Leve o QR do crachá do hacker com você. Depois da meta, a pista extra manda as crianças te encontrarem e
              escanearem o crachá.
            </Txt>
          </View>
        </>
      ) : null}

      <View style={styles.section}>
        <Txt variant="label" tone={color.muted}>
          Período
        </Txt>
        <View style={styles.list} accessibilityRole="radiogroup">
          {(['dia', 'noite'] as Period[]).map((p) => (
            <Choice
              key={p}
              label={PERIODS[p].name}
              description={`${PERIODS[p].description} ${placesFor(p).length} lugares.`}
              icon={p === 'dia' ? 'weather-sunny' : 'weather-night'}
              tone={p === 'dia' ? 'primary' : 'cyan'}
              selected={period === p}
              onPress={() => choosePeriod(p)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Txt variant="label" tone={color.muted}>
          Modo de jogo
        </Txt>
        <View style={styles.list} accessibilityRole="radiogroup">
          <Choice
            label="Missão solo"
            description="Um grupo, uma carteira. Sem pressa."
            icon="incognito"
            selected={!versus}
            onPress={() => setMode('solo')}
          />
          <Choice
            label="Hacker vs Hacker"
            description="Dois times, um celular por time. Ganha quem recuperar a carteira mais rápido."
            icon="sword-cross"
            selected={versus}
            onPress={() => setMode('versus')}
          />
        </View>
      </View>

      {versus ? (
        <View style={styles.section}>
          <Txt variant="label" tone={color.muted}>
            Este celular é do
          </Txt>
          <View style={styles.row} accessibilityRole="radiogroup">
            {(['A', 'B'] as Team[]).map((t) => (
              <Choice
                key={t}
                label={TEAMS[t].short}
                tone={t === 'A' ? 'primary' : 'cyan'}
                selected={team === t}
                onPress={() => setTeam(t)}
                style={styles.flex}
              />
            ))}
          </View>
          <Txt variant="body" tone={color.muted}>
            Configure o outro celular com o outro time. Cada time só aceita os próprios QR.
          </Txt>
        </View>
      ) : null}

      <View style={styles.section}>
        <Txt variant="label" tone={color.muted} nativeID="pistas-label">
          Número de pistas
        </Txt>
        {story ? (
          <Txt variant="body" tone={color.muted}>
            Meta: {millions(total)} de BTC.
          </Txt>
        ) : null}
        <Chamfer fill={color.surface} stroke={color.lineStrong} style={styles.stepper}>
          <StepButton icon="minus" label="Menos uma pista" disabled={total <= MIN_NODES} onPress={() => setTotal(total - 1)} />
          <View
            style={styles.count}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={`${total} ${total === 1 ? 'pista' : 'pistas'}`}
            accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
            onAccessibilityAction={(e) => {
              if (e.nativeEvent.actionName === 'increment') setTotal(Math.min(max, total + 1));
              if (e.nativeEvent.actionName === 'decrement') setTotal(Math.max(MIN_NODES, total - 1));
            }}
          >
            <Txt variant="hero" tone={color.primary} style={styles.number}>
              {total}
            </Txt>
            <Txt variant="label" tone={color.muted}>
              {total === 1 ? 'bloco' : 'blocos'}
            </Txt>
          </View>
          <StepButton icon="plus" label="Mais uma pista" disabled={total >= max} onPress={() => setTotal(total + 1)} />
        </Chamfer>
      </View>

      <View style={styles.section}>
        <Txt variant="label" tone={color.muted}>
          Onde esconder
        </Txt>
        <Txt variant="body" tone={color.muted}>
          {versus
            ? 'Em cada lugar, esconda o QR do bloco com o mesmo número dos dois times. A lista muda com o período e o número de pistas.'
            : 'Esconda cada QR no lugar com o mesmo número. A lista muda com o período e o número de pistas.'}
        </Txt>
        <View>
          {route.map((p, i) => (
            <View key={p.name} style={styles.place}>
              <Txt variant="code" tone={color.primary}>
                {pad2(i + 1)}
              </Txt>
              <View style={styles.flex}>
                <Txt variant="bodyBold">{p.name}</Txt>
                <Txt variant="body" tone={color.muted} style={styles.where}>
                  {p.where}
                </Txt>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

function StepButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: 'minus' | 'plus';
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.step}
    >
      <Chamfer cut="sm" fill={color.surfaceRaised} stroke={color.lineStrong} style={styles.stepInner}>
        <Icon name={icon} size="lg" />
      </Chamfer>
    </PressableScale>
  );
}

const STEP = touch.button + space.sm;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: { gap: space.md },
  list: { gap: space.sm },
  box: { padding: space.lg },
  row: { flexDirection: 'row', gap: space.sm },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space.md,
  },
  step: { width: STEP, height: STEP },
  stepInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  count: { alignItems: 'center' },
  where: { fontSize: 15, lineHeight: 21 },
  number: { fontSize: 72, lineHeight: 72 },
  place: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    paddingVertical: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.line,
  },
});
