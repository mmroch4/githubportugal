"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";

export type LinhaTerminal = {
  chave: string;
  /** Coluna da esquerda: posição ou data. */
  prefixo: string;
  avatar?: string;
  texto: string;
  /** Coluna da direita, a verde (contribuições, estrelas). */
  valor?: string;
};

export type SeparadorTerminal = {
  id: string;
  comando: string;
  linhas: LinhaTerminal[];
  ligacao: { href: string; texto: string };
};

/** Janela de "terminal" da página inicial, com separadores. */
export function TerminalInicio({
  separadores,
}: {
  separadores: SeparadorTerminal[];
}) {
  const [ativo, setAtivo] = useState(separadores[0]?.id);
  const atual = separadores.find((s) => s.id === ativo) ?? separadores[0];
  if (!atual) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-light-gray-2 bg-white/70 shadow-2xl shadow-marca-verde/5 backdrop-blur">
      <div
        role="tablist"
        aria-label="Destaques"
        className="flex gap-1 border-b border-light-gray-2 p-2 font-mono text-xs"
      >
        {separadores.map((s) => (
          <button
            key={s.id}
            role="tab"
            type="button"
            id={`separador-${s.id}`}
            aria-selected={s.id === atual.id}
            aria-controls={`painel-${s.id}`}
            onClick={() => setAtivo(s.id)}
            className={clsx(
              "min-h-[32px] rounded-md px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-marca-verde",
              s.id === atual.id
                ? "bg-light-gray-1 text-light-black"
                : "text-light-gray-6 hover:text-light-black"
            )}
          >
            {s.id}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`painel-${atual.id}`}
        aria-labelledby={`separador-${atual.id}`}
        className="p-4 font-mono text-sm sm:p-5"
      >
        <p className="mb-4 text-light-gray-6">
          <span className="text-marca-verde">$</span> {atual.comando}
        </p>
        <ol className="space-y-3">
          {atual.linhas.map((l) => (
            <li key={l.chave} className="flex items-center gap-3">
              <span className="w-12 shrink-0 text-light-gray-5">
                {l.prefixo}
              </span>
              {l.avatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={l.avatar}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 shrink-0 rounded-full border border-light-gray-2"
                />
              )}
              <span className="min-w-0 flex-1 truncate text-light-black">
                {l.texto}
              </span>
              {l.valor && (
                <span className="tabular-nums text-marca-verde">{l.valor}</span>
              )}
            </li>
          ))}
        </ol>
        <Link
          href={atual.ligacao.href}
          className="mt-4 inline-block text-marca-verde hover:underline"
        >
          → {atual.ligacao.texto}
        </Link>
      </div>
    </div>
  );
}
