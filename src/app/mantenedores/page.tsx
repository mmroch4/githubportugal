import { PlusIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import { metadadosPagina, paginaColecao, urlAbsoluto } from "@/lib/seo";
import { caminhoMantenedor } from "@/lib/formatar";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
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
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <CabecalhoPagina
        etiqueta={`${mantenedores.length} mantenedores`}
        titulo="Pessoas"
      >
        <a
          href={`${links.repository}/blob/main/CONTRIBUTING.md#adicionar-um-mantenedor`}
          target="_blank"
          rel="noopener noreferrer"
          className="botao-primario"
        >
          <PlusIcon className="fill-current" />
          Adicionar-me
        </a>
      </CabecalhoPagina>

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
