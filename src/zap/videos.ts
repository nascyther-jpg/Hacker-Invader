// Vídeos do hacker que chegam no Zap durante a caça (verticais, para a tela do celular).
// Para trocar um vídeo, substitua o arquivo em assets/videos/ mantendo o mesmo nome.
// O vídeo de abertura (16:9, para o telão) não passa pelo app.

export type VideoId = 'tres' | 'mais' | 'final' | 'snape';

export const VIDEOS: Record<VideoId, { source: number; title: string }> = {
  // Depois dos 3 primeiros blocos.
  tres: { source: require('../../assets/videos/zap-1-tres-blocos.mp4'), title: 'Hacker irritado' },
  // A cada 3 blocos seguintes (6, 9...), se não for o último.
  mais: { source: require('../../assets/videos/zap-2-mais-blocos.mp4'), title: 'Imagem carregando' },
  // Último bloco, final com o crachá.
  final: { source: require('../../assets/videos/zap-3-final.mp4'), title: 'Servidor recuperado' },
  // Último bloco, final do Snape: charada do apelido hacker.
  snape: { source: require('../../assets/videos/zap-4-snape-charada.mp4'), title: 'Charada do hacker' },
};
