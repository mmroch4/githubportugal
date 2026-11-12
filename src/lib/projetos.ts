import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";

/** Intervalo entre atualizações dos dados do GitHub, em segundos (6 horas). */
export const INTERVALO_ATUALIZACAO = 21600;

const FICHEIRO_PROJETOS = path.join(process.cwd(), "data", "projetos.yml");

type EntradaProjeto = {
  repositorio: string;
  descricao: string;
  categoria: string;
  site?: string;
};

type FicheiroProjetos = {
  categorias: string[];
  projetos: EntradaProjeto[];
};

type DadosGitHub = {
  nome: string;
  url: string;
  avatar: string;
  estrelas: number;
  forks: number;
  linguagem: string | null;
  corLinguagem: string | null;
  ultimaAtividade: string | null;
  arquivado: boolean;
  site: string | null;
};

export type Projeto = {
  repositorio: string;
  dono: string;
  nome: string;
  descricao: string;
  categoria: string;
  url: string;
  avatar: string;
  site: string | null;
  estrelas: number | null;
  forks: number | null;
  linguagem: string | null;
  corLinguagem: string | null;
  ultimaAtividade: string | null;
  arquivado: boolean;
};

export type Diretorio = {
  categorias: string[];
  projetos: Projeto[];
  atualizadoEm: string;
  dadosGitHubDisponiveis: boolean;
};

async function lerFicheiro(): Promise<FicheiroProjetos> {
  const conteudo = await readFile(FICHEIRO_PROJETOS, "utf8");
  const dados = parse(conteudo) as FicheiroProjetos;
  return {
    categorias: dados.categorias ?? [],
    projetos: dados.projetos ?? [],
  };
}

export function cabecalhos(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "githubportugal",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

/**
 * Com GITHUB_TOKEN, pede todos os repositórios à API GraphQL em poucos pedidos
 * (e obtém também a cor de cada linguagem).
 */
async function obterViaGraphQL(
  repositorios: string[]
): Promise<Map<string, DadosGitHub>> {
  const resultado = new Map<string, DadosGitHub>();
  const TAMANHO_LOTE = 50;

  for (let i = 0; i < repositorios.length; i += TAMANHO_LOTE) {
    const lote = repositorios.slice(i, i + TAMANHO_LOTE);
    const campos = lote
      .map((repo, j) => {
        const [dono, nome] = repo.split("/");
        return `r${j}: repository(owner: ${JSON.stringify(
          dono
        )}, name: ${JSON.stringify(nome)}) {
          nameWithOwner url homepageUrl stargazerCount forkCount isArchived pushedAt
          owner { avatarUrl }
          primaryLanguage { name color }
        }`;
      })
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
      data?: Record<string, GraphQLRepo | null>;
    };

    lote.forEach((repo, j) => {
      const r = data?.[`r${j}`];
      if (!r) return;
      resultado.set(repo.toLowerCase(), {
        nome: r.nameWithOwner,
        url: r.url,
        avatar: r.owner.avatarUrl,
        estrelas: r.stargazerCount,
        forks: r.forkCount,
        linguagem: r.primaryLanguage?.name ?? null,
        corLinguagem: r.primaryLanguage?.color ?? null,
        ultimaAtividade: r.pushedAt,
        arquivado: r.isArchived,
        site: r.homepageUrl || null,
      });
    });
  }

  return resultado;
}

type GraphQLRepo = {
  nameWithOwner: string;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  forkCount: number;
  isArchived: boolean;
  pushedAt: string | null;
  owner: { avatarUrl: string };
  primaryLanguage: { name: string; color: string | null } | null;
};

/** Cores das linguagens mais comuns, iguais às do GitHub (a API REST não as devolve). */
const CORES_LINGUAGENS: Record<string, string> = {
  C: "#555555",
  "C#": "#178600",
  "C++": "#f34b7d",
  CSS: "#663399",
  Dart: "#00B4AB",
  Elixir: "#6e4a7e",
  Go: "#00ADD8",
  HTML: "#e34c26",
  Java: "#b07219",
  JavaScript: "#f1e05a",
  "Jupyter Notebook": "#DA5B0B",
  Kotlin: "#A97BFF",
  PHP: "#4F5D95",
  Python: "#3572A5",
  Ruby: "#701516",
  Rust: "#dea584",
  Shell: "#89e051",
  Swift: "#F05138",
  TypeScript: "#3178c6",
  Vue: "#41b883",
};

/** Sem token, usa a API REST (limitada a 60 pedidos por hora). */
async function obterViaREST(
  repositorios: string[]
): Promise<Map<string, DadosGitHub>> {
  const resultado = new Map<string, DadosGitHub>();

  await Promise.all(
    repositorios.map(async (repo) => {
      try {
        const resposta = await fetch(`https://api.github.com/repos/${repo}`, {
          headers: cabecalhos(),
          next: { revalidate: INTERVALO_ATUALIZACAO },
        });
        if (!resposta.ok) return;
        const r = await resposta.json();
        resultado.set(repo.toLowerCase(), {
          nome: r.full_name,
          url: r.html_url,
          avatar: r.owner?.avatar_url,
          estrelas: r.stargazers_count,
          forks: r.forks_count,
          linguagem: r.language ?? null,
          corLinguagem: CORES_LINGUAGENS[r.language] ?? null,
          ultimaAtividade: r.pushed_at ?? null,
          arquivado: Boolean(r.archived),
          site: r.homepage || null,
        });
      } catch {
        // Sem dados do GitHub para este repositório: o projeto aparece na mesma.
      }
    })
  );

  return resultado;
}

async function obterDadosGitHub(
  repositorios: string[]
): Promise<Map<string, DadosGitHub>> {
  try {
    if (process.env.GITHUB_TOKEN) {
      try {
        return await obterViaGraphQL(repositorios);
      } catch (e) {
        console.warn("[projetos] GraphQL falhou, a tentar a API REST:", e);
      }
    }
    return await obterViaREST(repositorios);
  } catch (e) {
    console.warn("[projetos] Não foi possível obter dados do GitHub:", e);
    return new Map();
  }
}

export async function obterDiretorio(): Promise<Diretorio> {
  const { categorias, projetos } = await lerFicheiro();
  const dadosGitHub = await obterDadosGitHub(
    projetos.map((p) => p.repositorio)
  );

  const lista: Projeto[] = projetos.map((p) => {
    const gh = dadosGitHub.get(p.repositorio.toLowerCase());
    const [dono, nome] = (gh?.nome ?? p.repositorio).split("/");

    return {
      repositorio: gh?.nome ?? p.repositorio,
      dono,
      nome,
      descricao: p.descricao,
      categoria: p.categoria,
      url: gh?.url ?? `https://github.com/${p.repositorio}`,
      avatar: gh?.avatar ?? `https://github.com/${dono}.png?size=80`,
      site: p.site ?? gh?.site ?? null,
      estrelas: gh?.estrelas ?? null,
      forks: gh?.forks ?? null,
      linguagem: gh?.linguagem ?? null,
      corLinguagem: gh?.corLinguagem ?? null,
      ultimaAtividade: gh?.ultimaAtividade ?? null,
      arquivado: gh?.arquivado ?? false,
    };
  });

  lista.sort(
    (a, b) =>
      (b.estrelas ?? -1) - (a.estrelas ?? -1) ||
      a.repositorio.localeCompare(b.repositorio, "pt-PT")
  );

  return {
    categorias,
    projetos: lista,
    atualizadoEm: new Date().toISOString(),
    dadosGitHubDisponiveis: dadosGitHub.size > 0,
  };
}
