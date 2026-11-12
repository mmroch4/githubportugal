import {
  ArrowLeftIcon,
  PeopleIcon,
  PlusIcon,
  RepoIcon,
} from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { links } from "@/config/metadata";
import { obterEmpresas } from "@/lib/empresas";
import { DiretorioEmpresas } from "./DiretorioEmpresas";

// Volta a pedir os dados das organizações ao GitHub, no máximo, de 6 em 6 horas.
export const revalidate = 21600;

const description =
  "Empresas de tecnologia em Portugal que publicam código aberto no GitHub, com os seus repositórios em destaque e onde trabalhar.";

export const metadata: Metadata = {
  title: "Empresas",
  description,
  alternates: { canonical: "/empresas" },
  openGraph: {
    title: "Empresas tech em Portugal com código aberto",
    description,
  },
};

const buttonClassName =
  "flex w-fit items-center justify-center rounded p-2 hover:bg-light-gray-1 focus:bg-light-gray-1 active:bg-light-gray-2 md:p-3";

export default async function Empresas() {
  const { empresas, setores, dadosGitHubDisponiveis } = await obterEmpresas();

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
            Empresas
          </h1>
          <p className="max-w-2xl text-base text-light-gray-7 sm:text-lg">
            Empresas de tecnologia com equipas em Portugal que publicam código
            aberto. Vê o que partilham no GitHub e onde podes trabalhar. Falta
            uma empresa? Adiciona-a com um pull request.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/projetos"
            className="flex items-center justify-center gap-2 rounded border border-light-gray-3 px-4 py-2 text-sm font-bold sm:text-base"
          >
            <RepoIcon className="fill-light-black" />
            Projetos
          </Link>
          <Link
            href="/comunidades"
            className="flex items-center justify-center gap-2 rounded border border-light-gray-3 px-4 py-2 text-sm font-bold sm:text-base"
          >
            <PeopleIcon className="fill-light-black" />
            Comunidades
          </Link>
          <a
            href={`${links.repository}/blob/main/CONTRIBUTING.md#adicionar-uma-empresa`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded bg-light-gray-9 px-4 py-2 text-sm font-bold text-white sm:text-base"
          >
            <PlusIcon className="fill-white" />
            Adicionar empresa
          </a>
        </div>
      </header>

      <DiretorioEmpresas empresas={empresas} setores={setores} />

      {!dadosGitHubDisponiveis && (
        <p className="mt-6 text-center text-sm text-light-gray-6">
          Não foi possível obter os dados do GitHub neste momento. Volta a
          tentar mais tarde.
        </p>
      )}
    </main>
  );
}
