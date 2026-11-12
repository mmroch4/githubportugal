import { readFile } from "node:fs/promises";
import path from "node:path";
import { obterAgenda } from "@/lib/eventos";
import { obterComunidades } from "@/lib/comunidades";
import { obterEmpresas } from "@/lib/empresas";
import { listarLogins } from "@/lib/mantenedores";
import { obterDiretorio } from "@/lib/projetos";

const FICHEIRO_ESTATISTICAS = path.join(
  process.cwd(),
  "data",
  "estatisticas.json"
);

/** Nome de cada cidade do ranking (ids de scripts/gerar-ranking.mjs). */
export const NOMES_CIDADES: Record<string, string> = {
  lisboa: "Lisboa",
  porto: "Porto",
  braga: "Braga",
  coimbra: "Coimbra",
  outra: "Resto do país",
};

/** Um valor de um gráfico de barras. */
export type Barra = { rotulo: string; valor: number; detalhe?: string };

export type PontoHistorico = {
  data: string;
  pessoas: number;
  ativas: number;
  contribuicoes: number;
};

/** Totais de quem programa em Portugal, gerados todas as semanas com o ranking. */
export type EstatisticasProgramadores = {
  geradoEm: string;
  pessoas: number;
  ativas: number;
  contribuicoes: number;
  seguidores: number;
  cidades: Barra[];
  linguagens: Barra[];
  escaloesContribuicoes: Barra[];
  historico: PontoHistorico[];
};

export type Estatisticas = {
  programadores: EstatisticasProgramadores | null;
  comunidade: {
    projetos: number;
    estrelas: number;
    forks: number;
    mantenedores: number;
    empresas: number;
    comunidades: number;
    eventosProximos: number;
  };
  projetos: {
    linguagens: Barra[];
    categorias: Barra[];
    porAno: Barra[];
    maisEstrelas: Barra[];
    dadosGitHubDisponiveis: boolean;
  };
  cidadesComunidades: Barra[];
  atualizadoEm: string;
};

type FicheiroEstatisticas = {
  geradoEm: string | null;
  pessoas?: number;
  ativas?: number;
  contribuicoes?: number;
  seguidores?: number;
  cidades?: Record<string, number>;
  linguagens?: Record<string, number>;
  escaloesContribuicoes?: {
    minimo: number;
    maximo: number | null;
    pessoas: number;
  }[];
  historico?: PontoHistorico[];
};

const numero = new Intl.NumberFormat("pt-PT");

/** Linguagens mostradas no gráfico; as restantes juntam-se em "Outras". */
const MAXIMO_LINGUAGENS = 12;

/** Ordena do maior para o menor e junta a cauda numa barra "Outras". */
function topoComOutras(
  contagem: Record<string, number> | Map<string, number>,
  maximo: number,
  rotuloOutras = "Outras"
): Barra[] {
  const entradas = Array.from(
    contagem instanceof Map ? contagem.entries() : Object.entries(contagem)
  ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-PT"));
  const barras = entradas
    .slice(0, maximo)
    .map(([rotulo, valor]) => ({ rotulo, valor }));
  const resto = entradas.slice(maximo).reduce((t, [, v]) => t + v, 0);
  if (resto > 0) barras.push({ rotulo: rotuloOutras, valor: resto });
  return barras;
}

function contar<T>(itens: T[], chave: (item: T) => string | null) {
  const contagem = new Map<string, number>();
  for (const item of itens) {
    const valor = chave(item);
    if (valor) contagem.set(valor, (contagem.get(valor) ?? 0) + 1);
  }
  return contagem;
}

function rotuloEscalao(minimo: number, maximo: number | null) {
  if (maximo === minimo) return numero.format(minimo);
  if (maximo === null) return `${numero.format(minimo)} ou mais`;
  return `${numero.format(minimo)} a ${numero.format(maximo)}`;
}

export async function lerProgramadores(): Promise<EstatisticasProgramadores | null> {
  let dados: FicheiroEstatisticas;
  try {
    dados = JSON.parse(await readFile(FICHEIRO_ESTATISTICAS, "utf8"));
  } catch {
    return null;
  }
  if (!dados.geradoEm || !dados.pessoas) return null;

  const cidades = Object.keys(NOMES_CIDADES).map((id) => ({
    rotulo: NOMES_CIDADES[id],
    valor: dados.cidades?.[id] ?? 0,
  }));
  // "Resto do país" fica sempre em último; as cidades ordenam-se pelo número.
  const resto = cidades.pop()!;
  cidades.sort((a, b) => b.valor - a.valor);

  return {
    geradoEm: dados.geradoEm,
    pessoas: dados.pessoas,
    ativas: dados.ativas ?? 0,
    contribuicoes: dados.contribuicoes ?? 0,
    seguidores: dados.seguidores ?? 0,
    cidades: [...cidades, resto],
    linguagens: topoComOutras(dados.linguagens ?? {}, MAXIMO_LINGUAGENS),
    escaloesContribuicoes: (dados.escaloesContribuicoes ?? []).map((e) => ({
      rotulo: rotuloEscalao(e.minimo, e.maximo),
      valor: e.pessoas,
    })),
    historico: dados.historico ?? [],
  };
}

export async function obterEstatisticas(): Promise<Estatisticas> {
  const [
    programadores,
    diretorio,
    logins,
    { empresas },
    { comunidades },
    agenda,
  ] = await Promise.all([
    lerProgramadores(),
    obterDiretorio(),
    listarLogins(),
    obterEmpresas(),
    obterComunidades(),
    obterAgenda(),
  ]);

  const { projetos } = diretorio;
  const ativos = projetos.filter((p) => !p.arquivado);

  const anos = contar(projetos, (p) => p.criadoEm?.slice(0, 4) ?? null);
  const porAno = Array.from(anos.keys())
    .sort()
    .map((ano) => ({ rotulo: ano, valor: anos.get(ano)! }));

  const maisEstrelas = projetos
    .filter((p) => p.estrelas !== null)
    .slice(0, 10)
    .map((p) => ({
      rotulo: p.repositorio,
      valor: p.estrelas!,
      detalhe: p.linguagem ?? undefined,
    }));

  return {
    programadores,
    comunidade: {
      projetos: projetos.length,
      estrelas: projetos.reduce((t, p) => t + (p.estrelas ?? 0), 0),
      forks: projetos.reduce((t, p) => t + (p.forks ?? 0), 0),
      mantenedores: logins.length,
      empresas: empresas.length,
      comunidades: comunidades.length,
      eventosProximos: agenda.proximos.length,
    },
    projetos: {
      linguagens: topoComOutras(
        contar(ativos, (p) => p.linguagem),
        8
      ),
      categorias: topoComOutras(
        contar(projetos, (p) => p.categoria),
        8
      ),
      porAno,
      maisEstrelas,
      dadosGitHubDisponiveis: diretorio.dadosGitHubDisponiveis,
    },
    cidadesComunidades: topoComOutras(
      contar(comunidades, (c) => c.cidade ?? "Nacional ou online"),
      8,
      "Outras cidades"
    ),
    atualizadoEm: diretorio.atualizadoEm,
  };
}
