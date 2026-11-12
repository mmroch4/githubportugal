import { ChevronRightIcon, MarkGithubIcon } from "@primer/octicons-react";
import { Logo } from "@/components/Logo";
import { links } from "@/config/metadata";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center px-6 py-4">
      <Logo
        priority
        size={128}
        className="mb-4 h-20 w-20 sm:mb-5 sm:h-24 sm:w-24 md:h-28 md:w-28"
      />

      <span className="mb-3 select-none rounded-full bg-light-blue-2 px-3 py-1 font-bold  sm:mb-4">
        de DEV para DEV
      </span>

      <h1 className="mb-2 text-center text-5xl font-black sm:mb-3 sm:text-6xl md:mb-4 md:text-7xl lg:text-8xl">
        GitHub Portugal
      </h1>

      <p className="mb-4 max-w-sm text-center text-lg sm:mb-5 sm:max-w-md sm:text-xl md:mb-6 md:max-w-lg md:text-2xl lg:max-w-xl">
        Comunidade portuguesa de programadores e de projetos open source no
        GitHub
      </p>

      <div className="flex max-w-4xl flex-col flex-wrap items-center justify-center gap-4 sm:flex-row md:gap-6">
        <Link
          href="/projetos"
          className="group flex items-center justify-center gap-2 rounded bg-light-gray-9 px-6 py-3 text-sm font-bold text-white sm:text-base md:text-lg"
        >
          Explorar projetos
          <ChevronRightIcon className="fill-white delay-75 duration-100 ease-in-out group-hover:translate-x-0.5" />
        </Link>

        <Link
          href="/primeiras-contribuicoes"
          className="flex items-center justify-center gap-2 rounded border border-light-gray-3 bg-transparent px-6 py-3 text-sm font-bold sm:text-base md:text-lg"
        >
          Primeira contribuição
        </Link>

        <Link
          href="/mantenedores"
          className="flex items-center justify-center gap-2 rounded border border-light-gray-3 bg-transparent px-6 py-3 text-sm font-bold sm:text-base md:text-lg"
        >
          Mantenedores
        </Link>

        <Link
          href="/ranking"
          className="flex items-center justify-center gap-2 rounded border border-light-gray-3 bg-transparent px-6 py-3 text-sm font-bold sm:text-base md:text-lg"
        >
          Ranking
        </Link>

        <Link
          href="/sobre"
          className="flex items-center justify-center gap-2 rounded border border-light-gray-3 bg-transparent px-6 py-3 text-sm font-bold sm:text-base md:text-lg"
        >
          Ler mais
        </Link>

        <a
          href={links.repository}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded border border-light-gray-3 bg-transparent px-6 py-3 text-sm font-bold sm:text-base md:text-lg"
        >
          <MarkGithubIcon className="h-5 w-5 fill-light-black" />
          Repositório no GitHub
        </a>
      </div>
    </main>
  );
}
