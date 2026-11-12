import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";

/** Pasta com os artigos. Cada artigo é um ficheiro `<slug>.mdx`. */
export const PASTA_ARTIGOS = path.join(
  process.cwd(),
  "src",
  "content",
  "artigos"
);

/** Autor usado quando o artigo não indica `autor`. */
export const EQUIPA = "Equipa GitHub Portugal";

export type Artigo = {
  slug: string;
  titulo: string;
  descricao: string;
  /** AAAA-MM-DD */
  data: string;
  /** AAAA-MM-DD, quando o artigo foi revisto depois de publicado. */
  atualizado: string | null;
  /** Login do GitHub de quem escreveu, ou `null` para a equipa. */
  autor: string | null;
  etiquetas: string[];
  /** Tempo de leitura estimado, em minutos. */
  minutos: number;
};

type Frontmatter = {
  titulo?: unknown;
  descricao?: unknown;
  data?: unknown;
  atualizado?: unknown;
  autor?: unknown;
  etiquetas?: unknown;
};

const PADRAO_FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const PALAVRAS_POR_MINUTO = 200;

/** Ficheiros começados por `_` (por exemplo, modelos) não são publicados. */
const ehArtigo = (ficheiro: string) =>
  ficheiro.endsWith(".mdx") && !ficheiro.startsWith("_");

function texto(valor: unknown) {
  return typeof valor === "string" ? valor.trim() : "";
}

/** O YAML lê `2026-11-12` como data; voltamos a pô-la no formato AAAA-MM-DD. */
function dataIso(valor: unknown) {
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  return typeof valor === "string" ? valor.trim() : "";
}

function contarMinutos(corpo: string) {
  const palavras = corpo
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(palavras / PALAVRAS_POR_MINUTO));
}

async function lerArtigo(ficheiro: string): Promise<Artigo> {
  const slug = ficheiro.replace(/\.mdx$/, "");
  const conteudo = await readFile(path.join(PASTA_ARTIGOS, ficheiro), "utf8");
  const correspondencia = conteudo.match(PADRAO_FRONTMATTER);
  if (!correspondencia) {
    throw new Error(
      `O artigo ${ficheiro} não tem o cabeçalho (frontmatter) entre linhas ---.`
    );
  }

  const dados = (parse(correspondencia[1]) ?? {}) as Frontmatter;
  const titulo = texto(dados.titulo);
  const descricao = texto(dados.descricao);
  const data = dataIso(dados.data);
  if (!titulo || !descricao || !data) {
    throw new Error(
      `O artigo ${ficheiro} tem de ter titulo, descricao e data no cabeçalho.`
    );
  }

  return {
    slug,
    titulo,
    descricao,
    data,
    atualizado: dataIso(dados.atualizado) || null,
    autor: texto(dados.autor) || null,
    etiquetas: Array.isArray(dados.etiquetas)
      ? dados.etiquetas.map(texto).filter(Boolean)
      : [],
    minutos: contarMinutos(conteudo.slice(correspondencia[0].length)),
  };
}

/** Todos os artigos, do mais recente para o mais antigo. */
export async function lerArtigos(): Promise<Artigo[]> {
  const ficheiros = (await readdir(PASTA_ARTIGOS)).filter(ehArtigo);
  const artigos = await Promise.all(ficheiros.map(lerArtigo));
  return artigos.sort(
    (a, b) => b.data.localeCompare(a.data) || a.titulo.localeCompare(b.titulo)
  );
}

export async function obterArtigo(slug: string) {
  const artigos = await lerArtigos();
  return artigos.find((a) => a.slug === slug) ?? null;
}

const formatoData = new Intl.DateTimeFormat("pt-PT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "12 de novembro de 2026" */
export function formatarData(data: string) {
  return formatoData.format(new Date(`${data.slice(0, 10)}T00:00:00Z`));
}
