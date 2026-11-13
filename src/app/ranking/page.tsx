import { PersonIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import { metadadosPagina, paginaColecao } from "@/lib/seo";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { Suspense } from "react";
import { links } from "@/config/metadata";
import { lerProgramadores } from "@/lib/estatisticas";
import { obterRanking } from "@/lib/ranking";
import { AMBITOS, type Ambito } from "@/lib/ranking-tipos";
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
  const [ranking, programadores] = await Promise.all([
    obterRanking(),
    lerProgramadores(),
  ]);
  // Quantas pessoas há em cada zona (o ranking só guarda as primeiras 100).
  const contagens: Partial<Record<Ambito, number>> = {};
  if (programadores) {
    contagens.pais = programadores.pessoas;
    for (const a of AMBITOS) {
      const cidade = programadores.cidades.find((c) => c.rotulo === a.nome);
      if (cidade) contagens[a.id] = cidade.valor;
    }
  }
  const urlExclusoes = `${links.repository}/blob/main/CONTRIBUTING.md#sair-do-ranking`;

  return (
    <main className="m-auto w-full max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-3xl lg:max-w-4xl">
      <header className="mb-8 flex flex-col gap-3">
        <p className="etiqueta">{"// últimos 12 meses"}</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          Ranking
        </h1>
      </header>

      {ranking.geradoEm ? (
        <Suspense
          fallback={<TabelaRanking ranking={ranking} contagens={contagens} />}
        >
          <TabelaRankingComParametros ranking={ranking} contagens={contagens} />
        </Suspense>
      ) : (
        <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
          O ranking ainda está a ser gerado. Volta daqui a pouco.
        </p>
      )}

      <section className="mt-8 flex flex-col gap-2 rounded-xl border border-light-gray-2 bg-white/60 p-4 text-sm text-light-gray-7 sm:p-5">
        <h2 className="flex items-center gap-2 text-base font-bold text-light-black">
          <PersonIcon className="fill-marca-verde" />
          Como entras no ranking
        </h2>
        <p>
          Põe a tua cidade ou “Portugal” na localização do teu perfil do GitHub.
          Contam commits, pull requests, issues e revisões públicos.
        </p>
        <p>
          <a
            href={urlExclusoes}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-marca-verde underline"
          >
            Sair do ranking
          </a>
          {ranking.geradoEm && (
            <span className="text-light-gray-6">
              {" "}
              · atualizado a {formatoData.format(new Date(ranking.geradoEm))}
            </span>
          )}
        </p>
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
