"use client";

import {
  BriefcaseIcon,
  LinkExternalIcon,
  LocationIcon,
  MarkGithubIcon,
  RepoIcon,
  SearchIcon,
  StarIcon,
} from "@primer/octicons-react";
import clsx from "clsx";
import { useMemo, useState } from "react";
import type { Empresa } from "@/lib/empresas";
import { formatoNumero, normalizar } from "@/lib/formatar";

const campoClassName =
  "w-full rounded border border-light-gray-3 bg-white px-3 py-2 text-sm focus:border-light-blue-5 focus:outline-none focus:ring-2 focus:ring-light-blue-1 sm:text-base";

export function DiretorioEmpresas({
  empresas,
  setores,
}: {
  empresas: Empresa[];
  setores: string[];
}) {
  const [pesquisa, setPesquisa] = useState("");
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

  const grupos = setores
    .map((s) => [s, visiveis.filter((e) => e.setor === s)] as const)
    .filter(([, lista]) => lista.length > 0);

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="relative">
          <span className="sr-only">Pesquisar empresas</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 fill-light-gray-5" />
          <input
            type="search"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Pesquisar empresas"
            className={clsx(campoClassName, "pl-9")}
          />
        </label>

        <label>
          <span className="sr-only">Filtrar por setor</span>
          <select
            value={setor}
            onChange={(e) => setSetor(e.target.value)}
            className={campoClassName}
          >
            <option value="">Todos os setores</option>
            {setores
              .filter((s) => empresas.some((e) => e.setor === s))
              .map((s) => (
                <option key={s} value={s}>
                  {s}
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
            {cidades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-light-gray-6" aria-live="polite">
          {visiveis.length === 1 ? "1 empresa" : `${visiveis.length} empresas`}
        </p>
        {algumaComCarreiras && (
          <label className="flex items-center gap-2 text-sm text-light-gray-8">
            <input
              type="checkbox"
              checked={soComCarreiras}
              onChange={(e) => setSoComCarreiras(e.target.checked)}
              className="h-4 w-4"
            />
            Só empresas com página de carreiras
          </label>
        )}
      </div>

      {grupos.length === 0 ? (
        <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
          Nenhuma empresa corresponde à pesquisa.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {grupos.map(([s, lista]) => (
            <section key={s}>
              <h2 className="mb-3 text-lg font-bold sm:text-xl">{s}</h2>
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {lista.map((e) => (
                  <CartaoEmpresa key={e.github} empresa={e} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function CartaoEmpresa({ empresa: e }: { empresa: Empresa }) {
  const urlGitHub = `https://github.com/${e.github}`;

  return (
    <li className="flex flex-col rounded-md border border-light-gray-2 bg-white p-4">
      <div className="mb-2 flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={e.avatar}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          className="h-10 w-10 shrink-0 rounded-md border border-light-gray-2"
        />
        <div className="min-w-0 flex-1">
          {e.site ? (
            <a
              href={e.site}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 break-words font-bold hover:underline focus:underline"
            >
              {e.nome}
              <LinkExternalIcon
                size={12}
                className="shrink-0 fill-light-gray-5"
              />
            </a>
          ) : (
            <span className="block break-words font-bold">{e.nome}</span>
          )}
          <span className="flex items-center gap-1 text-xs text-light-gray-6">
            <LocationIcon size={12} className="fill-light-gray-6" />
            {e.cidades.join(", ")}
          </span>
        </div>
      </div>

      <p className="mb-3 text-sm text-light-gray-8 sm:text-base">
        {e.descricao}
      </p>

      {e.destaques.length > 0 && (
        <div className="mb-3">
          <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-light-gray-6">
            Em destaque no GitHub
          </h3>
          <ul className="flex flex-col gap-1">
            {e.destaques.map((r) => (
              <li
                key={r.nome}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={r.descricao ?? undefined}
                  className="flex min-w-0 items-center gap-1.5 font-medium text-light-blue-6 hover:underline focus:underline"
                >
                  <RepoIcon className="shrink-0 fill-light-gray-5" />
                  <span className="truncate">{r.nome}</span>
                </a>
                <span className="flex shrink-0 items-center gap-3 text-light-gray-6">
                  {r.linguagem && (
                    <span className="hidden items-center gap-1 sm:flex">
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: r.corLinguagem ?? "#8c959f",
                        }}
                      />
                      {r.linguagem}
                    </span>
                  )}
                  <span
                    className="flex items-center gap-1"
                    title={`${r.estrelas} estrelas`}
                  >
                    <StarIcon size={14} className="fill-light-gray-6" />
                    {formatoNumero.format(r.estrelas)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {e.projetosNoDiretorio.length > 0 && (
        <p className="mb-3 text-sm text-light-gray-7">
          No diretório de projetos:{" "}
          {e.projetosNoDiretorio.map((p, i) => (
            <span key={p.repositorio}>
              {i > 0 && ", "}
              <a
                href={`https://github.com/${p.repositorio}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-light-blue-6 hover:underline focus:underline"
              >
                {p.nome}
              </a>
            </span>
          ))}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-light-gray-6">
        <a
          href={urlGitHub}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 font-medium text-light-blue-6 hover:underline focus:underline"
        >
          <MarkGithubIcon className="fill-light-blue-6" />
          {e.github}
        </a>
        {e.repositoriosPublicos !== null && (
          <a
            href={`https://github.com/orgs/${e.github}/repositories?type=source`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline focus:underline"
          >
            <RepoIcon className="fill-light-gray-6" />
            {e.repositoriosPublicos === 1
              ? "1 repositório público"
              : `${formatoNumero.format(
                  e.repositoriosPublicos
                )} repositórios públicos`}
          </a>
        )}
        {e.carreiras && (
          <a
            href={e.carreiras}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-medium text-light-blue-6 hover:underline focus:underline"
          >
            <BriefcaseIcon className="fill-light-blue-6" />
            Carreiras
          </a>
        )}
      </div>
    </li>
  );
}
