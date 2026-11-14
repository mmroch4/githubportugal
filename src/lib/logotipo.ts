/*
 * Logótipo do GitHub Portugal: as cinco quinas da bandeira, como escudetes,
 * entre chavetas de código (verde à esquerda, vermelha à direita).
 *
 * É a única fonte do desenho: o componente <Logo>, o selo "Feito em Portugal"
 * e os ficheiros em public/ e src/app/ usam estes caminhos (viewBox 0 0 64 64).
 */

export const LOGOTIPO_VIEWBOX = "0 0 64 64";

export const CHAVETA_ESQUERDA =
  "M22 10C15 10 15 15 15 21V26C15 29.5 13 32 9 32C13 32 15 34.5 15 38V43C15 49 15 54 22 54";

export const CHAVETA_DIREITA =
  "M42 10C49 10 49 15 49 21V26C49 29.5 51 32 55 32C51 32 49 34.5 49 38V43C49 49 49 54 42 54";

/** As cinco quinas, em cruz, cada uma um pequeno escudo. */
export const QUINAS =
  "M28.5 19H35.5V23.4Q35.5 27 32 27Q28.5 27 28.5 23.4ZM20 28H27V32.4Q27 36 23.5 36Q20 36 20 32.4ZM28.5 28H35.5V32.4Q35.5 36 32 36Q28.5 36 28.5 32.4ZM37 28H44V32.4Q44 36 40.5 36Q37 36 37 32.4ZM28.5 37H35.5V41.4Q35.5 45 32 45Q28.5 45 28.5 41.4Z";

export const ESPESSURA_CHAVETAS = 4;

/** Cores do logótipo no tema escuro (o predefinido do site). */
export const CORES_LOGOTIPO = {
  verde: "#36c95a",
  vermelho: "#f8524a",
  quinasEscuro: "#e6edf3",
  quinasClaro: "#0d1117",
};

/** O desenho (sem <svg> à volta), com as quinas na cor indicada. */
export function desenhoLogotipo(corQuinas: string) {
  const traco = `fill="none" stroke-width="${ESPESSURA_CHAVETAS}" stroke-linecap="round" stroke-linejoin="round"`;
  return `<path d="${CHAVETA_ESQUERDA}" stroke="${CORES_LOGOTIPO.verde}" ${traco}/><path d="${CHAVETA_DIREITA}" stroke="${CORES_LOGOTIPO.vermelho}" ${traco}/><path d="${QUINAS}" fill="${corQuinas}"/>`;
}
