import {
  IssueOpenedIcon,
  PeopleIcon,
  PlusIcon,
  VerifiedIcon,
} from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { metadadosPagina, paginaColecao } from "@/lib/seo";
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
    <main className="m-auto w-full max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
      <header className="mb-6 flex flex-col gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Projetos
          </h1>
          <p className="max-w-2xl text-base text-light-gray-7 sm:text-lg">
            Projetos open source criados ou mantidos por programadores
            portugueses. Conheces algum que não está aqui? Adiciona-o com um
            pull request.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/primeiras-contribuicoes"
            className="flex items-center justify-center gap-2 rounded-md border border-light-gray-3 px-4 py-2 text-sm font-bold hover:bg-light-gray-1 sm:text-base"
          >
            <IssueOpenedIcon className="fill-light-black" />
            Primeiras contribuições
          </Link>
          <Link
            href="/mantenedores"
            className="flex items-center justify-center gap-2 rounded-md border border-light-gray-3 px-4 py-2 text-sm font-bold hover:bg-light-gray-1 sm:text-base"
          >
            <PeopleIcon className="fill-light-black" />
            Mantenedores
          </Link>
          <Link
            href="/selo"
            className="flex items-center justify-center gap-2 rounded-md border border-light-gray-3 px-4 py-2 text-sm font-bold hover:bg-light-gray-1 sm:text-base"
          >
            <VerifiedIcon className="fill-light-black" />
            Selo para o README
          </Link>
          <a
            href={`${links.repository}/blob/main/CONTRIBUTING.md#adicionar-um-projeto`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-md bg-light-black px-4 py-2 text-sm font-bold text-light-gray-0 hover:opacity-90 sm:text-base"
          >
            <PlusIcon className="fill-current" />
            Adicionar projeto
          </a>
        </div>
      </header>

      <DiretorioProjetos
        projetos={projetos}
        categorias={categorias}
        atualizadoEm={atualizadoEm}
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
