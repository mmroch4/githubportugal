import { ChevronRightIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { metadadosPagina, paginaColecao, urlAbsoluto } from "@/lib/seo";
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
    <main className="m-auto w-full max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-2xl lg:max-w-3xl">
      <header className="mb-6 sm:mb-8">
        <h1 className="mb-2 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
          Guia de código aberto
        </h1>
        <p className="text-base text-light-gray-7 sm:text-lg">
          Tudo o que precisas para dar os primeiros passos no open source, ou
          para fazer crescer o teu projeto: da primeira contribuição à
          manutenção de um projeto com comunidade. Escrito em português de
          Portugal, pela comunidade e para a comunidade.
        </p>
      </header>

      <ol className="flex flex-col gap-3 sm:gap-4">
        {capitulos.map((c, i) => (
          <li key={c.slug}>
            <Link
              href={`/guia/${c.slug}`}
              className="group flex items-center gap-4 rounded-xl border border-light-gray-2 bg-white/60 p-4 hover:border-light-gray-4 focus:border-light-gray-4 sm:p-5"
            >
              <span
                aria-hidden
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-light-gray-1 text-2xl"
              >
                {c.emoji}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-light-gray-6">
                  Capítulo {i + 1}
                </span>
                <span className="block text-lg font-extrabold sm:text-xl">
                  {c.titulo}
                </span>
                <span className="block text-sm text-light-gray-7 sm:text-base">
                  {c.descricao}
                </span>
              </span>
              <ChevronRightIcon className="shrink-0 fill-light-gray-6 duration-100 ease-in-out group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-sm text-light-gray-7 sm:text-base">
        Encontraste um erro ou queres melhorar um capítulo? Os textos estão em{" "}
        <a
          href="https://github.com/mmroch4/githubportugal/tree/main/src/content/guia"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold hover:underline focus:underline"
        >
          src/content/guia
        </a>{" "}
        no repositório: abre um pull request.
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
