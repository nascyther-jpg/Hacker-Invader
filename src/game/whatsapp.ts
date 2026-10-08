import { Alert, Linking } from 'react-native';

/** Abre o WhatsApp com o texto pronto; o tio escolhe o grupo e envia. */
export async function openWhatsApp(text: string): Promise<void> {
  const q = encodeURIComponent(text);
  try {
    await Linking.openURL(`whatsapp://send?text=${q}`);
  } catch {
    try {
      await Linking.openURL(`https://wa.me/?text=${q}`);
    } catch {
      Alert.alert('WhatsApp não encontrado', 'Instale o WhatsApp ou copie a mensagem à mão.');
    }
  }
}
