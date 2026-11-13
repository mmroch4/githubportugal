import { CalendarIcon, PlusIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { metadadosPagina, paginaColecao } from "@/lib/seo";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
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
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <CabecalhoPagina
        etiqueta={`${comunidades.length} comunidades`}
        titulo="Comunidades"
      >
        <Link href="/eventos" className="botao-secundario">
          <CalendarIcon className="fill-current" />
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
      </CabecalhoPagina>

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
