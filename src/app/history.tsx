import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Chamfer } from '../components/Chamfer';
import { Icon } from '../components/Icon';
import { PressableScale } from '../components/PressableScale';
import { Screen } from '../components/Screen';
import { StatusTag } from '../components/StatusTag';
import { Txt } from '../components/Txt';
import { blockHash, codeFor, pad2 } from '../game/config';
import { useMission, type Block } from '../game/store';
import { color, space, touch } from '../theme/tokens';

// Histórico em forma de cadeia: cada bloco ligado ao anterior.
// No máximo 10 itens: ScrollView simples é suficiente.

function time(at: number) {
  const d = new Date(at);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export default function History() {
  const { blocks, btc, total, codeSet } = useMission();
  const indexes = Array.from({ length: total }, (_, i) => i + 1);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  return (
    <Screen title="Histórico de blocos" left={{ icon: 'chevron-left', label: 'Voltar', onPress: back }} scroll>
      <Txt variant="body" tone={color.muted}>
        {btc === 0
          ? 'Nenhum bloco recuperado ainda. Siga a primeira pista.'
          : `${btc} de ${total} blocos registrados na sua carteira.`}
      </Txt>

      <View>
        {indexes.map((index) => {
          const block = blocks.find((b) => b.index === index);
          return (
            <Row
              key={index}
              index={index}
              hash={blockHash(codeFor(codeSet, index) ?? '')}
              block={block}
              current={!block && index === btc + 1}
              last={index === total}
            />
          );
        })}
      </View>
    </Screen>
  );
}

function Row({
  index,
  hash,
  block,
  current,
  last,
}: {
  index: number;
  hash: string;
  block?: Block;
  current: boolean;
  last: boolean;
}) {
  const done = Boolean(block);
  const open = () =>
    last
      ? router.push('/complete')
      : router.push({ pathname: '/clue/[id]', params: { id: String(index) } });

  const content = (
    <View style={styles.row}>
      <View style={styles.rail}>
        <Chamfer
          cut={11}
          corners={['tl', 'tr', 'br', 'bl']}
          fill={done ? color.primary : current ? color.cyanDim : color.surface}
          stroke={done ? color.primary : current ? color.cyan : color.lineStrong}
          strokeWidth={2}
          style={styles.marker}
        >
          {done ? (
            <Icon name="check-bold" size="sm" tone={color.onPrimary} />
          ) : (
            <Txt variant="code" tone={current ? color.cyan : color.muted}>
              {index}
            </Txt>
          )}
        </Chamfer>
        {!last ? <View style={[styles.chain, done && styles.chainOn]} /> : null}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Txt variant="title" tone={done || current ? color.text : color.muted}>
            Bloco {pad2(index)}
          </Txt>
          {done ? <Icon name="arrow-right" tone={color.muted} /> : null}
        </View>
        {done ? (
          <Txt variant="code" tone={color.muted}>
            {hash} · {time(block!.at)}
          </Txt>
        ) : current ? (
          <StatusTag label="Próximo alvo" icon="crosshairs-gps" tone="cyan" />
        ) : (
          <View style={styles.lockedRow}>
            <Icon name="lock-outline" size="sm" tone={color.muted} />
            <Txt variant="label" tone={color.muted}>
              Bloqueado
            </Txt>
          </View>
        )}
      </View>
    </View>
  );

  if (!done)
    return (
      <View accessible accessibilityLabel={`Bloco ${index}, ${current ? 'próximo alvo' : 'bloqueado'}`}>
        {content}
      </View>
    );
  return (
    <PressableScale
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={`Bloco ${index}, verificado. Ver pista`}
    >
      {content}
    </PressableScale>
  );
}

const MARK = 40;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.lg, minHeight: touch.min },
  rail: { width: MARK, alignItems: 'center' },
  marker: { width: MARK, height: MARK, alignItems: 'center', justifyContent: 'center' },
  chain: { flex: 1, width: 2, backgroundColor: color.line, marginVertical: space.xs },
  chainOn: { backgroundColor: color.primaryLine },
  body: { flex: 1, gap: space.sm, paddingBottom: space.xl, paddingTop: space.xs },
  lockedRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
