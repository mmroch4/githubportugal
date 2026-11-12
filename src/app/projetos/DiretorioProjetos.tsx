"use client";

import {
  ArchiveIcon,
  LinkExternalIcon,
  RepoForkedIcon,
  SearchIcon,
  StarIcon,
} from "@primer/octicons-react";
import clsx from "clsx";
import { useMemo, useState } from "react";
import type { Projeto } from "@/lib/projetos";

type Ordenacao = "estrelas" | "atividade" | "nome";

const formatoNumero = new Intl.NumberFormat("pt-PT", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatoRelativo = new Intl.RelativeTimeFormat("pt-PT", {
  numeric: "auto",
});

/** Data relativa calculada em relação a `referencia`, para o servidor e o browser darem o mesmo texto. */
function tempoDesde(data: string, referencia: string) {
  const dias = Math.round(
    (new Date(data).getTime() - new Date(referencia).getTime()) / 86_400_000
  );
  if (dias > -1) return "hoje";
  if (dias > -30) return formatoRelativo.format(dias, "day");
  if (dias > -365)
    return formatoRelativo.format(Math.round(dias / 30), "month");
  return formatoRelativo.format(Math.round(dias / 365), "year");
}

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const campoClassName =
  "w-full rounded border border-light-gray-3 bg-white px-3 py-2 text-sm focus:border-light-blue-5 focus:outline-none focus:ring-2 focus:ring-light-blue-1 sm:text-base";

export function DiretorioProjetos({
  projetos,
  categorias,
  atualizadoEm,
}: {
  projetos: Projeto[];
  categorias: string[];
  atualizadoEm: string;
}) {
  const [pesquisa, setPesquisa] = useState("");
  const [categoria, setCategoria] = useState("");
  const [linguagem, setLinguagem] = useState("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("estrelas");

  const linguagens = useMemo(
    () =>
      Array.from(
        new Set(projetos.map((p) => p.linguagem).filter(Boolean) as string[])
      ).sort((a, b) => a.localeCompare(b, "pt-PT")),
    [projetos]
  );

  const categoriasUsadas = useMemo(
    () => categorias.filter((c) => projetos.some((p) => p.categoria === c)),
    [categorias, projetos]
  );

  const visiveis = useMemo(() => {
    const termo = normalizar(pesquisa.trim());

    const filtrados = projetos.filter((p) => {
      if (categoria && p.categoria !== categoria) return false;
      if (linguagem && p.linguagem !== linguagem) return false;
      if (!termo) return true;
      return normalizar(
        `${p.repositorio} ${p.descricao} ${p.linguagem ?? ""} ${p.categoria}`
      ).includes(termo);
    });

    return [...filtrados].sort((a, b) => {
      if (ordenacao === "nome") {
        return a.nome.localeCompare(b.nome, "pt-PT");
      }
      if (ordenacao === "atividade") {
        return (
          new Date(b.ultimaAtividade ?? 0).getTime() -
          new Date(a.ultimaAtividade ?? 0).getTime()
        );
      }
      return (b.estrelas ?? -1) - (a.estrelas ?? -1);
    });
  }, [projetos, pesquisa, categoria, linguagem, ordenacao]);

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Pesquisar projetos</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 fill-light-gray-5" />
          <input
            type="search"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Pesquisar projetos"
            className={clsx(campoClassName, "pl-9")}
          />
        </label>

        <label>
          <span className="sr-only">Filtrar por categoria</span>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={campoClassName}
          >
            <option value="">Todas as categorias</option>
            {categoriasUsadas.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Filtrar por linguagem</span>
          <select
            value={linguagem}
            onChange={(e) => setLinguagem(e.target.value)}
            className={campoClassName}
          >
            <option value="">Todas as linguagens</option>
            {linguagens.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Ordenar</span>
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
            className={campoClassName}
          >
            <option value="estrelas">Mais estrelas</option>
            <option value="atividade">Atividade recente</option>
            <option value="nome">Nome (A-Z)</option>
          </select>
        </label>
      </div>

      <p className="mb-4 text-sm text-light-gray-6" aria-live="polite">
        {visiveis.length === 1 ? "1 projeto" : `${visiveis.length} projetos`}
      </p>

      {visiveis.length === 0 ? (
        <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
          Nenhum projeto corresponde à pesquisa.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visiveis.map((p) => (
            <li
              key={p.repositorio}
              className="flex flex-col rounded-md border border-light-gray-2 bg-white p-4"
            >
              <div className="mb-2 flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.avatar}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  className="h-10 w-10 shrink-0 rounded-md border border-light-gray-2"
                />
                <div className="min-w-0 flex-1">
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block break-words font-bold hover:underline focus:underline"
                  >
                    <span className="font-normal text-light-gray-6">
                      {p.dono}/
                    </span>
                    {p.nome}
                  </a>
                  <span className="text-xs text-light-gray-6">
                    {p.categoria}
                  </span>
                </div>
                {p.arquivado && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full border border-light-yellow-2 bg-light-yellow-0 px-2 py-0.5 text-xs font-medium text-light-yellow-8">
                    <ArchiveIcon size={12} />
                    Arquivado
                  </span>
                )}
              </div>

              <p className="mb-3 flex-1 text-sm text-light-gray-8 sm:text-base">
                {p.descricao}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-light-gray-6">
                {p.linguagem && (
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="h-3 w-3 rounded-full border border-light-gray-2"
                      style={{ backgroundColor: p.corLinguagem ?? undefined }}
                    />
                    {p.linguagem}
                  </span>
                )}
                {p.estrelas !== null && (
                  <span
                    className="flex items-center gap-1"
                    title={`${p.estrelas} estrelas`}
                  >
                    <StarIcon className="fill-light-gray-6" />
                    {formatoNumero.format(p.estrelas)}
                    <span className="sr-only">estrelas</span>
                  </span>
                )}
                {p.forks !== null && (
                  <span
                    className="flex items-center gap-1"
                    title={`${p.forks} forks`}
                  >
                    <RepoForkedIcon className="fill-light-gray-6" />
                    {formatoNumero.format(p.forks)}
                    <span className="sr-only">forks</span>
                  </span>
                )}
                {p.ultimaAtividade && (
                  <span>
                    Atualizado {tempoDesde(p.ultimaAtividade, atualizadoEm)}
                  </span>
                )}
                {p.site && (
                  <a
                    href={p.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-1 font-medium text-light-blue-6 hover:underline focus:underline"
                  >
                    Site
                    <LinkExternalIcon size={12} />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
