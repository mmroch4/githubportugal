import { INTERVALO_ATUALIZACAO } from "@/lib/projetos";

/**
 * Etiquetas do dev.to cujos artigos aparecem na página de artigos. Quem
 * publicar no dev.to com uma destas etiquetas aparece aqui sozinho.
 */
export const ETIQUETAS_DEVTO = ["githubportugal", "portugal"];

/** Máximo de artigos do dev.to a mostrar. */
const MAXIMO = 30;

export type ArtigoDevTo = {
  id: number;
  titulo: string;
  descricao: string;
  url: string;
  /** Data ISO de publicação. */
  publicadoEm: string;
  etiquetas: string[];
  minutos: number;
  reacoes: number;
  comentarios: number;
  autor: { nome: string; username: string; avatar: string };
};

type RespostaDevTo = {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  tag_list: string[] | string;
  reading_time_minutes?: number;
  public_reactions_count?: number;
  positive_reactions_count?: number;
  comments_count?: number;
  user: { name: string; username: string; profile_image_90: string };
};

async function porEtiqueta(etiqueta: string): Promise<ArtigoDevTo[]> {
  const url = `https://dev.to/api/articles?tag=${encodeURIComponent(
    etiqueta
  )}&per_page=${MAXIMO}`;
  const resposta = await fetch(url, {
    headers: { Accept: "application/vnd.forem.api-v1+json" },
    next: { revalidate: INTERVALO_ATUALIZACAO },
  });
  if (!resposta.ok) {
    throw new Error(`dev.to respondeu ${resposta.status} para #${etiqueta}`);
  }
  const dados = (await resposta.json()) as RespostaDevTo[];

  return dados.map((a) => ({
    id: a.id,
    titulo: a.title,
    descricao: a.description,
    url: a.url,
    publicadoEm: a.published_at,
    etiquetas: Array.isArray(a.tag_list)
      ? a.tag_list
      : a.tag_list.split(",").map((t) => t.trim()),
    minutos: a.reading_time_minutes ?? 1,
    reacoes: a.public_reactions_count ?? a.positive_reactions_count ?? 0,
    comentarios: a.comments_count ?? 0,
    autor: {
      nome: a.user.name,
      username: a.user.username,
      avatar: a.user.profile_image_90,
    },
  }));
}

/**
 * Artigos recentes do dev.to com as etiquetas da comunidade, do mais recente
 * para o mais antigo. Se o dev.to não responder, devolve uma lista vazia e
 * `disponivel: false`, para a página continuar a funcionar.
 */
export async function obterArtigosDevTo(): Promise<{
  artigos: ArtigoDevTo[];
  disponivel: boolean;
}> {
  const resultados = await Promise.allSettled(ETIQUETAS_DEVTO.map(porEtiqueta));

  const porId = new Map<number, ArtigoDevTo>();
  for (const r of resultados) {
    if (r.status === "fulfilled") {
      for (const a of r.value) porId.set(a.id, a);
    } else {
      console.warn(`Artigos do dev.to: ${r.reason}`);
    }
  }

  const artigos = Array.from(porId.values())
    .sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm))
    .slice(0, MAXIMO);

  return {
    artigos,
    disponivel: resultados.some((r) => r.status === "fulfilled"),
  };
}
