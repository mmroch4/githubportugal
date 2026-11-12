"use client";

import {
  LocationIcon,
  PeopleIcon,
  SearchIcon,
  StarIcon,
} from "@primer/octicons-react";
import clsx from "clsx";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useFiltrosNoUrl } from "@/lib/filtros-url";
import { caminhoMantenedor, formatoNumero, normalizar } from "@/lib/formatar";
import type { Mantenedor } from "@/lib/mantenedores";

type Ordenacao = "estrelas" | "seguidores" | "nome";

const campoClassName =
  "w-full rounded border border-light-gray-3 bg-white px-3 py-2 text-sm focus:border-marca-verde focus:outline-none focus:ring-2 focus:ring-marca-verde/30 sm:text-base";

const MAX_PROJETOS_NO_CARTAO = 3;

export function ListaMantenedores({
  mantenedores,
}: {
  mantenedores: Mantenedor[];
}) {
  const [pesquisa, setPesquisa] = useState("");
  useFiltrosNoUrl({ q: [pesquisa, setPesquisa] });
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("estrelas");

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

    return [...filtrados].sort((a, b) => {
      if (ordenacao === "nome") return a.nome.localeCompare(b.nome, "pt-PT");
      if (ordenacao === "seguidores")
        return (b.seguidores ?? -1) - (a.seguidores ?? -1);
      return b.estrelas - a.estrelas;
    });
  }, [mantenedores, pesquisa, ordenacao]);

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="relative sm:col-span-2">
          <span className="sr-only">Pesquisar mantenedores</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 fill-light-gray-5" />
          <input
            type="search"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Pesquisar por nome, cidade ou projeto"
            className={clsx(campoClassName, "pl-9")}
          />
        </label>

        <label>
          <span className="sr-only">Ordenar</span>
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
            className={campoClassName}
          >
            <option value="estrelas">Mais estrelas nos projetos</option>
            <option value="seguidores">Mais seguidores</option>
            <option value="nome">Nome (A-Z)</option>
          </select>
        </label>
      </div>

      <p className="mb-4 text-sm text-light-gray-6" aria-live="polite">
        {visiveis.length === 1
          ? "1 mantenedor"
          : `${visiveis.length} mantenedores`}
      </p>

      {visiveis.length === 0 ? (
        <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
          Nenhum mantenedor corresponde à pesquisa.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((m) => (
            <li
              key={m.login}
              className="relative flex flex-col rounded-xl border border-light-gray-2 bg-white/60 p-4 hover:border-light-gray-3"
            >
              <div className="mb-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.avatar}
                  alt=""
                  width={56}
                  height={56}
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-full border border-light-gray-2"
                />
                <div className="min-w-0">
                  <Link
                    href={caminhoMantenedor(m.login)}
                    className="block break-words font-bold after:absolute after:inset-0 hover:underline focus:underline"
                  >
                    {m.nome}
                  </Link>
                  <span className="block truncate text-sm text-light-gray-6">
                    @{m.login}
                  </span>
                </div>
              </div>

              {m.bio && (
                <p className="mb-3 line-clamp-3 text-sm text-light-gray-8">
                  {m.bio}
                </p>
              )}

              <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-light-gray-6">
                {m.localizacao && (
                  <span className="flex items-center gap-1">
                    <LocationIcon className="fill-light-gray-6" />
                    {m.localizacao}
                  </span>
                )}
                {m.seguidores !== null && (
                  <span
                    className="flex items-center gap-1"
                    title={`${m.seguidores} seguidores`}
                  >
                    <PeopleIcon className="fill-light-gray-6" />
                    {formatoNumero.format(m.seguidores)}
                    <span className="sr-only">seguidores</span>
                  </span>
                )}
                {m.estrelas > 0 && (
                  <span
                    className="flex items-center gap-1"
                    title={`${m.estrelas} estrelas nos projetos do diretório`}
                  >
                    <StarIcon className="fill-light-gray-6" />
                    {formatoNumero.format(m.estrelas)}
                    <span className="sr-only">
                      estrelas nos projetos do diretório
                    </span>
                  </span>
                )}
              </div>

              {m.projetos.length > 0 && (
                <ul className="mt-auto flex flex-wrap gap-1.5">
                  {m.projetos.slice(0, MAX_PROJETOS_NO_CARTAO).map((p) => (
                    <li
                      key={p.repositorio}
                      className="rounded-full bg-light-gray-1 px-2 py-0.5 text-xs font-medium text-light-gray-8"
                    >
                      {p.nome}
                    </li>
                  ))}
                  {m.projetos.length > MAX_PROJETOS_NO_CARTAO && (
                    <li className="rounded-full px-1 py-0.5 text-xs text-light-gray-6">
                      +{m.projetos.length - MAX_PROJETOS_NO_CARTAO}
                    </li>
                  )}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
