import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  FICHEIROS_SELO,
  TAMANHOS_SELO,
  TEXTO_ALTERNATIVO_SELO,
  type VarianteSelo,
} from "@/lib/selo";

/*
 * SVG do selo "Feito em Portugal" (rota /selo/<ficheiro>.svg), gerados a
 * partir do logótipo em public/logo.svg, para que o selo e o logótipo nunca
 * fiquem diferentes.
 *
 * Os SVG são vistos como imagens (no GitHub passam pelo proxy de imagens), por
 * isso não podem carregar tipos de letra: usam letras do sistema e fixam a
 * largura do texto com `textLength`, para o selo ter sempre o mesmo tamanho.
 */

/** Cores do logótipo (verde e vermelho da bandeira). */
const VERDE = "#006400";
const VERMELHO = "#ff0000";

const LETRA_PLANO = "Verdana,Geneva,DejaVu Sans,sans-serif";
const LETRA_CARTAO =
  "-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif";

let caminhoLogo: Promise<string> | undefined;

/** O atributo `d` do Octocat em public/logo.svg. */
function lerCaminhoLogo() {
  caminhoLogo ??= readFile(
    path.join(process.cwd(), "public", "logo.svg"),
    "utf8"
  ).then((svg) => {
    const d = svg.match(/<path[^>]*\sd="([^"]+)"/)?.[1];
    if (!d) throw new Error("Não encontrei o desenho em public/logo.svg");
    return d;
  });
  return caminhoLogo;
}

/** O logótipo (círculo branco com o Octocat em degradê) num quadrado. */
function logo(d: string, x: number, y: number, tamanho: number) {
  return `<svg x="${x}" y="${y}" width="${tamanho}" height="${tamanho}" viewBox="0 0 836 836">
    <defs>
      <linearGradient id="gp-logo" x1="0" y1="0" x2="836" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${VERDE}"/>
        <stop offset="1" stop-color="${VERMELHO}"/>
      </linearGradient>
      <clipPath id="gp-logo-circulo"><circle cx="418" cy="418" r="418"/></clipPath>
    </defs>
    <circle cx="418" cy="418" r="418" fill="#fff"/>
    <path clip-path="url(#gp-logo-circulo)" fill="url(#gp-logo)" fill-rule="evenodd" d="${d}"/>
  </svg>`;
}

/** Selo pequeno, no estilo dos selos do shields.io: serve em fundo claro e escuro. */
function seloPlano(d: string) {
  const { largura, altura } = TAMANHOS_SELO.plano;
  const esquerda = 77;
  const direita = largura - esquerda;
  const texto = (x: number, comprimento: number, conteudo: string) =>
    `<text x="${x}" y="15" fill="#010101" fill-opacity=".3" textLength="${comprimento}" lengthAdjust="spacingAndGlyphs">${conteudo}</text>
    <text x="${x}" y="14" textLength="${comprimento}" lengthAdjust="spacingAndGlyphs">${conteudo}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}" viewBox="0 0 ${largura} ${altura}" role="img" aria-label="${TEXTO_ALTERNATIVO_SELO}">
  <title>${TEXTO_ALTERNATIVO_SELO} · GitHub Portugal</title>
  <defs>
    <linearGradient id="gp-brilho" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <linearGradient id="gp-bandeira" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${VERDE}"/>
      <stop offset="1" stop-color="#d40000"/>
    </linearGradient>
    <clipPath id="gp-cantos"><rect width="${largura}" height="${altura}" rx="3"/></clipPath>
  </defs>
  <g clip-path="url(#gp-cantos)">
    <rect width="${esquerda}" height="${altura}" fill="#24292f"/>
    <rect x="${esquerda}" width="${direita}" height="${altura}" fill="url(#gp-bandeira)"/>
    <rect width="${largura}" height="${altura}" fill="url(#gp-brilho)"/>
  </g>
  ${logo(d, 5, 3, 14)}
  <g fill="#fff" font-family="${LETRA_PLANO}" font-size="11">
    ${texto(23, 48, "Feito em")}
    ${texto(esquerda + 6, 46, "Portugal")}
  </g>
</svg>
`;
}

const TEMAS_CARTAO = {
  claro: {
    fundo: "#ffffff",
    borda: "#d0d7de",
    texto: "#1f2328",
    secundario: "#59636e",
  },
  escuro: {
    fundo: "#0d1117",
    borda: "#3d444d",
    texto: "#f0f6fc",
    secundario: "#9198a1",
  },
};

/** Selo maior, com o nome do site, numa versão para cada tema do GitHub. */
function seloCartao(d: string, tema: "claro" | "escuro") {
  const { largura, altura } = TAMANHOS_SELO[tema];
  const cores = TEMAS_CARTAO[tema];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}" viewBox="0 0 ${largura} ${altura}" role="img" aria-label="${TEXTO_ALTERNATIVO_SELO}">
  <title>${TEXTO_ALTERNATIVO_SELO} · GitHub Portugal</title>
  <rect x=".5" y=".5" width="${largura - 1}" height="${
    altura - 1
  }" rx="6" fill="${cores.fundo}" stroke="${cores.borda}"/>
  ${logo(d, 8, 7, 26)}
  <g font-family="${LETRA_CARTAO}">
    <text x="43" y="19" font-size="14" font-weight="700" fill="${
      cores.texto
    }" textLength="119" lengthAdjust="spacingAndGlyphs">Feito em Portugal</text>
    <text x="43" y="33" font-size="11" fill="${
      cores.secundario
    }" textLength="94" lengthAdjust="spacingAndGlyphs">githubportugal.com</text>
  </g>
</svg>
`;
}

/** O SVG de uma variante do selo. */
export async function gerarSelo(variante: VarianteSelo) {
  const d = await lerCaminhoLogo();
  return variante === "plano" ? seloPlano(d) : seloCartao(d, variante);
}

/** A variante correspondente a um nome de ficheiro, ou undefined. */
export function varianteDoFicheiro(ficheiro: string) {
  return (Object.keys(FICHEIROS_SELO) as VarianteSelo[]).find(
    (v) => FICHEIROS_SELO[v] === ficheiro
  );
}
