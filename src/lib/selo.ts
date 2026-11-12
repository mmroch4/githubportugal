import { siteUrl } from "@/config/metadata";

/*
 * Selo "Feito em Portugal" para os README dos projetos do diretório: nomes,
 * tamanhos e URLs. Pode ser usado no browser; os SVG são gerados em
 * src/lib/gerar-selo.ts.
 */

export type VarianteSelo = "plano" | "claro" | "escuro";

export const FICHEIROS_SELO: Record<VarianteSelo, string> = {
  plano: "feito-em-portugal.svg",
  claro: "feito-em-portugal-claro.svg",
  escuro: "feito-em-portugal-escuro.svg",
};

export const TAMANHOS_SELO: Record<
  VarianteSelo,
  { largura: number; altura: number }
> = {
  plano: { largura: 135, altura: 20 },
  claro: { largura: 174, altura: 40 },
  escuro: { largura: 174, altura: 40 },
};

export const TEXTO_ALTERNATIVO_SELO = "Feito em Portugal";

/** URL absoluto do SVG de uma variante do selo. */
export const urlSelo = (variante: VarianteSelo) =>
  `${siteUrl}/selo/${FICHEIROS_SELO[variante]}`;

/** Página para onde o selo aponta: a entrada do projeto no diretório. */
export function urlDestinoSelo(repositorio?: string) {
  return repositorio
    ? `${siteUrl}/projetos?q=${encodeURIComponent(repositorio)}`
    : `${siteUrl}/projetos`;
}
