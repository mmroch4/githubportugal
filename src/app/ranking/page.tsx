import { PersonIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import { metadadosPagina, paginaColecao } from "@/lib/seo";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { Suspense } from "react";
import { links } from "@/config/metadata";
import { obterRanking } from "@/lib/ranking";
import { TabelaRanking, TabelaRankingComParametros } from "./TabelaRanking";

const description =
  "Os programadores mais ativos no GitHub em Portugal, em Lisboa, no Porto, em Braga e em Coimbra, por contribuições públicas no último ano e por seguidores.";

export const metadata: Metadata = metadadosPagina({
  titulo: "Ranking de programadores em Portugal no GitHub",
  descricao: description,
  caminho: "/ranking",
});

const formatoData = new Intl.DateTimeFormat("pt-PT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Lisbon",
});

export default async function PaginaRanking() {
  const ranking = await obterRanking();
  const urlExclusoes = `${links.repository}/blob/main/CONTRIBUTING.md#sair-do-ranking`;

  return (
    <main className="m-auto w-full max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-3xl lg:max-w-4xl">
      <header className="mb-6">
        <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
          Ranking
        </h1>
        <p className="max-w-2xl text-base text-light-gray-7 sm:text-lg">
          Quem mais contribui para projetos públicos no GitHub em Portugal. As
          contribuições contam commits, pull requests, issues e revisões em
          repositórios públicos nos últimos 12 meses.
        </p>
      </header>

      {ranking.geradoEm ? (
        <Suspense fallback={<TabelaRanking ranking={ranking} />}>
          <TabelaRankingComParametros ranking={ranking} />
        </Suspense>
      ) : (
        <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
          O ranking ainda está a ser gerado. Volta daqui a pouco.
        </p>
      )}

      <section className="mt-8 rounded-xl border border-light-gray-2 bg-white/60 p-4 text-sm text-light-gray-7 sm:p-5">
        <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-light-black">
          <PersonIcon className="fill-light-black" />
          Como entras no ranking
        </h2>
        <p className="mb-2">
          Uma GitHub Action pesquisa todas as semanas os perfis públicos com
          localização em Portugal e lê as contribuições públicas de cada um.
          Para apareceres, escreve no teu perfil do GitHub a tua cidade ou
          “Portugal” no campo da localização. A pesquisa do GitHub devolve, no
          máximo, as 1000 contas com mais seguidores por localização, por isso
          quem tem muito poucos seguidores pode ficar de fora.
        </p>
        <p className="mb-2">
          Para contares também as contribuições em repositórios privados, ativa
          “Private contributions” nas definições do teu perfil: aparecem no
          GitHub, mas não entram neste ranking.
        </p>
        <p>
          Não queres aparecer?{" "}
          <a
            href={urlExclusoes}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-marca-verde underline"
          >
            Pede para sair do ranking
          </a>
          .
        </p>
        {ranking.geradoEm && (
          <p className="mt-3 text-light-gray-6">
            Atualizado a {formatoData.format(new Date(ranking.geradoEm))}, a
            partir de {ranking.totalAnalisado.toLocaleString("pt-PT")} perfis
            analisados.
          </p>
        )}
      </section>
      <DadosEstruturados
        dados={paginaColecao({
          nome: "Ranking de programadores em Portugal no GitHub",
          descricao: description,
          caminho: "/ranking",
        })}
      />
    </main>
  );
}
