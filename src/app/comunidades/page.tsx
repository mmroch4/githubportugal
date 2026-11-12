import { ArrowLeftIcon, CalendarIcon, PlusIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { links } from "@/config/metadata";
import { obterComunidades } from "@/lib/comunidades";
import { DiretorioComunidades } from "./DiretorioComunidades";

const description =
  "Comunidades de tecnologia em Portugal: meetups, grupos de utilizadores, associações e hackerspaces, por tema e por cidade.";

export const metadata: Metadata = {
  title: "Comunidades",
  description,
  alternates: { canonical: "/comunidades" },
  openGraph: { title: "Comunidades tech em Portugal", description },
};

const buttonClassName =
  "flex w-fit items-center justify-center rounded p-2 hover:bg-light-gray-1 focus:bg-light-gray-1 active:bg-light-gray-2 md:p-3";

export default async function Comunidades() {
  const { comunidades, categorias } = await obterComunidades();

  return (
    <main className="m-auto w-full max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
      <nav className="mb-2 sm:mb-3 md:mb-4">
        <Link href="/" className={buttonClassName}>
          <ArrowLeftIcon
            verticalAlign="middle"
            className="h-5 w-5 fill-light-black md:h-6 md:w-6"
          />
          <span className="sr-only">Voltar à página principal</span>
        </Link>
      </nav>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-black sm:text-4xl md:text-5xl">
            Comunidades
          </h1>
          <p className="max-w-2xl text-base text-light-gray-7 sm:text-lg">
            Meetups, grupos de utilizadores, associações e hackerspaces de
            tecnologia em Portugal. Falta a tua comunidade? Adiciona-a com um
            pull request.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/eventos"
            className="flex items-center justify-center gap-2 rounded border border-light-gray-3 px-4 py-2 text-sm font-bold sm:text-base"
          >
            <CalendarIcon className="fill-light-black" />
            Eventos
          </Link>
          <a
            href={`${links.repository}/blob/main/CONTRIBUTING.md#adicionar-uma-comunidade`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded bg-light-gray-9 px-4 py-2 text-sm font-bold text-white sm:text-base"
          >
            <PlusIcon className="fill-white" />
            Adicionar comunidade
          </a>
        </div>
      </header>

      <DiretorioComunidades comunidades={comunidades} categorias={categorias} />
    </main>
  );
}
