# Hacker Invader · BLACK NODE

Caça ao tesouro para crianças de 7 a 12 anos. O jogador é um agente que recupera uma carteira secreta escaneando de 1 a 10 QR Codes escondidos no resort. Cada QR válido vale +1 BTC fictício e libera a próxima charada.

## Rodar

```bash
npm install
npx expo start
```

O scanner usa `expo-camera`. Para testar sem câmera, use "Digitar código" na tela do scanner.

## Instalar o APK no Android

A cada push na `main`, o GitHub Actions gera o APK (workflow `APK Android`) e publica num Release.
Link fixo da versão mais recente:
https://github.com/nascyther-jpg/Hacker-Invader/releases/latest/download/black-node.apk

1. Abra o link no navegador do celular e baixe.
2. Toque no arquivo; se pedir, permita "instalar apps desconhecidos" para o navegador.
3. Para atualizar, baixe de novo e instale por cima (o progresso não é mantido entre aberturas).

Para gerar sem push: aba Actions > APK Android > Run workflow.

## Modos de jogo

Antes de entregar o celular, o recreador escolhe na tela de configuração:

- **Número de pistas** (1 a 10). O bloco N fica escondido no lugar N da rota (a lista aparece na própria tela).
- **Missão solo**: um grupo, uma carteira.
- **Hacker vs Hacker**: dois times, um celular por time (Time Amarelo e Time Ciano). Cada time só aceita os próprios QR; o cronômetro liga ao iniciar e para no último bloco. No fim, cada celular mostra o tempo do time para o recreador comparar.

## Onde editar

- Códigos dos QR, lugares e charadas: `src/game/config.ts`.
- Folhas de QR para imprimir: `python3 scripts/gerar_qr.py <pasta>` gera um PDF por conjunto (solo, Time Amarelo, Time Ciano) a partir do `config.ts`.
- Design system: `src/theme/` e `MOBILE-DESIGN.md`.

## Reiniciar para o próximo grupo

Na tela da carteira, segure o painel do saldo por 2 segundos e confirme. O app volta para a configuração, já com as escolhas anteriores.
