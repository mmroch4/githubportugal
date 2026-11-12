import {
  cabecalhos,
  INTERVALO_ATUALIZACAO,
  type Projeto,
} from "@/lib/projetos";

/**
 * Etiquetas que os projetos usam para assinalar issues boas para quem está a
 * começar. A API GraphQL compara os nomes à letra, por isso incluímos as
 * variações mais comuns.
 */
const ETIQUETAS_PRIMEIRA = [
  "good first issue",
  "Good First Issue",
  "Good first issue",
  "good-first-issue",
  "good first contribution",
  "first-timers-only",
  "first timers only",
  "beginner",
  "beginner friendly",
  "beginner-friendly",
];

/** Etiquetas de issues em que os mantenedores pedem ajuda. */
const ETIQUETAS_AJUDA = [
  "help wanted",
  "Help Wanted",
  "Help wanted",
  "help-wanted",
];

const ETIQUETAS = [...ETIQUETAS_PRIMEIRA, ...ETIQUETAS_AJUDA];

/** Máximo de issues por projeto, para um projeto grande não ocupar a lista toda. */
const MAXIMO_POR_PROJETO = 30;

export type TipoIssue = "primeira" | "ajuda";

export type Etiqueta = { nome: string; cor: string };

export type Issue = {
  url: string;
  numero: number;
  titulo: string;
  repositorio: string;
  tipo: TipoIssue;
  etiquetas: Etiqueta[];
  comentarios: number;
  criadaEm: string;
  atualizadaEm: string;
};

export type PrimeirasContribuicoes = {
  issues: Issue[];
  /** Número de issues disponíveis por repositório (chave em minúsculas). */
  porProjeto: Record<string, number>;
  atualizadoEm: string;
  dadosGitHubDisponiveis: boolean;
};

/** Nome de etiqueta comparável: minúsculas, sem hífenes nem emojis. */
function normalizarEtiqueta(nome: string) {
  return nome
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const PRIMEIRA = new Set(ETIQUETAS_PRIMEIRA.map(normalizarEtiqueta));
const AJUDA = new Set(ETIQUETAS_AJUDA.map(normalizarEtiqueta));

/** Uma issue com as duas etiquetas conta como boa primeira issue. */
function tipoDe(etiquetas: Etiqueta[]): TipoIssue | null {
  const nomes = etiquetas.map((e) => normalizarEtiqueta(e.nome));
  if (nomes.some((n) => PRIMEIRA.has(n))) return "primeira";
  if (nomes.some((n) => AJUDA.has(n))) return "ajuda";
  return null;
}

type IssueBruta = {
  url: string;
  numero: number;
  titulo: string;
  repositorio: string;
  etiquetas: Etiqueta[];
  comentarios: number;
  criadaEm: string;
  atualizadaEm: string;
  atribuida: boolean;
};

type GraphQLIssue = {
  number: number;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  comments: { totalCount: number };
  assignees: { totalCount: number };
  labels: { nodes: { name: string; color: string }[] };
};

/** Com GITHUB_TOKEN, pede as issues de vários repositórios por pedido. */
async function obterViaGraphQL(projetos: Projeto[]): Promise<IssueBruta[]> {
  const resultado: IssueBruta[] = [];
  const TAMANHO_LOTE = 25;
  const etiquetas = JSON.stringify(ETIQUETAS);

  for (let i = 0; i < projetos.length; i += TAMANHO_LOTE) {
    const lote = projetos.slice(i, i + TAMANHO_LOTE);
    const campos = lote
      .map(
        (p, j) => `r${j}: repository(owner: ${JSON.stringify(
          p.dono
        )}, name: ${JSON.stringify(p.nome)}) {
          issues(first: ${MAXIMO_POR_PROJETO}, states: OPEN, labels: ${etiquetas}, orderBy: { field: UPDATED_AT, direction: DESC }) {
            nodes {
              number title url createdAt updatedAt
              comments { totalCount }
              assignees { totalCount }
              labels(first: 10) { nodes { name color } }
            }
          }
        }`
      )
      .join("\n");

    const resposta = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { ...cabecalhos(), "Content-Type": "application/json" },
      body: JSON.stringify({ query: `query { ${campos} }` }),
      next: { revalidate: INTERVALO_ATUALIZACAO },
    });

    if (!resposta.ok) {
      throw new Error(`GraphQL respondeu com o estado ${resposta.status}`);
    }

    const { data } = (await resposta.json()) as {
      data?: Record<string, { issues: { nodes: GraphQLIssue[] } } | null>;
    };

    lote.forEach((p, j) => {
      for (const issue of data?.[`r${j}`]?.issues.nodes ?? []) {
        resultado.push({
          url: issue.url,
          numero: issue.number,
          titulo: issue.title,
          repositorio: p.repositorio,
          etiquetas: issue.labels.nodes.map((l) => ({
            nome: l.name,
            cor: l.color,
          })),
          comentarios: issue.comments.totalCount,
          criadaEm: issue.createdAt,
          atualizadaEm: issue.updatedAt,
          atribuida: issue.assignees.totalCount > 0,
        });
      }
    });
  }

  return resultado;
}

type RESTIssue = {
  number: number;
  title: string;
  html_url: string;
  repository_url: string;
  created_at: string;
  updated_at: string;
  comments: number;
  assignees?: unknown[] | null;
  pull_request?: unknown;
  labels: { name: string; color: string }[];
};

/**
 * Sem token, usa a pesquisa da API REST: junta vários repositórios em cada
 * pesquisa, respeitando o limite de 256 caracteres por pesquisa.
 */
async function obterViaPesquisa(projetos: Projeto[]): Promise<IssueBruta[]> {
  const base = `is:issue is:open no:assignee label:${[
    "good first issue",
    "good-first-issue",
    "first-timers-only",
    "help wanted",
    "help-wanted",
  ]
    .map((e) => `"${e}"`)
    .join(",")}`;

  const pesquisas: string[] = [];
  let atual = base;
  for (const p of projetos) {
    const filtro = ` repo:${p.repositorio}`;
    if (atual !== base && atual.length + filtro.length > 256) {
      pesquisas.push(atual);
      atual = base;
    }
    atual += filtro;
  }
  if (atual !== base) pesquisas.push(atual);

  const porNome = new Map(
    projetos.map((p) => [p.repositorio.toLowerCase(), p.repositorio])
  );

  const listas = await Promise.all(
    pesquisas.map(async (q) => {
      const url = `https://api.github.com/search/issues?q=${encodeURIComponent(
        q
      )}&sort=updated&order=desc&per_page=100`;
      const resposta = await fetch(url, {
        headers: cabecalhos(),
        next: { revalidate: INTERVALO_ATUALIZACAO },
      });
      if (!resposta.ok) {
        throw new Error(`A pesquisa respondeu com o estado ${resposta.status}`);
      }
      const { items } = (await resposta.json()) as { items: RESTIssue[] };
      return items
        .filter((i) => !i.pull_request)
        .map((i): IssueBruta => {
          const nome = i.repository_url.split("/").slice(-2).join("/");
          return {
            url: i.html_url,
            numero: i.number,
            titulo: i.title,
            repositorio: porNome.get(nome.toLowerCase()) ?? nome,
            etiquetas: i.labels.map((l) => ({ nome: l.name, cor: l.color })),
            comentarios: i.comments,
            criadaEm: i.created_at,
            atualizadaEm: i.updated_at,
            atribuida: (i.assignees?.length ?? 0) > 0,
          };
        });
    })
  );

  return listas.flat();
}

async function obterIssuesBrutas(
  projetos: Projeto[]
): Promise<IssueBruta[] | null> {
  try {
    if (process.env.GITHUB_TOKEN) {
      try {
        return await obterViaGraphQL(projetos);
      } catch (e) {
        console.warn("[issues] GraphQL falhou, a tentar a pesquisa REST:", e);
      }
    }
    return await obterViaPesquisa(projetos);
  } catch (e) {
    console.warn("[issues] Não foi possível obter issues do GitHub:", e);
    return null;
  }
}

/**
 * Issues abertas, sem ninguém atribuído e com etiquetas de "good first issue"
 * ou "help wanted", dos projetos ativos do diretório.
 */
export async function obterPrimeirasContribuicoes(
  projetos: Projeto[],
  atualizadoEm: string
): Promise<PrimeirasContribuicoes> {
  const ativos = projetos.filter((p) => !p.arquivado);
  const brutas = await obterIssuesBrutas(ativos);

  const issues: Issue[] = [];
  const porProjeto: Record<string, number> = {};
  const vistas = new Set<string>();

  for (const b of brutas ?? []) {
    if (b.atribuida || vistas.has(b.url)) continue;
    const tipo = tipoDe(b.etiquetas);
    if (!tipo) continue;
    const chave = b.repositorio.toLowerCase();
    if ((porProjeto[chave] ?? 0) >= MAXIMO_POR_PROJETO) continue;
    vistas.add(b.url);

    issues.push({
      url: b.url,
      numero: b.numero,
      titulo: b.titulo,
      repositorio: b.repositorio,
      tipo,
      etiquetas: b.etiquetas,
      comentarios: b.comentarios,
      criadaEm: b.criadaEm,
      atualizadaEm: b.atualizadaEm,
    });
    porProjeto[chave] = (porProjeto[chave] ?? 0) + 1;
  }

  issues.sort(
    (a, b) =>
      new Date(b.atualizadaEm).getTime() - new Date(a.atualizadaEm).getTime()
  );

  return {
    issues,
    porProjeto,
    atualizadoEm,
    dadosGitHubDisponiveis: brutas !== null,
  };
}
