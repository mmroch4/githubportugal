import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { cabecalhos, INTERVALO_ATUALIZACAO } from "@/lib/projetos";

const FICHEIRO_EMPRESAS = path.join(process.cwd(), "data", "empresas.yml");
const FICHEIRO_PROJETOS = path.join(process.cwd(), "data", "projetos.yml");

type EntradaEmpresa = {
  nome: string;
  github: string;
  descricao: string;
  setor: string;
  cidades: string[];
  site?: string;
  carreiras?: string;
};

export type RepositorioDestaque = {
  nome: string;
  url: string;
  descricao: string | null;
  estrelas: number;
  linguagem: string | null;
  corLinguagem: string | null;
};

type DadosOrganizacao = {
  login: string;
  avatar: string;
  site: string | null;
  repositoriosPublicos: number;
  destaques: RepositorioDestaque[];
};

export type Empresa = {
  nome: string;
  github: string;
  descricao: string;
  setor: string;
  cidades: string[];
  site: string | null;
  carreiras: string | null;
  avatar: string;
  /** null quando não foi possível obter os dados do GitHub. */
  repositoriosPublicos: number | null;
  destaques: RepositorioDestaque[];
  /** Repositórios da empresa que estão no diretório de projetos. */
  projetosNoDiretorio: { repositorio: string; nome: string }[];
};

type GraphQLOrganizacao = {
  login: string;
  avatarUrl: string;
  websiteUrl: string | null;
  repositories: { totalCount: number };
  destaques: {
    nodes: {
      name: string;
      url: string;
      description: string | null;
      stargazerCount: number;
      primaryLanguage: { name: string; color: string | null } | null;
    }[];
  };
};

async function obterViaGraphQL(
  logins: string[]
): Promise<Map<string, DadosOrganizacao>> {
  const campos = logins
    .map(
      (login, i) => `o${i}: organization(login: ${JSON.stringify(login)}) {
        login avatarUrl websiteUrl
        repositories(privacy: PUBLIC, isFork: false) { totalCount }
        destaques: repositories(
          first: 3, privacy: PUBLIC, isFork: false, isArchived: false,
          orderBy: { field: STARGAZERS, direction: DESC }
        ) {
          nodes { name url description stargazerCount primaryLanguage { name color } }
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

  // Uma organização que não existe devolve null e um erro, mas as restantes vêm na mesma.
  const { data } = (await resposta.json()) as {
    data?: Record<string, GraphQLOrganizacao | null>;
  };

  const resultado = new Map<string, DadosOrganizacao>();
  logins.forEach((login, i) => {
    const o = data?.[`o${i}`];
    if (!o) return;
    resultado.set(login.toLowerCase(), {
      login: o.login,
      avatar: o.avatarUrl,
      site: o.websiteUrl || null,
      repositoriosPublicos: o.repositories.totalCount,
      destaques: o.destaques.nodes
        .filter((r) => r.stargazerCount > 0)
        .map((r) => ({
          nome: r.name,
          url: r.url,
          descricao: r.description,
          estrelas: r.stargazerCount,
          linguagem: r.primaryLanguage?.name ?? null,
          corLinguagem: r.primaryLanguage?.color ?? null,
        })),
    });
  });
  return resultado;
}

/** Sem token, usa a API REST: um pedido por organização e sem repositórios em destaque. */
async function obterViaREST(
  logins: string[]
): Promise<Map<string, DadosOrganizacao>> {
  const resultado = new Map<string, DadosOrganizacao>();
  await Promise.all(
    logins.map(async (login) => {
      try {
        const resposta = await fetch(`https://api.github.com/orgs/${login}`, {
          headers: cabecalhos(),
          next: { revalidate: INTERVALO_ATUALIZACAO },
        });
        if (!resposta.ok) return;
        const o = await resposta.json();
        resultado.set(login.toLowerCase(), {
          login: o.login,
          avatar: o.avatar_url,
          site: o.blog || null,
          repositoriosPublicos: o.public_repos,
          destaques: [],
        });
      } catch {
        // Sem dados do GitHub para esta empresa: aparece na mesma.
      }
    })
  );
  return resultado;
}

async function obterOrganizacoes(
  logins: string[]
): Promise<Map<string, DadosOrganizacao>> {
  try {
    if (process.env.GITHUB_TOKEN) {
      try {
        return await obterViaGraphQL(logins);
      } catch (e) {
        console.warn("[empresas] GraphQL falhou, a tentar a API REST:", e);
      }
    }
    return await obterViaREST(logins);
  } catch (e) {
    console.warn("[empresas] Não foi possível obter dados do GitHub:", e);
    return new Map();
  }
}

/** Site com https://, para os casos em que a organização no GitHub o tem sem protocolo. */
function normalizarSite(site: string | null): string | null {
  if (!site) return null;
  return /^https?:\/\//.test(site) ? site : `https://${site}`;
}

async function lerRepositoriosDoDiretorio(): Promise<string[]> {
  const conteudo = await readFile(FICHEIRO_PROJETOS, "utf8");
  const dados = parse(conteudo) as { projetos?: { repositorio: string }[] };
  return (dados?.projetos ?? []).map((p) => p.repositorio);
}

export async function obterEmpresas(): Promise<{
  empresas: Empresa[];
  setores: string[];
  dadosGitHubDisponiveis: boolean;
}> {
  const conteudo = await readFile(FICHEIRO_EMPRESAS, "utf8");
  const dados = parse(conteudo) as {
    setores?: string[];
    empresas?: EntradaEmpresa[];
  };
  const entradas = dados?.empresas ?? [];

  const [organizacoes, repositorios] = await Promise.all([
    obterOrganizacoes(entradas.map((e) => e.github)),
    lerRepositoriosDoDiretorio(),
  ]);

  const empresas: Empresa[] = entradas.map((e) => {
    const gh = organizacoes.get(e.github.toLowerCase());
    const login = gh?.login ?? e.github;
    return {
      nome: e.nome,
      github: login,
      descricao: e.descricao,
      setor: e.setor,
      cidades: e.cidades ?? [],
      site: e.site ?? normalizarSite(gh?.site ?? null),
      carreiras: e.carreiras ?? null,
      avatar: gh?.avatar ?? `https://github.com/${login}.png?size=80`,
      repositoriosPublicos: gh?.repositoriosPublicos ?? null,
      destaques: gh?.destaques ?? [],
      projetosNoDiretorio: repositorios
        .filter((r) => r.split("/")[0].toLowerCase() === e.github.toLowerCase())
        .map((r) => ({ repositorio: r, nome: r.split("/")[1] })),
    };
  });

  empresas.sort((a, b) => a.nome.localeCompare(b.nome, "pt-PT"));

  return {
    empresas,
    setores: dados?.setores ?? [],
    dadosGitHubDisponiveis: organizacoes.size > 0,
  };
}
