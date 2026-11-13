import { Metadata } from "next";
import Link from "next/link";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
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

const numero = new Intl.NumberFormat("pt-PT", { useGrouping: "always" });
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
        className="block font-mono text-2xl font-bold tabular-nums sm:text-3xl"
        title={completo}
      >
        {valor}
      </span>
      <span className="mt-1 block font-mono text-xs text-light-gray-6">
        {rotulo}
      </span>
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
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <CabecalhoPagina
        etiqueta={
          prog
            ? `atualizado a ${formatoData.format(new Date(prog.geradoEm))}`
            : "atualizado todas as semanas"
        }
        titulo="Estatísticas"
      />

      <section aria-labelledby="titulo-programadores" className="mb-12">
        <h2 id="titulo-programadores" className="etiqueta mb-4">
          {"// programadores em portugal"}
        </h2>

        {prog ? (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Numero
                valor={numero.format(prog.pessoas)}
                rotulo="pessoas"
                href="/ranking"
              />
              <Numero
                valor={percentagem.format(prog.ativas / prog.pessoas)}
                rotulo="ativas no último ano"
                completo={`${numero.format(prog.ativas)} pessoas`}
              />
              <Numero
                valor={compacto.format(prog.contribuicoes)}
                rotulo="contribuições"
                completo={numero.format(prog.contribuicoes)}
              />
              <Numero
                valor={numero.format(
                  Math.round(prog.contribuicoes / Math.max(1, prog.ativas))
                )}
                rotulo="por pessoa ativa"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Cartao
                titulo="Onde vivem"
              >
                <BarrasHorizontais
                  titulo="Pessoas por cidade"
                  dados={prog.cidades}
                  unidade="pessoas"
                />
              </Cartao>

              <Cartao
                titulo="Linguagens mais usadas"
              >
                <BarrasHorizontais
                  titulo="Pessoas por linguagem principal"
                  dados={prog.linguagens}
                  unidade="pessoas"
                />
              </Cartao>

              <Cartao
                titulo="Quanto contribuem"
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
                    ? undefined
                    : "A linha cresce todas as semanas."
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
        <h2 id="titulo-projetos" className="etiqueta mb-4">
          {"// projetos e comunidade"}
        </h2>

        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Numero
            valor={numero.format(comunidade.projetos)}
            rotulo="projetos"
            href="/projetos"
          />
          <Numero
            valor={compacto.format(comunidade.estrelas)}
            rotulo="estrelas"
            completo={numero.format(comunidade.estrelas)}
          />
          <Numero
            valor={numero.format(comunidade.mantenedores)}
            rotulo="mantenedores"
            href="/mantenedores"
          />
          <Numero
            valor={numero.format(comunidade.empresas)}
            rotulo="empresas"
            href="/empresas"
          />
          <Numero
            valor={numero.format(comunidade.comunidades)}
            rotulo="comunidades"
            href="/comunidades"
          />
          <Numero
            valor={numero.format(comunidade.eventosProximos)}
            rotulo="eventos"
            href="/eventos"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {projetos.maisEstrelas.length > 0 && (
            <Cartao
              titulo="Projetos com mais estrelas"
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
          >
            <BarrasHorizontais
              titulo="Comunidades por cidade"
              dados={cidadesComunidades}
              unidade="comunidades"
            />
          </Cartao>
        </div>
      </section>

      <p className="font-mono text-xs leading-relaxed text-light-gray-6">
        {"// "}fonte: perfis públicos do GitHub com localização em Portugal (só
        totais, nunca dados pessoais) e o{" "}
        <Link href="/projetos" className="text-marca-verde hover:underline">
          diretório de projetos
        </Link>
        . A pesquisa do GitHub limita os resultados, por isso os números ficam
        abaixo do real.{" "}
        <a
          href={`${links.repository.replace(
            "github.com",
            "raw.githubusercontent.com"
          )}/main/data/estatisticas.json`}
          className="text-marca-verde hover:underline"
        >
          dados em JSON
        </a>
      </p>

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
