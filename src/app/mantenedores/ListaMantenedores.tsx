"use client";

import { SearchIcon } from "@primer/octicons-react";
import clsx from "clsx";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useFiltrosNoUrl } from "@/lib/filtros-url";
import { caminhoMantenedor, normalizar } from "@/lib/formatar";
import type { Mantenedor } from "@/lib/mantenedores";

const campoClassName =
  "min-h-[44px] w-full rounded-lg border border-light-gray-3 bg-white px-3 py-2 text-sm focus:border-marca-verde focus:outline-none focus:ring-2 focus:ring-marca-verde/30 sm:text-base";

export function ListaMantenedores({
  mantenedores,
}: {
  mantenedores: Mantenedor[];
}) {
  const [pesquisa, setPesquisa] = useState("");
  useFiltrosNoUrl({ q: [pesquisa, setPesquisa] });

  const visiveis = useMemo(() => {
    const termo = normalizar(pesquisa.trim());

    const filtrados = mantenedores.filter((m) => {
      if (!termo) return true;
      return normalizar(
        [
          m.nome,
          m.login,
          m.bio,
          m.localizacao,
          m.empresa,
          ...m.projetos.map((p) => p.repositorio),
        ]
          .filter(Boolean)
          .join(" ")
      ).includes(termo);
    });

    return [...filtrados].sort((a, b) => b.estrelas - a.estrelas);
  }, [mantenedores, pesquisa]);

  return (
    <div>
      <label className="relative mb-6 block">
        <span className="sr-only">Procurar pessoas</span>
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 fill-light-gray-5" />
        <input
          type="search"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          placeholder="Procurar por nome, cidade ou projeto"
          className={clsx(campoClassName, "pl-9")}
        />
      </label>

      <p className="sr-only" aria-live="polite">
        {visiveis.length === 1 ? "1 pessoa" : `${visiveis.length} pessoas`}
      </p>

      {visiveis.length === 0 ? (
        <p className="rounded-xl border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
          Ninguém corresponde à pesquisa.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {visiveis.map((m) => (
            <li key={m.login} className="min-w-0">
              <Link
                href={caminhoMantenedor(m.login)}
                className="flex h-full flex-col items-center gap-3 rounded-xl border border-light-gray-2 bg-white/60 px-4 py-7 text-center transition hover:border-light-gray-3 hover:bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.avatar}
                  alt=""
                  width={72}
                  height={72}
                  loading="lazy"
                  className="h-[72px] w-[72px] rounded-full border border-light-gray-2 ring-4 ring-light-gray-0"
                />
                <span className="w-full truncate font-bold">{m.nome}</span>
                {m.projetos.length > 0 && (
                  <span className="w-full truncate font-mono text-xs text-marca-verde">
                    {m.projetos.length === 1
                      ? m.projetos[0].nome
                      : `${m.projetos.length} projetos`}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
