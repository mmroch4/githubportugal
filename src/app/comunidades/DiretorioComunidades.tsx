"use client";

import { SearchIcon } from "@primer/octicons-react";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { useFiltrosNoUrl } from "@/lib/filtros-url";
import type { Comunidade } from "@/lib/comunidades";
import { normalizar } from "@/lib/formatar";

const NACIONAL = "__nacional__";

const campoClassName =
  "min-h-[44px] w-full rounded-lg border border-light-gray-3 bg-white px-3 py-2 text-sm focus:border-marca-verde focus:outline-none focus:ring-2 focus:ring-marca-verde/30 sm:text-base";

export function DiretorioComunidades({
  comunidades,
  categorias,
}: {
  comunidades: Comunidade[];
  categorias: string[];
}) {
  const [pesquisa, setPesquisa] = useState("");
  useFiltrosNoUrl({ q: [pesquisa, setPesquisa] });
  const [categoria, setCategoria] = useState("");
  const [cidade, setCidade] = useState("");

  const cidades = useMemo(
    () =>
      Array.from(
        new Set(comunidades.map((c) => c.cidade).filter(Boolean) as string[])
      ).sort((a, b) => a.localeCompare(b, "pt-PT")),
    [comunidades]
  );

  const visiveis = useMemo(() => {
    const termo = normalizar(pesquisa.trim());
    return comunidades.filter((c) => {
      if (categoria && c.categoria !== categoria) return false;
      if (cidade === NACIONAL && c.cidade) return false;
      if (cidade && cidade !== NACIONAL && c.cidade !== cidade) return false;
      if (!termo) return true;
      return normalizar(
        `${c.nome} ${c.descricao} ${c.categoria} ${c.cidade ?? ""}`
      ).includes(termo);
    });
  }, [comunidades, pesquisa, categoria, cidade]);

  const contagemCidade = (c: string) =>
    comunidades.filter((x) => (c === NACIONAL ? !x.cidade : x.cidade === c))
      .length;

  const chip = (ativo: boolean) =>
    clsx(
      "inline-flex min-h-[36px] items-center gap-2 rounded-full border px-3.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-marca-verde",
      ativo
        ? "border-marca-verde bg-marca-verde/10"
        : "border-light-gray-3 hover:bg-light-gray-1"
    );

  const grupos = categorias
    .map((cat) => [cat, visiveis.filter((c) => c.categoria === cat)] as const)
    .filter(([, lista]) => lista.length > 0);

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="relative sm:col-span-2">
          <span className="sr-only">Pesquisar comunidades</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 fill-light-gray-5" />
          <input
            type="search"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Pesquisar comunidades"
            className={clsx(campoClassName, "pl-9")}
          />
        </label>

        <label>
          <span className="sr-only">Filtrar por tema</span>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={campoClassName}
          >
            <option value="">Todos os temas</option>
            {categorias
              .filter((cat) => comunidades.some((c) => c.categoria === cat))
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>
        </label>

      </div>

      <div
        role="group"
        aria-label="Filtrar por cidade"
        className="mb-6 flex flex-wrap gap-2"
      >
        <button
          type="button"
          aria-pressed={cidade === ""}
          onClick={() => setCidade("")}
          className={chip(cidade === "")}
        >
          Todas
          <span className="font-mono text-light-gray-6">
            {comunidades.length}
          </span>
        </button>
        {[...cidades, NACIONAL].map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={cidade === c}
            onClick={() => setCidade(cidade === c ? "" : c)}
            className={chip(cidade === c)}
          >
            {c === NACIONAL ? "Online" : c}
            <span className="font-mono text-light-gray-6">
              {contagemCidade(c)}
            </span>
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {visiveis.length === 1
          ? "1 comunidade"
          : `${visiveis.length} comunidades`}
      </p>

      {grupos.length === 0 ? (
        <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
          Nenhuma comunidade corresponde à pesquisa.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {grupos.map(([cat, lista]) => (
            <section key={cat}>
              <h2 className="mb-3 font-mono text-sm text-marca-verde">
                {`// ${cat.toLowerCase()}`}
              </h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {lista.map((c) => (
                  <CartaoComunidade key={c.nome} comunidade={c} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function CartaoComunidade({ comunidade: c }: { comunidade: Comunidade }) {
  return (
    <li className="min-w-0">
      <a
        href={c.site}
        target="_blank"
        rel="noopener noreferrer"
        title={c.descricao}
        className="flex h-full flex-col gap-2 rounded-xl border border-light-gray-2 bg-white/60 p-4 transition hover:bg-white"
      >
        <span className="truncate font-semibold">{c.nome}</span>
        <span className="font-mono text-xs text-light-gray-6">
          {c.cidade ?? "online"}
          {c.github && <span className="text-marca-verde"> · @{c.github}</span>}
        </span>
      </a>
    </li>
  );
}
