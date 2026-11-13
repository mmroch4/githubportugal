import { CalendarIcon, PlusIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { metadadosPagina, paginaColecao } from "@/lib/seo";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { links } from "@/config/metadata";
import { obterComunidades } from "@/lib/comunidades";
import { DiretorioComunidades } from "./DiretorioComunidades";

const description =
  "Comunidades de tecnologia em Portugal: meetups, grupos de utilizadores, associações e hackerspaces, por tema e por cidade.";

export const metadata: Metadata = metadadosPagina({
  titulo: "Comunidades tech em Portugal",
  descricao: description,
  caminho: "/comunidades",
});

export default async function Comunidades() {
  const { comunidades, categorias } = await obterComunidades();

  return (
    <main className="m-auto w-full max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
      <header className="mb-6 flex flex-col gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Comunidades
          </h1>
          <p className="max-w-2xl text-base text-light-gray-7 sm:text-lg">
            Meetups, grupos de utilizadores, associações e hackerspaces de
            tecnologia em Portugal. Falta a tua comunidade? Adiciona-a com um
            pull request.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/eventos"
            className="botao-secundario"
          >
            <CalendarIcon className="fill-light-black" />
            Eventos
          </Link>
          <a
            href={`${links.repository}/blob/main/CONTRIBUTING.md#adicionar-uma-comunidade`}
            target="_blank"
            rel="noopener noreferrer"
            className="botao-primario"
          >
            <PlusIcon className="fill-current" />
            Adicionar comunidade
          </a>
        </div>
      </header>

      <DiretorioComunidades comunidades={comunidades} categorias={categorias} />
      <DadosEstruturados
        dados={paginaColecao({
          nome: "Comunidades tech em Portugal",
          descricao: description,
          caminho: "/comunidades",
          itens: comunidades.map((c) => ({
            "@type": "Organization",
            name: c.nome,
            description: c.descricao,
            url: c.site,
            ...(c.github ? { sameAs: [`https://github.com/${c.github}`] } : {}),
            ...(c.cidade
              ? {
                  location: {
                    "@type": "Place",
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: c.cidade,
                      addressCountry: "PT",
                    },
                  },
                }
              : {}),
          })),
        })}
      />
    </main>
  );
}
