# BLACK NODE: decisões de design

Fonte de verdade do design. Leia antes de mexer em qualquer tela.

## Leitura do app

- **App:** caça ao tesouro de recreação de resort, crianças de 7 a 12 anos.
- **Sensação:** "Estou em uma missão secreta". Nunca "dashboard de cripto".
- **Plataformas:** iOS e Android de primeira classe; web só para pré-visualização.
- **Postura:** marca única (mesmo visual nos dois sistemas).
- **Offline:** não se aplica. Tudo local, sem rede.
- **Dials:** expressão 8 · movimento 5 · densidade 2.

## Navegação

Stack único (Expo Router), sem tab bar: o app tem um destino central (a carteira).

```
src/app/
  index        Boot (2,3 s, toque pula) -> replace /home
  home         Carteira + progresso + pista atual
  scan         Scanner (fullScreenModal) -> replace /verify
  verify       Verificação: válido / inválido / protegido / repetido
  clue/[id]    Pista (0 = abertura, N = liberada pelo bloco N)
  history      Cadeia de blocos
  complete     Missão completa
```

## Tokens (`src/theme`)

- **Cores:** BG `#070A0D`, SURFACE `#0D1217`, PRIMARY `#39FF88`, CYAN `#00C8FF`, WARNING `#FFD166`, TEXT `#E8FFF1`, MUTED `#71808C`.
  - PRIMARY = sucesso e ação principal. CYAN = sistema, novidade, "próximo alvo". WARNING = erro de leitura (sem vermelho: erro discreto).
  - Nenhum hex fora de `tokens.ts`.
- **Fontes:**
  - Chakra Petch (display tecnológica): títulos, números, botões.
  - JetBrains Mono: rótulos de sistema, códigos, hashes.
  - Atkinson Hyperlegible: charadas e textos de leitura (feita para legibilidade máxima).
  - Menor texto do app: 14.
- **Espaço:** grade 4/8; padding lateral fixo de 20.
- **Raio:** 4 (tags), 10 (botões, painéis), círculo (nós).
- **Toque:** mínimo 56; botões 64.
- **Glow:** no máximo um elemento por tela.

## Motivo visual

**Colchetes de mira** (`Brackets`): quatro cantos em L, a mesma linguagem do visor do scanner. Um por tela, no elemento principal (carteira, pista, visor, verificação).

## Componentes (`src/components`)

`Screen`, `Txt`, `Icon` (só MaterialCommunityIcons), `Button` (primary / secondary / ghost), `PressableScale`, `Brackets`, `StatusTag` (sempre ícone + texto), `NodeTrack` (progresso 0/4 a 4/4), `BtcAmount`, `Signal` (ícone de resultado com entrada pop/shake), `useDecrypt`.

## Movimento

Só animação com função:
- toque: mola para 0,96 em todo botão;
- BTC: moeda com pop, saldo troca do valor antigo para o novo, nó recém-recuperado acende;
- erro: shake curto no ícone;
- pista: texto embaralhado revelado da esquerda para a direita, só na primeira abertura;
- scanner: linha de varredura indica leitor ativo.

Com "reduzir movimento" ligado, tudo vira instantâneo.

## Regras de jogo assumidas

- Blocos seguem a ordem das pistas. QR válido fora de ordem mostra "Bloco protegido".
- QR repetido mostra "Bloco já recuperado" e leva à pista.
- Recreador zera a missão segurando a carteira na Home por 2 s.
- Conteúdo (códigos e charadas) fica em `src/game/config.ts`.
