import { PeopleIcon, PlusIcon, RepoIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { metadadosPagina, paginaColecao } from "@/lib/seo";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { links } from "@/config/metadata";
import { obterEmpresas } from "@/lib/empresas";
import { DiretorioEmpresas } from "./DiretorioEmpresas";

// Volta a pedir os dados das organizações ao GitHub, no máximo, de 6 em 6 horas.
export const revalidate = 21600;

const description =
  "Empresas de tecnologia em Portugal que publicam código aberto no GitHub, com os seus repositórios em destaque e onde trabalhar.";

export const metadata: Metadata = metadadosPagina({
  titulo: "Empresas tech em Portugal com código aberto",
  descricao: description,
  caminho: "/empresas",
});

export default async function Empresas() {
  const { empresas, setores, dadosGitHubDisponiveis } = await obterEmpresas();

  return (
    <main className="m-auto w-full max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
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
      <DadosEstruturados
        dados={paginaColecao({
          nome: "Empresas tech em Portugal com código aberto",
          descricao: description,
          caminho: "/empresas",
          itens: empresas.map((e) => ({
            "@type": "Organization",
            name: e.nome,
            description: e.descricao,
            url: e.site ?? `https://github.com/${e.github}`,
            logo: e.avatar,
            sameAs: [`https://github.com/${e.github}`],
            ...(e.cidades.length
              ? {
                  address: e.cidades.map((cidade) => ({
                    "@type": "PostalAddress",
                    addressLocality: cidade,
                    addressCountry: "PT",
                  })),
                }
              : {}),
          })),
        })}
      />
    </main>
  );
}
