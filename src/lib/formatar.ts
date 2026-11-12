export const formatoNumero = new Intl.NumberFormat("pt-PT", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatoRelativo = new Intl.RelativeTimeFormat("pt-PT", {
  numeric: "auto",
});

/** Data relativa calculada em relação a `referencia`, para o servidor e o browser darem o mesmo texto. */
export function tempoDesde(data: string, referencia: string) {
  const dias = Math.round(
    (new Date(data).getTime() - new Date(referencia).getTime()) / 86_400_000
  );
  if (dias > -1) return "hoje";
  if (dias > -30) return formatoRelativo.format(dias, "day");
  if (dias > -365)
    return formatoRelativo.format(Math.round(dias / 30), "month");
  return formatoRelativo.format(Math.round(dias / 365), "year");
}

/** Texto sem acentos e em minúsculas, para pesquisas. */
export function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Caminho da página de perfil de um mantenedor. */
export function caminhoMantenedor(login: string) {
  return `/mantenedores/${login.toLowerCase()}`;
}
