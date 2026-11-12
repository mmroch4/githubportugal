import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { capitulos } from "@/content/guia/capitulos";
import { lerArtigos } from "@/lib/artigos";
import { obterComunidades } from "@/lib/comunidades";
import { hojeEmPortugal, lerEventos } from "@/lib/eventos";
import { caminhoMantenedor } from "@/lib/formatar";

export type TipoResultado =
  | "Página"
  | "Projeto"
  | "Mantenedor"
  | "Evento"
  | "Comunidade"
  | "Empresa"
  | "Guia"
  | "Artigo";

export type EntradaPesquisa = {
  tipo: TipoResultado;
  titulo: string;
  descricao: string;
  /** Caminho no site (começa por /) ou link externo. */
  url: string;
  /** Texto extra só para a pesquisa (cidade, categoria, etiquetas...). */
  termos?: string;
};

/** Secções do site, para quem pesquisa pelo nome de uma página. */
const PAGINAS: EntradaPesquisa[] = [
  {
    tipo: "Página",
    titulo: "Projetos",
    descricao: "Diretório de projetos open source portugueses.",
    url: "/projetos",
    termos: "diretorio repositorios open source",
  },
  {
    tipo: "Página",
    titulo: "Selo “Feito em Portugal”",
    descricao: "Selo para o README dos projetos open source portugueses.",
    url: "/selo",
    termos: "badge readme feito em portugal shields",
  },
  {
    tipo: "Página",
    titulo: "Primeira contribuição",
    descricao: "Issues para começar a contribuir em projetos portugueses.",
    url: "/primeiras-contribuicoes",
    termos: "good first issue help wanted issues contribuir",
  },
  {
    tipo: "Página",
    titulo: "Mantenedores",
    descricao: "Quem mantém os projetos open source portugueses.",
    url: "/mantenedores",
    termos: "pessoas maintainers",
  },
  {
    tipo: "Página",
    titulo: "Ranking",
    descricao: "Programadores portugueses mais ativos no GitHub.",
    url: "/ranking",
    termos: "contribuicoes seguidores lisboa porto braga coimbra",
  },
  {
    tipo: "Página",
    titulo: "Eventos",
    descricao: "Agenda de conferências, meetups e workshops tech em Portugal.",
    url: "/eventos",
    termos: "agenda calendario conferencias meetups",
  },
  {
    tipo: "Página",
    titulo: "Comunidades",
    descricao: "Comunidades tech em Portugal.",
    url: "/comunidades",
    termos: "meetups grupos",
  },
  {
    tipo: "Página",
    titulo: "Empresas",
    descricao: "Empresas tech em Portugal que publicam código aberto.",
    url: "/empresas",
    termos: "emprego trabalho carreiras",
  },
  {
    tipo: "Página",
    titulo: "Guia de código aberto",
    descricao: "Como começar no open source, em português de Portugal.",
    url: "/guia",
    termos: "aprender open source",
  },
  {
    tipo: "Página",
    titulo: "Artigos",
    descricao: "Artigos da comunidade e do dev.to.",
    url: "/artigos",
    termos: "blog rss dev.to",
  },
  {
    tipo: "Página",
    titulo: "Sobre",
    descricao: "O que é o GitHub Portugal e como participar.",
    url: "/sobre",
    termos: "discord whatsapp comunidade",
  },
];

async function lerYaml<T>(ficheiro: string): Promise<T> {
  const conteudo = await readFile(
    path.join(process.cwd(), "data", ficheiro),
    "utf8"
  );
  return parse(conteudo) as T;
}

/**
 * Índice da pesquisa global, só com os dados dos ficheiros do repositório
 * (sem pedidos à API do GitHub), para ser leve e rápido de gerar.
 */
export async function construirIndice(): Promise<EntradaPesquisa[]> {
  const [
    projetos,
    mantenedores,
    empresas,
    { comunidades },
    { eventos },
    artigos,
  ] = await Promise.all([
    lerYaml<{
      projetos?: {
        repositorio: string;
        descricao: string;
        categoria: string;
      }[];
    }>("projetos.yml"),
    lerYaml<{
      mantenedores?: { github: string; bio?: string; projetos?: string[] }[];
    }>("mantenedores.yml"),
    lerYaml<{
      empresas?: {
        nome: string;
        github: string;
        descricao: string;
        setor: string;
        cidades?: string[];
      }[];
    }>("empresas.yml"),
    obterComunidades(),
    lerEventos(),
    lerArtigos(),
  ]);

  const hoje = hojeEmPortugal();

  return [
    ...PAGINAS,
    ...(projetos.projetos ?? []).map((p) => ({
      tipo: "Projeto" as const,
      titulo: p.repositorio,
      descricao: p.descricao,
      url: `/projetos?q=${encodeURIComponent(p.repositorio)}`,
      termos: p.categoria,
    })),
    ...(mantenedores.mantenedores ?? []).map((m) => ({
      tipo: "Mantenedor" as const,
      titulo: `@${m.github}`,
      descricao: m.bio ?? "Mantenedor de projetos open source portugueses.",
      url: caminhoMantenedor(m.github),
      termos: (m.projetos ?? []).join(" "),
    })),
    ...eventos
      .filter((e) => e.fim >= hoje)
      .map((e) => ({
        tipo: "Evento" as const,
        titulo: e.nome,
        descricao: e.descricao,
        url: e.site,
        termos: `${e.tipo} ${e.cidade} ${e.formato}`,
      })),
    ...comunidades.map((c) => ({
      tipo: "Comunidade" as const,
      titulo: c.nome,
      descricao: c.descricao,
      url: c.site,
      termos: `${c.categoria} ${c.cidade ?? ""}`,
    })),
    ...(empresas.empresas ?? []).map((e) => ({
      tipo: "Empresa" as const,
      titulo: e.nome,
      descricao: e.descricao,
      url: `/empresas?q=${encodeURIComponent(e.nome)}`,
      termos: `${e.github} ${e.setor} ${(e.cidades ?? []).join(" ")}`,
    })),
    ...capitulos.map((c) => ({
      tipo: "Guia" as const,
      titulo: c.titulo,
      descricao: c.descricao,
      url: `/guia/${c.slug}`,
    })),
    ...artigos.map((a) => ({
      tipo: "Artigo" as const,
      titulo: a.titulo,
      descricao: a.descricao,
      url: `/artigos/${a.slug}`,
      termos: a.etiquetas.join(" "),
    })),
  ];
}
