import { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
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
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      <CabecalhoPagina etiqueta="para o teu README" titulo="Selo" />

      <GeradorSelo repositorios={repositorios} />

      <p className="mt-8 font-mono text-xs leading-relaxed text-light-gray-6">
        {"// "}o teu projeto ainda não está no diretório?{" "}
        <a
          href={`${links.repository}/blob/main/CONTRIBUTING.md#adicionar-um-projeto`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-marca-verde hover:underline"
        >
          adiciona-o →
        </a>
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
