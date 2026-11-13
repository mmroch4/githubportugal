import { PlusIcon, RepoIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { metadadosPagina, paginaColecao, urlAbsoluto } from "@/lib/seo";
import { caminhoMantenedor } from "@/lib/formatar";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { links } from "@/config/metadata";
import { obterMantenedores } from "@/lib/mantenedores";
import { ListaMantenedores } from "./ListaMantenedores";

// Volta a pedir os perfis ao GitHub, no máximo, de 6 em 6 horas.
export const revalidate = 21600;

const description =
  "Programadores portugueses que criam e mantêm projetos open source, com os projetos de cada um no diretório do GitHub Portugal.";

export const metadata: Metadata = metadadosPagina({
  titulo: "Mantenedores open source portugueses",
  descricao: description,
  caminho: "/mantenedores",
});

export default async function Mantenedores() {
  const { mantenedores, dadosGitHubDisponiveis } = await obterMantenedores();

  return (
    <main className="m-auto w-full max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
      <header className="mb-6 flex flex-col gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Mantenedores
          </h1>
          <p className="max-w-2xl text-base text-light-gray-7 sm:text-lg">
            As pessoas por trás dos projetos open source portugueses. Manténs um
            projeto do diretório? Adiciona-te com um pull request.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/projetos"
            className="botao-secundario"
          >
            <RepoIcon className="fill-light-black" />
            Projetos
          </Link>
          <a
            href={`${links.repository}/blob/main/CONTRIBUTING.md#adicionar-um-mantenedor`}
            target="_blank"
            rel="noopener noreferrer"
            className="botao-primario"
          >
            <PlusIcon className="fill-current" />
            Adicionar-me
          </a>
        </div>
      </header>

      <ListaMantenedores mantenedores={mantenedores} />

      {!dadosGitHubDisponiveis && (
        <p className="mt-6 text-center text-sm text-light-gray-6">
          Não foi possível obter os perfis do GitHub neste momento. Volta a
          tentar mais tarde.
        </p>
      )}
      <DadosEstruturados
        dados={paginaColecao({
          nome: "Mantenedores open source portugueses",
          descricao: description,
          caminho: "/mantenedores",
          itens: mantenedores.map((m) => ({
            "@type": "Person",
            name: m.nome,
            alternateName: m.login,
            url: urlAbsoluto(caminhoMantenedor(m.login)),
            image: m.avatar,
            sameAs: [m.url],
          })),
        })}
      />
    </main>
  );
}
