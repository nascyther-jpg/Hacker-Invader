"""Gera as folhas A4 com os QR dos blocos, uma por conjunto (solo, Time Amarelo, Time Ciano).

Lê os códigos e os lugares direto de src/game/config.ts, então as folhas sempre batem com o app.

Uso:  python3 scripts/gerar_qr.py <pasta de saída>
Precisa de: pip install qrcode pillow reportlab  (e `npm install` para as fontes).
"""

import re
import sys
from pathlib import Path

import qrcode
from reportlab.lib.colors import HexColor, black
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / 'node_modules/@expo-google-fonts'
pdfmetrics.registerFont(TTFont('Display', FONTS / 'rajdhani/700Bold/Rajdhani_700Bold.ttf'))
pdfmetrics.registerFont(TTFont('Mono', FONTS / 'jetbrains-mono/700Bold/JetBrainsMono_700Bold.ttf'))
pdfmetrics.registerFont(TTFont('Read', FONTS / 'atkinson-hyperlegible/400Regular/AtkinsonHyperlegible_400Regular.ttf'))

SETS = {
    'solo': {'title': 'Missão solo', 'file': 'qr-solo-a4.pdf', 'band': None, 'tag': None},
    'A': {'title': 'Time Amarelo', 'file': 'qr-time-amarelo-a4.pdf', 'band': '#FCEE0A', 'tag': 'TIME AMARELO'},
    'B': {'title': 'Time Ciano', 'file': 'qr-time-ciano-a4.pdf', 'band': '#00F0FF', 'tag': 'TIME CIANO'},
}


def read_config():
    src = (ROOT / 'src/game/config.ts').read_text(encoding='utf-8')
    codes = {}
    for key in SETS:
        block = re.search(rf'\n  {key}: \[(.*?)\]', src, re.S).group(1)
        codes[key] = re.findall(r"'(BLACKNODE-[^']+)'", block)
    places = re.findall(r"name: '([^']+)'", src.split('export const PLACES')[1].split('];')[0])
    return codes, places


def qr_image(text):
    q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=20, border=0)
    q.add_data(text)
    q.make(fit=True)
    return ImageReader(q.make_image(fill_color='black', back_color='white').get_image())


def draw_sheet(path, meta, codes, places):
    W, H = A4
    c = canvas.Canvas(str(path), pagesize=A4)
    c.setTitle(f'BLACK NODE · QR {meta["title"]}')
    margin, gap = 12 * mm, 10 * mm
    top = 32 * mm
    cw = (W - 2 * margin - gap) / 2
    ch = (H - top - margin - gap) / 2
    per_page = 4
    pages = (len(codes) + per_page - 1) // per_page

    for page in range(pages):
        c.setFillColor(black)
        c.setFont('Display', 24)
        c.drawCentredString(W / 2, H - 16 * mm, f'BLACK NODE · {meta["title"]}')
        c.setFont('Mono', 9)
        c.setFillColor(HexColor('#555555'))
        c.drawCentredString(
            W / 2, H - 23 * mm,
            f'Recorte na linha. Imprima em 100% (sem ajustar à página). Folha {page + 1} de {pages}.',
        )
        for slot in range(per_page):
            i = page * per_page + slot
            if i >= len(codes):
                break
            col, row = slot % 2, slot // 2
            x = margin + col * (cw + gap)
            y = H - top - (row + 1) * ch - row * gap
            draw_card(c, x, y, cw, ch, i + 1, codes[i], places[i], meta)
        c.showPage()
    c.save()


def draw_card(c, x, y, w, h, n, code, place, meta):
    c.setStrokeColor(HexColor('#999999'))
    c.setLineWidth(0.8)
    c.setDash(4, 3)
    c.rect(x, y, w, h)
    c.setDash()
    cx = x + w / 2
    band = 14 * mm
    if meta['band']:
        # Faixa colorida + nome do time em texto: funciona também em impressora preto e branco.
        c.setFillColor(HexColor(meta['band']))
        c.rect(x, y + h - band, w, band, stroke=0, fill=1)
        c.setFillColor(black)
        c.setFont('Mono', 13)
        c.drawCentredString(cx, y + h - band + 5 * mm, meta['tag'])
    c.setFillColor(black)
    c.setFont('Display', 32)
    c.drawCentredString(cx, y + h - band - 13 * mm, f'BLOCO {n:02d}')
    size = 58 * mm
    c.drawImage(qr_image(code), cx - size / 2, y + 30 * mm, size, size)
    c.setFont('Mono', 12)
    c.drawCentredString(cx, y + 21 * mm, code)
    c.setFont('Read', 10)
    c.setFillColor(HexColor('#555555'))
    c.drawCentredString(cx, y + 9 * mm, f'Esconder em: {place}')


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
    out.mkdir(parents=True, exist_ok=True)
    codes, places = read_config()
    for key, meta in SETS.items():
        draw_sheet(out / meta['file'], meta, codes[key], places)
        print(out / meta['file'], len(codes[key]), 'blocos')


if __name__ == '__main__':
    main()
