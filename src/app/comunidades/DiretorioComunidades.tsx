"use client";

import {
  GlobeIcon,
  LinkExternalIcon,
  LocationIcon,
  MarkGithubIcon,
  SearchIcon,
} from "@primer/octicons-react";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { useFiltrosNoUrl } from "@/lib/filtros-url";
import type { Comunidade } from "@/lib/comunidades";
import { normalizar } from "@/lib/formatar";

const NACIONAL = "__nacional__";

const campoClassName =
  "w-full rounded border border-light-gray-3 bg-white px-3 py-2 text-sm focus:border-marca-verde focus:outline-none focus:ring-2 focus:ring-marca-verde/30 sm:text-base";

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

  const grupos = categorias
    .map((cat) => [cat, visiveis.filter((c) => c.categoria === cat)] as const)
    .filter(([, lista]) => lista.length > 0);

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="relative">
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

        <label>
          <span className="sr-only">Filtrar por cidade</span>
          <select
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className={campoClassName}
          >
            <option value="">Todas as cidades</option>
            <option value={NACIONAL}>Nacionais e online</option>
            {cidades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mb-4 text-sm text-light-gray-6" aria-live="polite">
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
              <h2 className="mb-3 text-lg font-bold sm:text-xl">{cat}</h2>
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
    <li className="flex flex-col rounded-xl border border-light-gray-2 bg-white/60 p-4">
      <a
        href={c.site}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-1 flex items-center gap-1.5 break-words font-bold hover:underline focus:underline"
      >
        {c.nome}
        <LinkExternalIcon size={12} className="shrink-0 fill-light-gray-5" />
      </a>

      <p className="mb-3 flex-1 text-sm text-light-gray-8 sm:text-base">
        {c.descricao}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-light-gray-6">
        <span className="flex items-center gap-1">
          {c.cidade ? (
            <LocationIcon className="fill-light-gray-6" />
          ) : (
            <GlobeIcon className="fill-light-gray-6" />
          )}
          {c.cidade ?? "Nacional e online"}
        </span>
        {c.github && (
          <a
            href={`https://github.com/${c.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-medium text-marca-verde hover:underline focus:underline"
          >
            <MarkGithubIcon className="fill-marca-verde" />
            {c.github}
          </a>
        )}
      </div>
    </li>
  );
}
