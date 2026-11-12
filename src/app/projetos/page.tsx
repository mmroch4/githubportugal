import { ArrowLeftIcon, PeopleIcon, PlusIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { links } from "@/config/metadata";
import { obterMantenedoresPorProjeto } from "@/lib/mantenedores";
import { obterDiretorio } from "@/lib/projetos";
import { DiretorioProjetos } from "./DiretorioProjetos";

// Volta a pedir as estrelas ao GitHub, no máximo, de 6 em 6 horas.
export const revalidate = 21600;

const description =
  "Diretório de projetos open source criados ou mantidos por programadores portugueses, com estrelas e atividade atualizadas a partir do GitHub.";

export const metadata: Metadata = {
  title: "Projetos",
  description,
  alternates: { canonical: "/projetos" },
  openGraph: { title: "Projetos open source portugueses", description },
};

const buttonClassName =
  "flex w-fit items-center justify-center rounded p-2 hover:bg-light-gray-1 focus:bg-light-gray-1 active:bg-light-gray-2 md:p-3";

export default async function Projetos() {
  const { projetos, categorias, atualizadoEm, dadosGitHubDisponiveis } =
    await obterDiretorio();
  const mantenedoresPorProjeto = await obterMantenedoresPorProjeto(projetos);

  return (
    <main className="m-auto w-full max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
      <nav className="mb-2 sm:mb-3 md:mb-4">
        <Link href="/" className={buttonClassName}>
          <ArrowLeftIcon
            verticalAlign="middle"
            className="h-5 w-5 fill-light-black md:h-6 md:w-6"
          />
          <span className="sr-only">Voltar à página principal</span>
        </Link>
      </nav>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-black sm:text-4xl md:text-5xl">
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
            href="/mantenedores"
            className="flex items-center justify-center gap-2 rounded border border-light-gray-3 px-4 py-2 text-sm font-bold sm:text-base"
          >
            <PeopleIcon className="fill-light-black" />
            Mantenedores
          </Link>
          <a
            href={`${links.repository}/blob/main/CONTRIBUTING.md#adicionar-um-projeto`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded bg-light-gray-9 px-4 py-2 text-sm font-bold text-white sm:text-base"
          >
            <PlusIcon className="fill-white" />
            Adicionar projeto
          </a>
        </div>
      </header>

      <DiretorioProjetos
        projetos={projetos}
        categorias={categorias}
        atualizadoEm={atualizadoEm}
        mantenedoresPorProjeto={mantenedoresPorProjeto}
      />

      {!dadosGitHubDisponiveis && (
        <p className="mt-6 text-center text-sm text-light-gray-6">
          Não foi possível obter as estrelas do GitHub neste momento. Volta a
          tentar mais tarde.
        </p>
      )}
    </main>
  );
}
