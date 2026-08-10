/*
 * Gera os ícones do PWA do app de campo (PRD-020).
 *
 *   node scripts/gerar-icones-pwa.js
 *
 * Escreve PNG na unha (zlib + CRC32) porque o projeto não tem — e não precisa
 * ter — dependência de processamento de imagem. O desenho é geométrico de
 * propósito: sem rasterizador de fonte, o que se pode desenhar bem é forma.
 *
 * A arte segue a identidade do CLAUDE.md: fundo asfalto, monte de terra em
 * amarelo-máquina e a faixa de sinalização de canteiro (listras diagonais).
 */
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DESTINO = join(RAIZ, "public");

// Tokens de cor do design system.
const ASFALTO = [0x16, 0x14, 0x0f];
const ASFALTO_2 = [0x2c, 0x27, 0x19];
const AMARELO = [0xff, 0xb3, 0x00];

/* ---------------- PNG ---------------- */

const TABELA_CRC = (() => {
  const tabela = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tabela[n] = c;
  }
  return tabela;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = TABELA_CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(tipo, dados) {
  const tamanho = Buffer.alloc(4);
  tamanho.writeUInt32BE(dados.length);
  const corpo = Buffer.concat([Buffer.from(tipo, "ascii"), dados]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(corpo));
  return Buffer.concat([tamanho, corpo, crc]);
}

/** pixels: Uint8Array RGB (3 bytes por pixel), sem canal alfa. */
function montarPng(largura, altura, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(largura, 0);
  ihdr.writeUInt32BE(altura, 4);
  ihdr[8] = 8; // bits por canal
  ihdr[9] = 2; // color type 2 = RGB
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // filtro adaptativo
  ihdr[12] = 0; // sem entrelaçamento

  // Cada scanline é precedida do byte de filtro (0 = None).
  const bruto = Buffer.alloc(altura * (1 + largura * 3));
  for (let y = 0; y < altura; y += 1) {
    const inicioLinha = y * (1 + largura * 3);
    bruto[inicioLinha] = 0;
    pixels.copy
      ? pixels.copy(bruto, inicioLinha + 1, y * largura * 3, (y + 1) * largura * 3)
      : Buffer.from(pixels).copy(bruto, inicioLinha + 1, y * largura * 3, (y + 1) * largura * 3);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(bruto, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------------- arte ---------------- */

function desenhar(tamanho) {
  const pixels = Buffer.alloc(tamanho * tamanho * 3);
  const s = tamanho;

  // Geometria em fração do lado, para escalar sem retrabalho. Tudo dentro dos
  // 80% centrais, que é a área segura de um ícone maskable.
  const apiceX = 0.5 * s;
  const apiceY = 0.3 * s;
  const baseY = 0.66 * s;
  const baseEsq = 0.18 * s;
  const baseDir = 0.82 * s;

  const faixaTopo = 0.72 * s;
  const faixaBase = 0.84 * s;
  const periodoListra = Math.max(4, Math.round(0.16 * s));

  for (let y = 0; y < s; y += 1) {
    for (let x = 0; x < s; x += 1) {
      let cor = ASFALTO;

      // Monte de terra: triângulo isósceles apontando para cima.
      if (y >= apiceY && y <= baseY) {
        const progresso = (y - apiceY) / (baseY - apiceY);
        const meiaLargura = ((baseDir - baseEsq) / 2) * progresso;
        if (x >= apiceX - meiaLargura && x <= apiceX + meiaLargura) cor = AMARELO;
      }

      // Faixa de sinalização: listras a 45°.
      if (y >= faixaTopo && y < faixaBase) {
        cor = (x + y) % periodoListra < periodoListra / 2 ? AMARELO : ASFALTO_2;
      }

      const i = (y * s + x) * 3;
      pixels[i] = cor[0];
      pixels[i + 1] = cor[1];
      pixels[i + 2] = cor[2];
    }
  }

  return montarPng(s, s, pixels);
}

for (const [arquivo, tamanho] of [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-touch-icon.png", 180],
]) {
  writeFileSync(join(DESTINO, arquivo), desenhar(tamanho));
  console.log(`public/${arquivo} — ${tamanho}×${tamanho}`);
}
