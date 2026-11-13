"use client";

import {
  BriefcaseIcon,
  RepoIcon,
  SearchIcon,
  StarIcon,
} from "@primer/octicons-react";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { useFiltrosNoUrl } from "@/lib/filtros-url";
import type { Empresa } from "@/lib/empresas";
import { formatoNumero, normalizar } from "@/lib/formatar";

const campoClassName =
  "min-h-[44px] w-full rounded-lg border border-light-gray-3 bg-white px-3 py-2 text-sm focus:border-marca-verde focus:outline-none focus:ring-2 focus:ring-marca-verde/30 sm:text-base";

export function DiretorioEmpresas({
  empresas,
  setores,
}: {
  empresas: Empresa[];
  setores: string[];
}) {
  const [pesquisa, setPesquisa] = useState("");
  useFiltrosNoUrl({ q: [pesquisa, setPesquisa] });
  const [setor, setSetor] = useState("");
  const [cidade, setCidade] = useState("");
  const [soComCarreiras, setSoComCarreiras] = useState(false);

  const cidades = useMemo(
    () =>
      Array.from(new Set(empresas.flatMap((e) => e.cidades))).sort((a, b) =>
        a.localeCompare(b, "pt-PT")
      ),
    [empresas]
  );
  const algumaComCarreiras = empresas.some((e) => e.carreiras);

  const visiveis = useMemo(() => {
    const termo = normalizar(pesquisa.trim());
    return empresas.filter((e) => {
      if (setor && e.setor !== setor) return false;
      if (cidade && !e.cidades.includes(cidade)) return false;
      if (soComCarreiras && !e.carreiras) return false;
      if (!termo) return true;
      return normalizar(
        [
          e.nome,
          e.github,
          e.descricao,
          e.setor,
          ...e.cidades,
          ...e.destaques.map((r) => `${r.nome} ${r.linguagem ?? ""}`),
        ].join(" ")
      ).includes(termo);
    });
  }, [empresas, pesquisa, setor, cidade, soComCarreiras]);

  const chip = (ativo: boolean) =>
    clsx(
      "inline-flex min-h-[36px] items-center gap-2 rounded-full border px-3.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-marca-verde",
      ativo
        ? "border-marca-verde bg-marca-verde/10"
        : "border-light-gray-3 hover:bg-light-gray-1"
    );

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="relative sm:col-span-2">
          <span className="sr-only">Procurar empresas</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 fill-light-gray-5" />
          <input
            type="search"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Empresa, repositório ou linguagem"
            className={clsx(campoClassName, "pl-9")}
          />
        </label>

        <label>
          <span className="sr-only">Filtrar por cidade</span>
          <select
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className={campoClassName}
          >
            <option value="">Todas as cidades</option>
            {cidades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        role="group"
        aria-label="Filtrar por setor"
        className="mb-6 flex flex-wrap gap-2"
      >
        <button
          type="button"
          aria-pressed={setor === ""}
          onClick={() => setSetor("")}
          className={chip(setor === "")}
        >
          Todas
          <span className="font-mono text-light-gray-6">{empresas.length}</span>
        </button>
        {setores
          .filter((x) => empresas.some((e) => e.setor === x))
          .map((x) => (
            <button
              key={x}
              type="button"
              aria-pressed={setor === x}
              onClick={() => setSetor(setor === x ? "" : x)}
              className={chip(setor === x)}
            >
              {x}
              <span className="font-mono text-light-gray-6">
                {empresas.filter((e) => e.setor === x).length}
              </span>
            </button>
          ))}
        {algumaComCarreiras && (
          <button
            type="button"
            aria-pressed={soComCarreiras}
            onClick={() => setSoComCarreiras(!soComCarreiras)}
            className={chip(soComCarreiras)}
          >
            <BriefcaseIcon className="fill-current" />
            Com carreiras
          </button>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {visiveis.length === 1 ? "1 empresa" : `${visiveis.length} empresas`}
      </p>

      {visiveis.length === 0 ? (
        <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
          Nenhuma empresa corresponde à pesquisa.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-2">
          {visiveis.map((e) => (
            <LinhaEmpresa key={e.github} empresa={e} />
          ))}
        </ul>
      )}
    </div>
  );
}

function LinhaEmpresa({ empresa: e }: { empresa: Empresa }) {
  const destaque = e.destaques[0];

  return (
    <li className="flex min-w-0 items-center gap-4 rounded-xl border border-light-gray-2 bg-white/60 p-3 pr-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={e.avatar}
        alt=""
        width={44}
        height={44}
        loading="lazy"
        className="h-11 w-11 shrink-0 rounded-lg border border-light-gray-2"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex min-w-0 items-center gap-2">
          <a
            href={e.site ?? `https://github.com/${e.github}`}
            target="_blank"
            rel="noopener noreferrer"
            title={e.descricao}
            className="truncate font-semibold hover:underline focus:underline"
          >
            {e.nome}
          </a>
          <span className="hidden shrink-0 rounded-full border border-light-gray-3 px-2 font-mono text-[11px] text-light-gray-6 sm:inline">
            {e.setor}
          </span>
        </span>
        <span className="truncate font-mono text-xs text-light-gray-6">
          {e.cidades.join(" · ")}
          {destaque && (
            <>
              {" · "}
              <a
                href={destaque.url}
                target="_blank"
                rel="noopener noreferrer"
                title={destaque.descricao ?? undefined}
                className="text-marca-verde hover:underline"
              >
                {destaque.nome}
              </a>{" "}
              <StarIcon size={12} className="fill-light-gray-6" />{" "}
              {formatoNumero.format(destaque.estrelas)}
            </>
          )}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3 font-mono text-sm">
        {e.repositoriosPublicos !== null && (
          <a
            href={`https://github.com/orgs/${e.github}/repositories?type=source`}
            target="_blank"
            rel="noopener noreferrer"
            title="Repositórios públicos"
            className="hidden items-center gap-1 text-light-gray-6 hover:text-marca-verde sm:flex"
          >
            <RepoIcon className="fill-current" />
            {formatoNumero.format(e.repositoriosPublicos)}
          </a>
        )}
        {e.carreiras && (
          <a
            href={e.carreiras}
            target="_blank"
            rel="noopener noreferrer"
            title="Carreiras"
            className="flex items-center gap-1 text-marca-verde hover:underline"
          >
            <BriefcaseIcon className="fill-current" />
            <span className="hidden sm:inline">vagas</span>
          </a>
        )}
      </div>
    </li>
  );
}
