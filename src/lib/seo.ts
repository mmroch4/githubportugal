import type { Metadata } from "next";
import { links, siteUrl } from "@/config/metadata";

export const NOME_SITE = "GitHub Portugal";
export const ID_ORGANIZACAO = `${siteUrl}/#organizacao`;
export const ID_WEBSITE = `${siteUrl}/#website`;

/** URL absoluto a partir de um caminho do site. */
export function urlAbsoluto(caminho: string) {
  if (/^https?:\/\//.test(caminho)) return caminho;
  return `${siteUrl}${caminho === "/" ? "/" : caminho}`;
}

/** Imagem de partilha por omissão (src/app/opengraph-image.tsx). */
const IMAGEM_SOCIAL = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "GitHub Portugal: comunidade portuguesa de programadores",
};

type OpcoesMetadados = {
  /** Título curto, usado no separador do browser ("<titulo> | GitHub Portugal"). */
  titulo: string;
  descricao: string;
  /** Caminho canónico da página, a começar por /. */
  caminho: string;
  /** Título mais descritivo para as redes sociais (Open Graph e X). */
  tituloSocial?: string;
  tipo?: "website" | "article" | "profile";
  imagens?: string[];
  /** Campos extra do Open Graph (por exemplo, datas de um artigo). */
  openGraph?: Record<string, unknown>;
  alternates?: Metadata["alternates"];
  extra?: Omit<Metadata, "title" | "description" | "openGraph" | "twitter">;
};

/**
 * Metadados completos de uma página. O Next.js substitui (não junta) os campos
 * `openGraph` e `twitter` do layout quando uma página os define, por isso
 * repetimos aqui o nome do site, o idioma e o URL canónico em todas as páginas.
 */
export function metadadosPagina({
  titulo,
  descricao,
  caminho,
  tituloSocial,
  tipo = "website",
  imagens,
  openGraph,
  alternates,
  extra,
}: OpcoesMetadados): Metadata {
  const social = tituloSocial ?? titulo;
  // Quando uma página define `openGraph`, deixa de herdar a imagem gerada em
  // src/app/opengraph-image.tsx, por isso indicamo-la aqui explicitamente.
  const imagensSociais = imagens ?? [IMAGEM_SOCIAL];
  return {
    ...extra,
    title: titulo,
    description: descricao,
    alternates: { canonical: caminho, ...alternates },
    openGraph: {
      type: tipo,
      locale: "pt_PT",
      siteName: NOME_SITE,
      url: caminho,
      title: social,
      description: descricao,
      images: imagensSociais,
      ...openGraph,
    } as Metadata["openGraph"],
    twitter: {
      card: imagens ? "summary" : "summary_large_image",
      title: social,
      description: descricao,
      images: imagensSociais,
    },
  };
}

type Migalha = { nome: string; caminho: string };

/** BreadcrumbList do schema.org, a começar sempre na página principal. */
export function migalhas(itens: Migalha[]) {
  const todos = [{ nome: NOME_SITE, caminho: "/" }, ...itens];
  return {
    "@type": "BreadcrumbList",
    itemListElement: todos.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.nome,
      item: urlAbsoluto(item.caminho),
    })),
  };
}

/** Página de coleção (diretório, agenda...) com a lista dos itens que mostra. */
export function paginaColecao({
  nome,
  descricao,
  caminho,
  itens,
  tipo = "CollectionPage",
}: {
  nome: string;
  descricao: string;
  caminho: string;
  /** Itens listados na página; sem itens, a página não declara a lista. */
  itens?: Record<string, unknown>[];
  tipo?: string;
}) {
  const url = urlAbsoluto(caminho);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": tipo,
        "@id": `${url}#pagina`,
        url,
        name: nome,
        description: descricao,
        inLanguage: "pt-PT",
        isPartOf: { "@id": ID_WEBSITE },
        about: { "@id": ID_ORGANIZACAO },
        breadcrumb: migalhas([{ nome, caminho }]),
        ...(itens
          ? {
              mainEntity: {
                "@type": "ItemList",
                numberOfItems: itens.length,
                itemListElement: itens.map((item, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  item,
                })),
              },
            }
          : {}),
      },
    ],
  };
}

/** Organização e site, incluídos em todas as páginas (no layout). */
export const dadosEstruturadosSite = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ID_ORGANIZACAO,
      name: NOME_SITE,
      url: `${siteUrl}/`,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon-512.png`,
        width: 512,
        height: 512,
      },
      description:
        "Comunidade portuguesa, sem fins lucrativos e não oficial do GitHub, que junta programadores e projetos open source de Portugal.",
      slogan: "de DEV para DEV",
      areaServed: { "@type": "Country", name: "Portugal" },
      knowsLanguage: "pt-PT",
      knowsAbout: [
        "Código aberto",
        "Open source",
        "GitHub",
        "Programação",
        "Desenvolvimento de software",
      ],
      founder: {
        "@type": "Person",
        name: "Miguel Rocha",
        url: "https://github.com/mmroch4",
      },
      sameAs: [links.repository, links.discord],
    },
    {
      "@type": "WebSite",
      "@id": ID_WEBSITE,
      url: `${siteUrl}/`,
      name: NOME_SITE,
      description:
        "Diretório de projetos open source portugueses, mantenedores, primeiras contribuições, ranking, estatísticas, eventos, comunidades, empresas, guia de código aberto e artigos.",
      inLanguage: "pt-PT",
      publisher: { "@id": ID_ORGANIZACAO },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/projetos?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

type DadosEvento = {
  nome: string;
  descricao: string;
  inicio: string;
  fim: string;
  cidade: string;
  formato: "presencial" | "online" | "híbrido";
  gratuito: boolean;
  site: string;
};

const MODO_EVENTO = {
  presencial: "https://schema.org/OfflineEventAttendanceMode",
  online: "https://schema.org/OnlineEventAttendanceMode",
  híbrido: "https://schema.org/MixedEventAttendanceMode",
} as const;

/** Event do schema.org a partir de uma entrada de data/eventos.yml. */
export function dadosEvento(e: DadosEvento) {
  const local = {
    "@type": "Place",
    name: e.cidade,
    address: {
      "@type": "PostalAddress",
      addressLocality: e.cidade,
      addressCountry: "PT",
    },
  };
  const virtual = { "@type": "VirtualLocation", url: e.site };
  const location =
    e.formato === "online"
      ? virtual
      : e.formato === "híbrido"
      ? [local, virtual]
      : local;

  return {
    "@type": "Event",
    name: e.nome,
    description: e.descricao,
    startDate: e.inicio,
    endDate: e.fim,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: MODO_EVENTO[e.formato],
    location,
    isAccessibleForFree: e.gratuito,
    url: e.site,
  };
}
