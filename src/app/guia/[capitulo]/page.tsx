import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import {
  ID_ORGANIZACAO,
  ID_WEBSITE,
  metadadosPagina,
  migalhas,
  urlAbsoluto,
} from "@/lib/seo";
import { notFound } from "next/navigation";
import { capitulos, obterCapitulo } from "@/content/guia/capitulos";

type Props = { params: Promise<{ capitulo: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return capitulos.map((c) => ({ capitulo: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { capitulo } = await params;
  const dados = obterCapitulo(capitulo);
  if (!dados) return {};
  const { titulo, descricao } = dados.capitulo;

  return metadadosPagina({
    titulo: `${titulo} · Guia de código aberto`,
    tituloSocial: titulo,
    descricao,
    caminho: `/guia/${capitulo}`,
    tipo: "article",
  });
}

export default async function CapituloGuia({ params }: Props) {
  const { capitulo } = await params;
  const dados = obterCapitulo(capitulo);
  if (!dados) notFound();

  const { default: Conteudo } = await import(`@/content/guia/${capitulo}.mdx`);
  const { numero, anterior, seguinte } = dados;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      <Link
        href="/guia"
        className="mb-6 inline-block font-mono text-sm text-light-gray-6 hover:text-marca-verde"
      >
        ← guia
      </Link>

      <header className="mb-8 flex flex-col gap-3">
        <p className="etiqueta">
          {`// capítulo ${numero} de ${capitulos.length}`}
        </p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          {dados.capitulo.titulo}
        </h1>
      </header>

      <article className="space-y-3 sm:space-y-4">
        <Conteudo />
      </article>

      <nav
        aria-label="Capítulos"
        className="mt-10 grid grid-cols-1 gap-3 border-t border-t-light-gray-2 pt-6 sm:grid-cols-2"
      >
        {anterior ? (
          <Link
            href={`/guia/${anterior.slug}`}
            className="group flex items-center gap-3 rounded-xl border border-light-gray-2 bg-white/60 p-4 hover:border-light-gray-4 focus:border-light-gray-4"
          >
            <ChevronLeftIcon className="shrink-0 fill-light-gray-6 duration-100 ease-in-out group-hover:-translate-x-0.5" />
            <span>
              <span className="block text-sm text-light-gray-6">Anterior</span>
              <span className="block font-bold">{anterior.titulo}</span>
            </span>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {seguinte ? (
          <Link
            href={`/guia/${seguinte.slug}`}
            className="group flex items-center justify-end gap-3 rounded-xl border border-light-gray-2 bg-white/60 p-4 text-right hover:border-light-gray-4 focus:border-light-gray-4"
          >
            <span>
              <span className="block text-sm text-light-gray-6">Seguinte</span>
              <span className="block font-bold">{seguinte.titulo}</span>
            </span>
            <ChevronRightIcon className="shrink-0 fill-light-gray-6 duration-100 ease-in-out group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <Link
            href="/primeiras-contribuicoes"
            className="group flex items-center justify-end gap-3 rounded-xl border border-light-gray-2 bg-white/60 p-4 text-right hover:border-light-gray-4 focus:border-light-gray-4"
          >
            <span>
              <span className="block text-sm text-light-gray-6">
                Chegaste ao fim do guia
              </span>
              <span className="block font-bold">
                Encontrar uma primeira contribuição
              </span>
            </span>
            <ChevronRightIcon className="shrink-0 fill-light-gray-6 duration-100 ease-in-out group-hover:translate-x-0.5" />
          </Link>
        )}
      </nav>
      <DadosEstruturados
        dados={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "TechArticle",
              "@id": `${urlAbsoluto(`/guia/${capitulo}`)}#artigo`,
              mainEntityOfPage: urlAbsoluto(`/guia/${capitulo}`),
              url: urlAbsoluto(`/guia/${capitulo}`),
              headline: dados.capitulo.titulo,
              description: dados.capitulo.descricao,
              inLanguage: "pt-PT",
              position: numero,
              image: urlAbsoluto("/opengraph-image"),
              author: { "@id": ID_ORGANIZACAO },
              publisher: { "@id": ID_ORGANIZACAO },
              isPartOf: [
                {
                  "@type": "CreativeWorkSeries",
                  name: "Guia de código aberto",
                  url: urlAbsoluto("/guia"),
                },
                { "@id": ID_WEBSITE },
              ],
              educationalLevel: "Iniciante",
              about: ["Código aberto", "Open source", "GitHub"],
            },
            migalhas([
              { nome: "Guia de código aberto", caminho: "/guia" },
              { nome: dados.capitulo.titulo, caminho: `/guia/${capitulo}` },
            ]),
          ],
        }}
      />
    </main>
  );
}
