import { GraphIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import {
  BarrasHorizontais,
  Cartao,
  Colunas,
  Linhas,
} from "@/components/Graficos";
import { links } from "@/config/metadata";
import { obterEstatisticas } from "@/lib/estatisticas";
import {
  ID_ORGANIZACAO,
  ID_WEBSITE,
  metadadosPagina,
  migalhas,
  urlAbsoluto,
} from "@/lib/seo";

// Os números do diretório vêm do GitHub: atualiza, no máximo, de 6 em 6 horas.
export const revalidate = 21600;

const titulo = "Estatísticas do open source em Portugal";
const description =
  "Quantas pessoas programam no GitHub em Portugal, em que cidades, que linguagens usam e quanto contribuem, mais os números dos projetos open source portugueses.";

export const metadata: Metadata = metadadosPagina({
  titulo,
  descricao: description,
  caminho: "/estatisticas",
});

const numero = new Intl.NumberFormat("pt-PT");
const compacto = new Intl.NumberFormat("pt-PT", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const percentagem = new Intl.NumberFormat("pt-PT", {
  style: "percent",
  maximumFractionDigits: 0,
});
const formatoData = new Intl.DateTimeFormat("pt-PT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Lisbon",
});

function Numero({
  valor,
  rotulo,
  href,
  completo,
}: {
  valor: string;
  rotulo: string;
  href?: string;
  /** Valor exato, quando `valor` está abreviado (por exemplo, "1,2 mil"). */
  completo?: string;
}) {
  const conteudo = (
    <>
      <span
        className="block text-2xl font-black tabular-nums sm:text-3xl"
        title={completo}
      >
        {valor}
      </span>
      <span className="mt-1 block text-sm text-light-gray-6">{rotulo}</span>
    </>
  );
  const classe =
    "rounded-xl border border-light-gray-2 bg-white/60 p-4 text-left";
  return href ? (
    <Link href={href} className={`${classe} hover:bg-light-gray-1`}>
      {conteudo}
    </Link>
  ) : (
    <div className={classe}>{conteudo}</div>
  );
}

export default async function PaginaEstatisticas() {
  const {
    programadores: prog,
    comunidade,
    projetos,
    cidadesComunidades,
  } = await obterEstatisticas();

  const datas = prog?.historico.map((h) => h.data) ?? [];

  return (
    <main className="m-auto w-full max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-3xl lg:max-w-5xl">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
          Estatísticas
        </h1>
        <p className="max-w-2xl text-base text-light-gray-7 sm:text-lg">
          Os números de quem programa no GitHub em Portugal e dos projetos open
          source portugueses, atualizados todas as semanas.
        </p>
      </header>

      <section aria-labelledby="titulo-programadores" className="mb-12">
        <h2
          id="titulo-programadores"
          className="mb-4 text-xl font-bold sm:text-2xl"
        >
          Programadores em Portugal
        </h2>

        {prog ? (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Numero
                valor={numero.format(prog.pessoas)}
                rotulo="perfis com localização em Portugal"
                href="/ranking"
              />
              <Numero
                valor={percentagem.format(prog.ativas / prog.pessoas)}
                rotulo="contribuíram no último ano"
                completo={`${numero.format(prog.ativas)} pessoas`}
              />
              <Numero
                valor={compacto.format(prog.contribuicoes)}
                rotulo="contribuições públicas no último ano"
                completo={numero.format(prog.contribuicoes)}
              />
              <Numero
                valor={numero.format(
                  Math.round(prog.contribuicoes / Math.max(1, prog.ativas))
                )}
                rotulo="contribuições por pessoa ativa"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Cartao
                titulo="Onde vivem"
                descricao="Pessoas por cidade indicada no perfil do GitHub."
              >
                <BarrasHorizontais
                  titulo="Pessoas por cidade"
                  dados={prog.cidades}
                  unidade="pessoas"
                />
              </Cartao>

              <Cartao
                titulo="Linguagens mais usadas"
                descricao="Linguagem principal dos repositórios próprios com mais estrelas de cada pessoa."
              >
                <BarrasHorizontais
                  titulo="Pessoas por linguagem principal"
                  dados={prog.linguagens}
                  unidade="pessoas"
                />
              </Cartao>

              <Cartao
                titulo="Quanto contribuem"
                descricao="Pessoas por número de contribuições públicas (commits, pull requests, issues e revisões) nos últimos 12 meses."
              >
                <Colunas
                  titulo="Pessoas por escalão de contribuições"
                  dados={prog.escaloesContribuicoes}
                  unidade="pessoas"
                  rotuloEixo="Contribuições no último ano"
                />
              </Cartao>

              <Cartao
                titulo="Crescimento"
                descricao={
                  datas.length > 1
                    ? "Perfis analisados e pessoas com contribuições, semana a semana."
                    : `O histórico começou a ${formatoData.format(
                        new Date(prog.geradoEm)
                      )}: a linha cresce com cada atualização semanal.`
                }
              >
                <Linhas
                  titulo="Perfis em Portugal ao longo do tempo"
                  datas={datas}
                  series={[
                    {
                      nome: "Perfis analisados",
                      cor: "--viz-1",
                      valores: prog.historico.map((h) => h.pessoas),
                    },
                    {
                      nome: "Com contribuições",
                      cor: "--viz-2",
                      valores: prog.historico.map((h) => h.ativas),
                    },
                  ]}
                />
              </Cartao>
            </div>
          </>
        ) : (
          <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
            As estatísticas dos programadores são calculadas com o ranking,
            todas as semanas. Volta daqui a pouco.
          </p>
        )}
      </section>

      <section aria-labelledby="titulo-projetos" className="mb-12">
        <h2 id="titulo-projetos" className="mb-4 text-xl font-bold sm:text-2xl">
          Projetos e comunidade
        </h2>

        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Numero
            valor={numero.format(comunidade.projetos)}
            rotulo="projetos no diretório"
            href="/projetos"
          />
          <Numero
            valor={compacto.format(comunidade.estrelas)}
            rotulo="estrelas nesses projetos"
            completo={numero.format(comunidade.estrelas)}
          />
          <Numero
            valor={numero.format(comunidade.mantenedores)}
            rotulo="mantenedores"
            href="/mantenedores"
          />
          <Numero
            valor={numero.format(comunidade.empresas)}
            rotulo="empresas com código aberto"
            href="/empresas"
          />
          <Numero
            valor={numero.format(comunidade.comunidades)}
            rotulo="comunidades tech"
            href="/comunidades"
          />
          <Numero
            valor={numero.format(comunidade.eventosProximos)}
            rotulo="eventos agendados"
            href="/eventos"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {projetos.maisEstrelas.length > 0 && (
            <Cartao
              titulo="Projetos com mais estrelas"
              descricao="Os dez projetos do diretório com mais estrelas no GitHub."
              className="md:col-span-2"
            >
              <BarrasHorizontais
                titulo="Projetos com mais estrelas"
                dados={projetos.maisEstrelas}
                unidade="estrelas"
                mostrarPercentagem={false}
              />
            </Cartao>
          )}

          {projetos.linguagens.length > 0 && (
            <Cartao
              titulo="Linguagens dos projetos"
              descricao="Linguagem principal de cada projeto ativo do diretório."
            >
              <BarrasHorizontais
                titulo="Projetos por linguagem"
                dados={projetos.linguagens}
                unidade="projetos"
              />
            </Cartao>
          )}

          <Cartao
            titulo="Categorias dos projetos"
            descricao="Projetos do diretório por categoria."
          >
            <BarrasHorizontais
              titulo="Projetos por categoria"
              dados={projetos.categorias}
              unidade="projetos"
            />
          </Cartao>

          {projetos.porAno.length > 1 && (
            <Cartao
              titulo="Quando nasceram"
              descricao="Projetos do diretório pelo ano em que o repositório foi criado."
            >
              <Colunas
                titulo="Projetos por ano de criação"
                dados={projetos.porAno}
                unidade="projetos"
                rotuloEixo="Ano de criação"
              />
            </Cartao>
          )}

          <Cartao
            titulo="Comunidades por cidade"
            descricao="Onde se reúnem as comunidades tech do diretório."
          >
            <BarrasHorizontais
              titulo="Comunidades por cidade"
              dados={cidadesComunidades}
              unidade="comunidades"
            />
          </Cartao>
        </div>
      </section>

      <section className="rounded-xl border border-light-gray-2 bg-white/60 p-4 text-sm text-light-gray-7 sm:p-5">
        <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-light-black">
          <GraphIcon className="fill-light-black" />
          De onde vêm os números
        </h2>
        <p className="mb-2">
          Os números dos programadores vêm da mesma pesquisa do{" "}
          <Link
            href="/ranking"
            className="font-medium text-marca-verde underline"
          >
            ranking
          </Link>
          : todas as semanas, uma GitHub Action lê os perfis públicos com
          localização em Portugal. Só guardamos totais, nunca dados de uma
          pessoa em concreto. Como a pesquisa do GitHub devolve no máximo 1000
          contas por pesquisa, os números ficam abaixo do total real, sobretudo
          nas cidades maiores.
        </p>
        <p>
          Os números dos projetos vêm do{" "}
          <Link
            href="/projetos"
            className="font-medium text-marca-verde underline"
          >
            diretório
          </Link>{" "}
          e da API do GitHub. Falta algum projeto?{" "}
          <a
            href={`${links.repository}/blob/main/CONTRIBUTING.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-marca-verde underline"
          >
            Acrescenta-o
          </a>
          .
        </p>
        {prog && (
          <p className="mt-3 text-light-gray-6">
            Programadores atualizados a{" "}
            {formatoData.format(new Date(prog.geradoEm))}.
          </p>
        )}
      </section>

      <DadosEstruturados
        dados={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": `${urlAbsoluto("/estatisticas")}#pagina`,
              url: urlAbsoluto("/estatisticas"),
              name: titulo,
              description,
              inLanguage: "pt-PT",
              isPartOf: { "@id": ID_WEBSITE },
              breadcrumb: migalhas([
                { nome: "Estatísticas", caminho: "/estatisticas" },
              ]),
              ...(prog ? { dateModified: prog.geradoEm } : {}),
            },
            ...(prog
              ? [
                  {
                    "@type": "Dataset",
                    name: "Programadores no GitHub em Portugal",
                    description:
                      "Totais semanais de perfis do GitHub com localização em Portugal: pessoas por cidade, por linguagem principal e por escalão de contribuições públicas.",
                    url: urlAbsoluto("/estatisticas"),
                    inLanguage: "pt-PT",
                    spatialCoverage: {
                      "@type": "Place",
                      name: "Portugal",
                    },
                    dateModified: prog.geradoEm,
                    isAccessibleForFree: true,
                    creator: { "@id": ID_ORGANIZACAO },
                    distribution: {
                      "@type": "DataDownload",
                      encodingFormat: "application/json",
                      contentUrl: `${links.repository.replace(
                        "github.com",
                        "raw.githubusercontent.com"
                      )}/main/data/estatisticas.json`,
                    },
                  },
                ]
              : []),
          ],
        }}
      />
    </main>
  );
}
