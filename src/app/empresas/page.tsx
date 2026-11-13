import { PlusIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import { metadadosPagina, paginaColecao } from "@/lib/seo";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
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
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6">
      <CabecalhoPagina
        etiqueta={`${empresas.length} empresas com código aberto`}
        titulo="Empresas"
      >
        <a
          href={`${links.repository}/blob/main/CONTRIBUTING.md#adicionar-uma-empresa`}
          target="_blank"
          rel="noopener noreferrer"
          className="botao-primario"
        >
          <PlusIcon className="fill-current" />
          Adicionar empresa
        </a>
      </CabecalhoPagina>

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
