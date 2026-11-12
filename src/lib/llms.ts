import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { links, siteUrl } from "@/config/metadata";
import { perguntasFrequentes } from "@/content/perguntas-frequentes";
import { capitulos } from "@/content/guia/capitulos";
import { lerArtigos, PASTA_ARTIGOS } from "@/lib/artigos";
import { obterComunidades } from "@/lib/comunidades";
import { formatarDatas, hojeEmPortugal, lerEventos } from "@/lib/eventos";
import { caminhoMantenedor } from "@/lib/formatar";
import { listarLogins } from "@/lib/mantenedores";
import { obterDiretorio } from "@/lib/projetos";

/*
 * Ficheiros /llms.txt e /llms-full.txt (https://llmstxt.org/): um resumo do
 * site em Markdown para assistentes de IA, com os links mais importantes e,
 * na versão completa, o texto do guia e dos artigos.
 */

const PASTA_GUIA = path.join(process.cwd(), "src", "content", "guia");

const url = (caminho: string) => `${siteUrl}${caminho}`;

/** Uma linha de lista no formato do llms.txt: `- [nome](url): descrição`. */
const item = (nome: string, link: string, descricao?: string) =>
  `- [${nome}](${link})${descricao ? `: ${descricao}` : ""}`;

const PAGINAS = [
  {
    nome: "Projetos open source portugueses",
    caminho: "/projetos",
    descricao:
      "Diretório de projetos open source criados ou mantidos por programadores e empresas portuguesas, com estrelas, linguagem e atividade do GitHub.",
  },
  {
    nome: "Primeiras contribuições",
    caminho: "/primeiras-contribuicoes",
    descricao:
      "Issues “good first issue” e “help wanted” dos projetos portugueses, para quem quer começar a contribuir para open source.",
  },
  {
    nome: "Mantenedores",
    caminho: "/mantenedores",
    descricao:
      "Programadores portugueses que criam e mantêm projetos open source, cada um com perfil próprio.",
  },
  {
    nome: "Ranking de programadores em Portugal",
    caminho: "/ranking",
    descricao:
      "Os programadores mais ativos no GitHub em Portugal, Lisboa, Porto, Braga e Coimbra, por contribuições públicas nos últimos 12 meses e por seguidores. Atualizado todas as semanas.",
  },
  {
    nome: "Eventos tech em Portugal",
    caminho: "/eventos",
    descricao:
      "Agenda de conferências, meetups, workshops e hackathons, com calendário .ics.",
  },
  {
    nome: "Comunidades tech em Portugal",
    caminho: "/comunidades",
    descricao:
      "Meetups, grupos e comunidades de programação por cidade e tema.",
  },
  {
    nome: "Empresas tech com código aberto",
    caminho: "/empresas",
    descricao:
      "Empresas de tecnologia em Portugal que publicam código aberto no GitHub e onde trabalhar.",
  },
  {
    nome: "Guia de código aberto",
    caminho: "/guia",
    descricao:
      "Guia em português de Portugal sobre open source: primeira contribuição, licenças, iniciar um projeto, comunidade e manutenção.",
  },
  {
    nome: "Artigos",
    caminho: "/artigos",
    descricao:
      "Artigos da comunidade e publicações de programadores portugueses no dev.to (feed RSS em /artigos/feed.xml).",
  },
  {
    nome: "Sobre",
    caminho: "/sobre",
    descricao:
      "O que é o GitHub Portugal, como participar e perguntas frequentes.",
  },
];

const CABECALHO = `# GitHub Portugal

> Comunidade portuguesa de programadores e de projetos open source no GitHub. O site junta um diretório de projetos open source portugueses, os seus mantenedores, issues para a primeira contribuição, um ranking dos programadores mais ativos no GitHub em Portugal, uma agenda de eventos tech, comunidades, empresas com código aberto, um guia de código aberto em português de Portugal e artigos da comunidade.

O GitHub Portugal é uma comunidade independente e sem fins lucrativos: não é oficial do GitHub. Todo o conteúdo está em português de Portugal. Os dados vêm de ficheiros YAML no repositório ${links.repository} e qualquer pessoa os pode atualizar com um pull request (instruções em ${links.repository}/blob/main/CONTRIBUTING.md).`;

async function lerYaml<T>(ficheiro: string): Promise<T> {
  const conteudo = await readFile(
    path.join(process.cwd(), "data", ficheiro),
    "utf8"
  );
  return parse(conteudo) as T;
}

/** Texto Markdown de um ficheiro MDX, sem cabeçalho e com links absolutos. */
async function lerMarkdown(ficheiro: string) {
  const conteudo = await readFile(ficheiro, "utf8");
  return (
    conteudo
      .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")
      .replace(/^(import|export) .*$/gm, "")
      .replace(/\]\(\/(?!\/)/g, `](${siteUrl}/`)
      // Os títulos do ficheiro ficam abaixo do título da secção (###).
      .replace(/^(#{1,4}) /gm, "##$1 ")
      .trim()
  );
}

export async function gerarLlmsTxt() {
  const [
    { projetos },
    logins,
    { comunidades },
    { eventos },
    artigos,
    empresas,
  ] = await Promise.all([
    obterDiretorio(),
    listarLogins(),
    obterComunidades(),
    lerEventos(),
    lerArtigos(),
    lerYaml<{
      empresas?: { nome: string; github: string; descricao: string }[];
    }>("empresas.yml"),
  ]);
  const hoje = hojeEmPortugal();
  const proximos = eventos.filter((e) => e.fim >= hoje);

  const seccoes = [
    CABECALHO,
    "## Páginas principais",
    PAGINAS.map((p) => item(p.nome, url(p.caminho), p.descricao)).join("\n"),
    "## Guia de código aberto",
    capitulos
      .map((c) => item(c.titulo, url(`/guia/${c.slug}`), c.descricao))
      .join("\n"),
    "## Artigos da comunidade",
    artigos
      .map((a) => item(a.titulo, url(`/artigos/${a.slug}`), a.descricao))
      .join("\n"),
    "## Projetos open source portugueses",
    projetos
      .map((p) => {
        const detalhes = [
          p.descricao,
          p.linguagem,
          p.estrelas !== null ? `${p.estrelas} estrelas` : null,
          p.arquivado ? "arquivado" : null,
        ].filter(Boolean);
        return item(p.repositorio, p.url, detalhes.join(" · "));
      })
      .join("\n"),
    "## Mantenedores",
    logins
      .map((login) => item(`@${login}`, url(caminhoMantenedor(login))))
      .join("\n"),
    ...(proximos.length
      ? [
          "## Próximos eventos",
          proximos
            .map((e) =>
              item(
                e.nome,
                e.site,
                `${formatarDatas(e.inicio, e.fim)}, ${e.cidade} (${e.formato}${
                  e.gratuito ? ", gratuito" : ""
                }). ${e.descricao}`
              )
            )
            .join("\n"),
        ]
      : []),
    "## Comunidades",
    comunidades
      .map((c) =>
        item(
          c.nome,
          c.site,
          `${c.descricao}${c.cidade ? ` (${c.cidade})` : ""}`
        )
      )
      .join("\n"),
    "## Empresas com código aberto",
    (empresas.empresas ?? [])
      .map((e) => item(e.nome, `https://github.com/${e.github}`, e.descricao))
      .join("\n"),
    "## Optional",
    [
      item(
        "Texto completo do guia e dos artigos",
        url("/llms-full.txt"),
        "Versão longa deste ficheiro, com o conteúdo integral em Markdown."
      ),
      item("Feed RSS dos artigos", url("/artigos/feed.xml")),
      item("Calendário de eventos (.ics)", url("/eventos/calendario.ics")),
      item("Repositório do site", links.repository),
      item("Comunidade no Discord", links.discord),
    ].join("\n"),
  ];

  return `${seccoes.join("\n\n")}\n`;
}

export async function gerarLlmsFullTxt() {
  const artigos = await lerArtigos();
  const [guia, textosArtigos] = await Promise.all([
    Promise.all(
      capitulos.map((c) => lerMarkdown(path.join(PASTA_GUIA, `${c.slug}.mdx`)))
    ),
    Promise.all(
      artigos.map((a) => lerMarkdown(path.join(PASTA_ARTIGOS, `${a.slug}.mdx`)))
    ),
  ]);

  const seccoes = [
    CABECALHO,
    "## Páginas principais",
    PAGINAS.map((p) => item(p.nome, url(p.caminho), p.descricao)).join("\n"),
    "## Perguntas frequentes",
    perguntasFrequentes
      .map((p) => `### ${p.pergunta}\n\n${p.resposta}`)
      .join("\n\n"),
    "## Guia de código aberto",
    capitulos
      .map(
        (c, i) =>
          `### ${c.titulo}\n\nFonte: ${url(`/guia/${c.slug}`)}\n\n${guia[i]}`
      )
      .join("\n\n"),
    "## Artigos da comunidade",
    artigos
      .map(
        (a, i) =>
          `### ${a.titulo}\n\nFonte: ${url(`/artigos/${a.slug}`)} · ${
            a.autor ? `por @${a.autor}` : "pela equipa GitHub Portugal"
          } · ${a.data}\n\n${textosArtigos[i]}`
      )
      .join("\n\n"),
  ];

  return `${seccoes.join("\n\n")}\n`;
}
