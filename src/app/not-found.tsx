import { ChevronRightIcon } from "@primer/octicons-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <h1 className="mb-4 bg-gradient-to-r from-marca-verde to-marca-vermelho bg-clip-text text-center font-mono text-7xl font-bold text-transparent sm:text-8xl">
        404
      </h1>

      <p className="mb-8 rounded-lg border border-light-gray-2 bg-white/60 px-4 py-3 font-mono text-sm text-light-gray-7 sm:text-base">
        <span className="text-marca-verde">$</span> cd esta-página
        <br />
        <span className="text-marca-vermelho">erro:</span> não existe
      </p>

      <Link
        href="/"
        className="group botao-primario"
      >
        Voltar à página principal
        <ChevronRightIcon className="fill-current delay-75 duration-100 ease-in-out group-hover:translate-x-0.5" />
      </Link>
    </main>
  );
}
