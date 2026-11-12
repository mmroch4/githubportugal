import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import {
  cabecalhos,
  INTERVALO_ATUALIZACAO,
  obterDiretorio,
  type Projeto,
} from "@/lib/projetos";

const FICHEIRO_MANTENEDORES = path.join(
  process.cwd(),
  "data",
  "mantenedores.yml"
);

type EntradaMantenedor = {
  github: string;
  projetos?: string[];
  bio?: string;
};

type PerfilGitHub = {
  login: string;
  nome: string | null;
  avatar: string;
  url: string;
  bio: string | null;
  localizacao: string | null;
  empresa: string | null;
  site: string | null;
  seguidores: number;
};

export type Mantenedor = {
  login: string;
  nome: string;
  avatar: string;
  url: string;
  bio: string | null;
  localizacao: string | null;
  empresa: string | null;
  site: string | null;
  seguidores: number | null;
  projetos: Projeto[];
  estrelas: number;
};

export type ResumoMantenedor = { login: string; avatar: string };

async function lerFicheiro(): Promise<EntradaMantenedor[]> {
  const conteudo = await readFile(FICHEIRO_MANTENEDORES, "utf8");
  const dados = parse(conteudo) as { mantenedores?: EntradaMantenedor[] };
  return dados?.mantenedores ?? [];
}

function avatarPorOmissao(login: string) {
  return `https://github.com/${login}.png?size=160`;
}

/** Normaliza o link do site (o GitHub aceita links sem https://). */
function normalizarSite(site: string | null | undefined) {
  if (!site) return null;
  const comProtocolo = /^https?:\/\//i.test(site) ? site : `https://${site}`;
  try {
    return new URL(comProtocolo).toString();
  } catch {
    return null;
  }
}

/** Com GITHUB_TOKEN, pede todos os perfis à API GraphQL em poucos pedidos. */
async function obterViaGraphQL(
  logins: string[]
): Promise<Map<string, PerfilGitHub>> {
  const resultado = new Map<string, PerfilGitHub>();
  const TAMANHO_LOTE = 50;

  for (let i = 0; i < logins.length; i += TAMANHO_LOTE) {
    const lote = logins.slice(i, i + TAMANHO_LOTE);
    const campos = lote
      .map(
        (login, j) => `u${j}: user(login: ${JSON.stringify(login)}) {
          login name avatarUrl(size: 160) url bio location company websiteUrl
          followers { totalCount }
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
      data?: Record<string, GraphQLUtilizador | null>;
    };

    lote.forEach((login, j) => {
      const u = data?.[`u${j}`];
      if (!u) return;
      resultado.set(login.toLowerCase(), {
        login: u.login,
        nome: u.name || null,
        avatar: u.avatarUrl,
        url: u.url,
        bio: u.bio || null,
        localizacao: u.location || null,
        empresa: u.company || null,
        site: normalizarSite(u.websiteUrl),
        seguidores: u.followers.totalCount,
      });
    });
  }

  return resultado;
}

type GraphQLUtilizador = {
  login: string;
  name: string | null;
  avatarUrl: string;
  url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  websiteUrl: string | null;
  followers: { totalCount: number };
};

/** Sem token, usa a API REST (limitada a 60 pedidos por hora). */
async function obterViaREST(
  logins: string[]
): Promise<Map<string, PerfilGitHub>> {
  const resultado = new Map<string, PerfilGitHub>();

  await Promise.all(
    logins.map(async (login) => {
      try {
        const resposta = await fetch(`https://api.github.com/users/${login}`, {
          headers: cabecalhos(),
          next: { revalidate: INTERVALO_ATUALIZACAO },
        });
        if (!resposta.ok) return;
        const u = await resposta.json();
        resultado.set(login.toLowerCase(), {
          login: u.login,
          nome: u.name || null,
          avatar: u.avatar_url,
          url: u.html_url,
          bio: u.bio || null,
          localizacao: u.location || null,
          empresa: u.company || null,
          site: normalizarSite(u.blog),
          seguidores: u.followers,
        });
      } catch {
        // Sem dados do GitHub para esta pessoa: aparece na mesma.
      }
    })
  );

  return resultado;
}

async function obterPerfis(
  logins: string[]
): Promise<Map<string, PerfilGitHub>> {
  try {
    if (process.env.GITHUB_TOKEN) {
      try {
        return await obterViaGraphQL(logins);
      } catch (e) {
        console.warn("[mantenedores] GraphQL falhou, a tentar a API REST:", e);
      }
    }
    return await obterViaREST(logins);
  } catch (e) {
    console.warn("[mantenedores] Não foi possível obter perfis do GitHub:", e);
    return new Map();
  }
}

/** Repositórios (em minúsculas) de cada mantenedor: os da conta pessoal e os indicados no ficheiro. */
function projetosDe(entrada: EntradaMantenedor, projetos: Projeto[]) {
  const login = entrada.github.toLowerCase();
  const explicitos = new Set(
    (entrada.projetos ?? []).map((r) => r.toLowerCase())
  );
  return projetos.filter(
    (p) =>
      p.dono.toLowerCase() === login ||
      explicitos.has(p.repositorio.toLowerCase())
  );
}

/**
 * Mantenedores de cada projeto do diretório, só a partir dos ficheiros YAML
 * (sem pedidos à API), para mostrar os avatares nos cartões de projeto.
 */
export async function obterMantenedoresPorProjeto(
  projetos: Projeto[]
): Promise<Record<string, ResumoMantenedor[]>> {
  const entradas = await lerFicheiro();
  const mapa: Record<string, ResumoMantenedor[]> = {};

  for (const entrada of entradas) {
    for (const p of projetosDe(entrada, projetos)) {
      const chave = p.repositorio.toLowerCase();
      (mapa[chave] ??= []).push({
        login: entrada.github,
        avatar: `https://github.com/${entrada.github}.png?size=48`,
      });
    }
  }

  return mapa;
}

export type ListaMantenedores = {
  mantenedores: Mantenedor[];
  atualizadoEm: string;
  dadosGitHubDisponiveis: boolean;
};

export async function obterMantenedores(): Promise<ListaMantenedores> {
  const [entradas, diretorio] = await Promise.all([
    lerFicheiro(),
    obterDiretorio(),
  ]);
  const perfis = await obterPerfis(entradas.map((e) => e.github));

  const mantenedores: Mantenedor[] = entradas.map((entrada) => {
    const gh = perfis.get(entrada.github.toLowerCase());
    const login = gh?.login ?? entrada.github;
    const projetos = projetosDe(entrada, diretorio.projetos);

    return {
      login,
      nome: gh?.nome ?? login,
      avatar: gh?.avatar ?? avatarPorOmissao(login),
      url: gh?.url ?? `https://github.com/${login}`,
      bio: entrada.bio ?? gh?.bio ?? null,
      localizacao: gh?.localizacao ?? null,
      empresa: gh?.empresa ?? null,
      site: gh?.site ?? null,
      seguidores: gh?.seguidores ?? null,
      projetos,
      estrelas: projetos.reduce((total, p) => total + (p.estrelas ?? 0), 0),
    };
  });

  mantenedores.sort(
    (a, b) => b.estrelas - a.estrelas || a.nome.localeCompare(b.nome, "pt-PT")
  );

  return {
    mantenedores,
    atualizadoEm: diretorio.atualizadoEm,
    dadosGitHubDisponiveis: perfis.size > 0,
  };
}

export async function obterMantenedor(
  login: string
): Promise<(Mantenedor & { atualizadoEm: string }) | null> {
  const { mantenedores, atualizadoEm } = await obterMantenedores();
  const m = mantenedores.find(
    (m) => m.login.toLowerCase() === login.toLowerCase()
  );
  return m ? { ...m, atualizadoEm } : null;
}

/** Logins tal como estão no ficheiro, para gerar as páginas de perfil. */
export async function listarLogins(): Promise<string[]> {
  return (await lerFicheiro()).map((e) => e.github);
}
