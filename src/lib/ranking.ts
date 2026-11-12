import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import {
  AMBITOS,
  METRICAS,
  type Ambito,
  type Metrica,
  type PessoaRanking,
  type Ranking,
} from "@/lib/ranking-tipos";

const FICHEIRO_RANKING = path.join(process.cwd(), "data", "ranking.json");
const FICHEIRO_EXCLUIDOS = path.join(
  process.cwd(),
  "data",
  "ranking-excluidos.yml"
);

type FicheiroRanking = {
  geradoEm: string | null;
  totalAnalisado: number;
  pessoas: PessoaRanking[];
  listas: Partial<Record<Ambito, Partial<Record<Metrica, string[]>>>>;
};

async function lerExcluidos(): Promise<Set<string>> {
  try {
    const dados = parse(await readFile(FICHEIRO_EXCLUIDOS, "utf8")) as {
      excluidos?: unknown;
    };
    const lista = Array.isArray(dados?.excluidos) ? dados.excluidos : [];
    return new Set(
      lista
        .filter((l): l is string => typeof l === "string")
        .map((l) => l.toLowerCase())
    );
  } catch {
    return new Set();
  }
}

/**
 * Ranking gerado pela GitHub Action "Atualizar ranking". Quem está em
 * data/ranking-excluidos.yml sai logo, sem esperar pela próxima atualização.
 */
export async function obterRanking(): Promise<Ranking> {
  const [conteudo, excluidos] = await Promise.all([
    readFile(FICHEIRO_RANKING, "utf8"),
    lerExcluidos(),
  ]);
  const dados = JSON.parse(conteudo) as FicheiroRanking;

  const pessoas: Record<string, PessoaRanking> = {};
  for (const p of dados.pessoas ?? []) {
    if (!excluidos.has(p.login.toLowerCase())) pessoas[p.login] = p;
  }

  const listas = {} as Ranking["listas"];
  for (const { id } of AMBITOS) {
    listas[id] = {} as Record<Metrica, string[]>;
    for (const metrica of METRICAS) {
      listas[id][metrica] = (dados.listas?.[id]?.[metrica] ?? []).filter(
        (login) => login in pessoas
      );
    }
  }

  return {
    geradoEm: dados.geradoEm,
    totalAnalisado: dados.totalAnalisado ?? 0,
    pessoas,
    listas,
  };
}
