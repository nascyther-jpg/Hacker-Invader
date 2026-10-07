# Hacker Invader · BLACK NODE

Caça ao tesouro para crianças de 7 a 12 anos. O jogador é um agente que recupera uma carteira secreta escaneando 4 QR Codes escondidos no resort. Cada QR válido vale +1 BTC fictício e libera a próxima charada.

## Rodar

```bash
npm install
npx expo start
```

O scanner usa `expo-camera`. Para testar sem câmera, use "Digitar código" na tela do scanner.

## Onde editar

- Códigos dos QR e charadas: `src/game/config.ts` (cada QR deve conter exatamente o texto de `code`).
- Design system: `src/theme/` e `MOBILE-DESIGN.md`.

## Reiniciar para o próximo grupo

Na tela da carteira, segure o painel do saldo por 2 segundos e confirme.
