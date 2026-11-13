import { ChevronRightIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { metadadosPagina, paginaColecao, urlAbsoluto } from "@/lib/seo";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { capitulos } from "@/content/guia/capitulos";

const description =
  "Guia de código aberto em português de Portugal: como fazer a tua primeira contribuição, escolher uma licença, iniciar um projeto, construir uma comunidade e manter um projeto open source.";

export const metadata: Metadata = metadadosPagina({
  titulo: "Guia de código aberto",
  descricao: description,
  caminho: "/guia",
});

export default function Guia() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      <CabecalhoPagina
        etiqueta={`${capitulos.length} capítulos`}
        titulo="Guia de código aberto"
      />

      <ol className="flex flex-col gap-2">
        {capitulos.map((c, i) => (
          <li key={c.slug}>
            <Link
              href={`/guia/${c.slug}`}
              title={c.descricao}
              className="group flex items-center gap-4 rounded-xl border border-light-gray-2 bg-white/60 p-4 transition hover:bg-white sm:px-5"
            >
              <span className="font-mono text-2xl font-bold text-marca-verde">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 font-semibold sm:text-lg">
                {c.titulo}
              </span>
              <ChevronRightIcon className="shrink-0 fill-light-gray-6 duration-100 ease-in-out group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-10 font-mono text-xs text-light-gray-6">
        {"// encontraste um erro? "}
        <a
          href="https://github.com/mmroch4/githubportugal/tree/main/src/content/guia"
          target="_blank"
          rel="noopener noreferrer"
          className="text-marca-verde hover:underline"
        >
          edita o capítulo →
        </a>
      </p>
      <DadosEstruturados
        dados={paginaColecao({
          nome: "Guia de código aberto",
          descricao: description,
          caminho: "/guia",
          itens: capitulos.map((c) => ({
            "@type": "TechArticle",
            headline: c.titulo,
            description: c.descricao,
            url: urlAbsoluto(`/guia/${c.slug}`),
            inLanguage: "pt-PT",
          })),
        })}
      />
    </main>
  );
}
