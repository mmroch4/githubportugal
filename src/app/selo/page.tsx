import { ArrowLeftIcon, RepoIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { links } from "@/config/metadata";
import { metadadosPagina, migalhas, urlAbsoluto, ID_WEBSITE } from "@/lib/seo";
import { GeradorSelo } from "./GeradorSelo";

const description =
  "Selo “Feito em Portugal” para o README do teu projeto open source: mostra que foi feito em Portugal e liga-o ao diretório do GitHub Portugal.";

export const metadata: Metadata = metadadosPagina({
  titulo: "Selo “Feito em Portugal” para o README",
  descricao: description,
  caminho: "/selo",
});

const buttonClassName =
  "flex w-fit items-center justify-center rounded p-2 hover:bg-light-gray-1 focus:bg-light-gray-1 active:bg-light-gray-2 md:p-3";

/** Repositórios do diretório, só a partir do ficheiro (sem pedidos ao GitHub). */
async function lerRepositorios() {
  const conteudo = await readFile(
    path.join(process.cwd(), "data", "projetos.yml"),
    "utf8"
  );
  const { projetos } = parse(conteudo) as {
    projetos?: { repositorio: string }[];
  };
  return (projetos ?? [])
    .map((p) => p.repositorio)
    .sort((a, b) => a.localeCompare(b, "pt-PT"));
}

export default async function Selo() {
  const repositorios = await lerRepositorios();

  return (
    <main className="m-auto w-full max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-3xl">
      <nav className="mb-2 sm:mb-3 md:mb-4">
        <Link href="/projetos" className={buttonClassName}>
          <ArrowLeftIcon
            verticalAlign="middle"
            className="h-5 w-5 fill-light-black md:h-6 md:w-6"
          />
          <span className="sr-only">Voltar aos projetos</span>
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
          Selo “Feito em Portugal”
        </h1>
        <p className="text-base text-light-gray-7 sm:text-lg">
          Tens um projeto no{" "}
          <Link href="/projetos" className="font-bold underline">
            diretório
          </Link>
          ? Mostra no README que foi feito em Portugal. O selo liga à entrada do
          teu projeto no GitHub Portugal, para que quem o encontra descubra
          também os outros projetos portugueses.
        </p>
      </header>

      <GeradorSelo repositorios={repositorios} />

      <section className="mt-8 text-sm text-light-gray-7 sm:text-base">
        <h2 className="mb-2 text-xl font-bold text-light-black">
          Perguntas rápidas
        </h2>
        <dl className="flex flex-col gap-3">
          <div>
            <dt className="font-bold text-light-black">
              Preciso de estar no diretório?
            </dt>
            <dd>
              O selo é para projetos open source criados ou mantidos em
              Portugal. Se o teu ainda não está na lista,{" "}
              <a
                href={`${links.repository}/blob/main/CONTRIBUTING.md#adicionar-um-projeto`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline"
              >
                adiciona-o com um pull request
              </a>
              .
            </dd>
          </div>
          <div>
            <dt className="font-bold text-light-black">O selo muda sozinho?</dt>
            <dd>
              Sim. As imagens são servidas por githubportugal.com, por isso
              qualquer melhoria ao selo chega ao teu README sem mudares nada.
            </dd>
          </div>
          <div>
            <dt className="font-bold text-light-black">
              Posso usar o selo noutro sítio?
            </dt>
            <dd>
              Podes: no site do projeto, na documentação ou numa apresentação.
              Usa o link para o diretório para que as pessoas encontrem o
              projeto no GitHub Portugal.
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-8">
        <Link
          href="/projetos"
          className="flex w-fit items-center justify-center gap-2 rounded-md border border-light-gray-3 px-4 py-2 text-sm font-bold hover:bg-light-gray-1 sm:text-base"
        >
          <RepoIcon className="fill-light-black" />
          Ver os projetos portugueses
        </Link>
      </p>

      <DadosEstruturados
        dados={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${urlAbsoluto("/selo")}#pagina`,
          url: urlAbsoluto("/selo"),
          name: "Selo “Feito em Portugal”",
          description,
          inLanguage: "pt-PT",
          isPartOf: { "@id": ID_WEBSITE },
          primaryImageOfPage: urlAbsoluto("/selo/feito-em-portugal-claro.svg"),
          breadcrumb: migalhas([
            { nome: "Projetos", caminho: "/projetos" },
            { nome: "Selo “Feito em Portugal”", caminho: "/selo" },
          ]),
        }}
      />
    </main>
  );
}
