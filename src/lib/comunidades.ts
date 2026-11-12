import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";

const FICHEIRO_COMUNIDADES = path.join(
  process.cwd(),
  "data",
  "comunidades.yml"
);

export type Comunidade = {
  nome: string;
  descricao: string;
  categoria: string;
  /** null para comunidades nacionais ou online. */
  cidade: string | null;
  site: string;
  github: string | null;
};

export async function obterComunidades(): Promise<{
  comunidades: Comunidade[];
  categorias: string[];
}> {
  const conteudo = await readFile(FICHEIRO_COMUNIDADES, "utf8");
  const dados = parse(conteudo) as {
    categorias?: string[];
    comunidades?: Partial<Comunidade>[];
  };

  const comunidades = (dados?.comunidades ?? []).map((c) => ({
    nome: c.nome ?? "",
    descricao: c.descricao ?? "",
    categoria: c.categoria ?? "",
    cidade: c.cidade ?? null,
    site: c.site ?? "",
    github: c.github ?? null,
  }));

  comunidades.sort((a, b) => a.nome.localeCompare(b.nome, "pt-PT"));

  return { comunidades, categorias: dados?.categorias ?? [] };
}
