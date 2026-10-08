# BLACK NODE: decisões de design

Estilo visual: **Cyberpunk 2077** (escolhido pelo usuário em 2026-10-08). Substitui a paleta verde original.

Fonte de verdade do design. Leia antes de mexer em qualquer tela.

## Leitura do app

- **App:** caça ao tesouro de recreação de resort, crianças de 7 a 12 anos.
- **Sensação:** "Estou em uma missão secreta" num HUD Cyberpunk. Nunca "dashboard de cripto".
- **Plataformas:** iOS e Android de primeira classe; web só para pré-visualização.
- **Postura:** marca única (mesmo visual nos dois sistemas).
- **Offline:** não se aplica. Tudo local, sem rede.
- **Dials:** expressão 8 · movimento 5 · densidade 2.

## Navegação

Stack único (Expo Router), sem tab bar: o app tem um destino central (a carteira).

```
src/app/
  index        Boot (2,3 s, toque pula) -> replace /setup (sem missão) ou /home
  setup        Configuração do recreador: período, modo, time, número de pistas
  home         Carteira + progresso + pista atual
  scan         Scanner (fullScreenModal) -> replace /verify
  verify       Verificação: válido / inválido / protegido / repetido / outro time
  clue/[id]    Pista (0 = abertura, N = liberada pelo bloco N)
  history      Cadeia de blocos
  complete     Missão completa
```

## Tokens (`src/theme`)

- **Cores:** BG `#07080B`, SURFACE `#111319`, PRIMARY amarelo neon `#FCEE0A`, CYAN `#00F0FF`, DANGER `#FF3355`, TEXT `#EDF4F5`, MUTED `#8590A0`.
  - PRIMARY = marca, ação principal e sucesso. CYAN = sistema, novidade, "próximo alvo". DANGER = erro de leitura.
  - Contraste sobre o fundo: amarelo 16,6:1, ciano 14,2:1, vermelho 5,6:1, muted 6,2:1.
  - Nenhum hex fora de `tokens.ts`.
- **Fontes:**
  - Rajdhani (display condensada e angular): títulos em caixa alta, números, botões.
  - JetBrains Mono: rótulos de sistema, códigos, hashes.
  - Atkinson Hyperlegible: charadas e textos de leitura (legibilidade para crianças vem antes do estilo).
  - Menor texto do app: 14.
- **Espaço:** grade 4/8; padding lateral fixo de 20.
- **Formas:** sem cantos arredondados. Cantos chanfrados a 45° (`cut`: 6, 14, 22) via `Chamfer` (SVG). Painéis e botões cortam topo-esquerdo e base-direita; nós de progresso e ícones de resultado são octógonos.
- **Toque:** mínimo 56; botões 64.
- **Glow:** no máximo um elemento por tela.

## Motivos visuais

- **Chanfro** (`Chamfer`): a forma de todo painel, botão, tag e nó.
- **Glitch** (`GlitchText`): cópias vermelha e ciano tremem ~0,4 s na entrada de títulos de momento (verificado, não reconhecido, +1 BTC, carteira recuperada, boot). Uma vez por tela.
- **Colchetes de mira** (`Brackets`): no boot, no visor do scanner, na verificação e na pista decifrada.

## Componentes (`src/components`)

`Screen`, `Txt`, `Icon` (só MaterialCommunityIcons), `Button` (primary / secondary / ghost), `PressableScale`, `Chamfer`, `GlitchText`, `Brackets`, `StatusTag` (sempre ícone + texto), `NodeTrack` (progresso 0/N a N/N; acima de 6 nós eles encolhem para caber), `Choice` (opção de rádio), `MissionClock` (time + cronômetro do Hacker vs Hacker), `BtcAmount`, `Signal` (ícone de resultado com entrada pop/shake), `useDecrypt`.

## Movimento

Só animação com função:
- toque: mola para 0,96 em todo botão;
- BTC: moeda com pop, saldo troca do valor antigo para o novo, nó recém-recuperado acende;
- erro: shake curto no ícone e glitch no título;
- pista: texto embaralhado revelado da esquerda para a direita, só na primeira abertura;
- scanner: linha de varredura indica leitor ativo.

Com "reduzir movimento" ligado, tudo vira instantâneo.

## Regras de jogo assumidas

- Blocos seguem a ordem das pistas. QR válido fora de ordem mostra "Bloco protegido".
- QR repetido mostra "Bloco já recuperado" e leva à pista.
- Recreador zera a missão segurando a carteira na Home por 2 s e volta à configuração.
- Conteúdo (códigos, lugares e charadas) fica em `src/game/config.ts`.
- Número de pistas: 1 a 10 (padrão 4), limitado aos lugares permitidos no período. O bloco N fica na parada N da rota; a pista N leva à parada N+1.
- Período Dia/Noite: locais do Mavsa Resort com classificação em `docs/locais-mavsa.md`. À noite, só áreas iluminadas, cobertas ou com equipe. As folhas de QR não trazem o lugar (ele muda com o período).
- Hacker vs Hacker: Time Amarelo (QR `BLACKNODE-Axx`) e Time Ciano (`BLACKNODE-Bxx`), mesma rota. QR de outro conjunto mostra "Bloco de outro time". Cronômetro do início até o último bloco; o recreador compara os tempos dos dois celulares.
