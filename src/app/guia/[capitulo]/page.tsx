import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
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

  return {
    title: `${titulo} · Guia de código aberto`,
    description: descricao,
    alternates: { canonical: `/guia/${capitulo}` },
    openGraph: { title: titulo, description: descricao },
  };
}

const buttonClassName =
  "flex w-fit items-center justify-center gap-2 rounded p-2 font-bold hover:bg-light-gray-1 focus:bg-light-gray-1 active:bg-light-gray-2 md:p-3";

export default async function CapituloGuia({ params }: Props) {
  const { capitulo } = await params;
  const dados = obterCapitulo(capitulo);
  if (!dados) notFound();

  const { default: Conteudo } = await import(`@/content/guia/${capitulo}.mdx`);
  const { numero, anterior, seguinte } = dados;

  return (
    <main className="m-auto w-full max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-2xl lg:max-w-3xl">
      <nav className="mb-2 sm:mb-3 md:mb-4">
        <Link href="/guia" className={buttonClassName}>
          <ArrowLeftIcon
            verticalAlign="middle"
            className="h-5 w-5 fill-light-black md:h-6 md:w-6"
          />
          Guia de código aberto
        </Link>
      </nav>

      <header className="mb-6 sm:mb-8">
        <p className="mb-1 font-bold text-light-gray-6">
          Capítulo {numero} de {capitulos.length}
        </p>
        <h1 className="mb-2 text-3xl font-black sm:text-4xl md:text-5xl">
          <span aria-hidden>{dados.capitulo.emoji} </span>
          {dados.capitulo.titulo}
        </h1>
        <p className="text-base text-light-gray-7 sm:text-lg">
          {dados.capitulo.descricao}
        </p>
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
            className="group flex items-center gap-3 rounded-md border border-light-gray-2 bg-white p-4 hover:border-light-gray-4 focus:border-light-gray-4"
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
            className="group flex items-center justify-end gap-3 rounded-md border border-light-gray-2 bg-white p-4 text-right hover:border-light-gray-4 focus:border-light-gray-4"
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
            className="group flex items-center justify-end gap-3 rounded-md border border-light-gray-2 bg-white p-4 text-right hover:border-light-gray-4 focus:border-light-gray-4"
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
    </main>
  );
}
