import { PlusIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { metadadosPagina, paginaColecao } from "@/lib/seo";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { links } from "@/config/metadata";
import { obterPrimeirasContribuicoes } from "@/lib/issues";
import { obterMantenedoresPorProjeto } from "@/lib/mantenedores";
import { obterDiretorio } from "@/lib/projetos";
import { DiretorioProjetos } from "./DiretorioProjetos";

// Volta a pedir as estrelas ao GitHub, no máximo, de 6 em 6 horas.
export const revalidate = 21600;

const description =
  "Diretório de projetos open source criados ou mantidos por programadores portugueses, com estrelas e atividade atualizadas a partir do GitHub.";

export const metadata: Metadata = metadadosPagina({
  titulo: "Projetos open source portugueses",
  descricao: description,
  caminho: "/projetos",
});

export default async function Projetos() {
  const { projetos, categorias, atualizadoEm, dadosGitHubDisponiveis } =
    await obterDiretorio();
  const [mantenedoresPorProjeto, { porProjeto: issuesPorProjeto }] =
    await Promise.all([
      obterMantenedoresPorProjeto(projetos),
      obterPrimeirasContribuicoes(projetos, atualizadoEm),
    ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <CabecalhoPagina
        etiqueta={`${projetos.length} projetos`}
        titulo="Projetos"
      >
        <Link href="/selo" className="botao-secundario">
          Selo
        </Link>
        <a
          href={`${links.repository}/blob/main/CONTRIBUTING.md#adicionar-um-projeto`}
          target="_blank"
          rel="noopener noreferrer"
          className="botao-primario"
        >
          <PlusIcon className="fill-current" />
          Adicionar projeto
        </a>
      </CabecalhoPagina>

      <DiretorioProjetos
        projetos={projetos}
        categorias={categorias}
        mantenedoresPorProjeto={mantenedoresPorProjeto}
        issuesPorProjeto={issuesPorProjeto}
      />

      {!dadosGitHubDisponiveis && (
        <p className="mt-6 text-center text-sm text-light-gray-6">
          Não foi possível obter as estrelas do GitHub neste momento. Volta a
          tentar mais tarde.
        </p>
      )}
      <DadosEstruturados
        dados={paginaColecao({
          nome: "Projetos open source portugueses",
          descricao: description,
          caminho: "/projetos",
          itens: projetos.map((p) => ({
            "@type": "SoftwareSourceCode",
            name: p.nome,
            description: p.descricao,
            codeRepository: p.url,
            url: p.site ?? p.url,
            keywords: p.categoria,
            ...(p.linguagem ? { programmingLanguage: p.linguagem } : {}),
            ...(p.ultimaAtividade ? { dateModified: p.ultimaAtividade } : {}),
          })),
        })}
      />
    </main>
  );
}
