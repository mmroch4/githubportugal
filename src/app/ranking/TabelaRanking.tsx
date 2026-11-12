"use client";

import { LocationIcon, SearchIcon } from "@primer/octicons-react";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { formatoNumero, normalizar } from "@/lib/formatar";
import {
  AMBITOS,
  type Ambito,
  type Metrica,
  type Ranking,
} from "@/lib/ranking-tipos";

type Props = { ranking: Ranking };

const campoClassName =
  "w-full rounded border border-light-gray-3 bg-white px-3 py-2 text-sm focus:border-marca-verde focus:outline-none focus:ring-2 focus:ring-marca-verde/30 sm:text-base";

const NOMES_METRICA: Record<Metrica, string> = {
  contribuicoes: "Contribuições públicas",
  seguidores: "Seguidores",
};

const NOMES_CURTOS: Record<Metrica, string> = {
  contribuicoes: "Contrib.",
  seguidores: "Seguid.",
};

const formatoInteiro = new Intl.NumberFormat("pt-PT");

function eAmbito(valor: string): valor is Ambito {
  return AMBITOS.some((a) => a.id === valor);
}

/** Lê `?cidade=` e `?ordem=` do endereço, para se poder partilhar uma lista. */
export function TabelaRankingComParametros(props: Props) {
  const parametros = useSearchParams();
  const cidade = parametros.get("cidade") ?? "";
  const ordem = parametros.get("ordem") ?? "";

  return (
    <TabelaRanking
      {...props}
      ambitoInicial={eAmbito(cidade) ? cidade : "pais"}
      metricaInicial={ordem === "seguidores" ? "seguidores" : "contribuicoes"}
    />
  );
}

export function TabelaRanking({
  ranking,
  ambitoInicial = "pais",
  metricaInicial = "contribuicoes",
}: Props & { ambitoInicial?: Ambito; metricaInicial?: Metrica }) {
  const [ambito, setAmbito] = useState<Ambito>(ambitoInicial);
  const [metrica, setMetrica] = useState<Metrica>(metricaInicial);
  const [pesquisa, setPesquisa] = useState("");

  const linhas = useMemo(() => {
    const termo = normalizar(pesquisa.trim());
    return ranking.listas[ambito][metrica]
      .map((login, i) => ({ posicao: i + 1, pessoa: ranking.pessoas[login] }))
      .filter(({ pessoa }) => {
        if (!termo) return true;
        return normalizar(
          [pessoa.nome, pessoa.login, pessoa.localizacao]
            .filter(Boolean)
            .join(" ")
        ).includes(termo);
      });
  }, [ranking, ambito, metrica, pesquisa]);

  // O pódio só aparece na lista completa (sem pesquisa) e com pelo menos 3 pessoas.
  const podio =
    !pesquisa.trim() && linhas.length >= 3 ? linhas.slice(0, 3) : [];
  const restantes = podio.length ? linhas.slice(3) : linhas;

  const outraMetrica: Metrica =
    metrica === "contribuicoes" ? "seguidores" : "contribuicoes";

  return (
    <div>
      <div
        role="tablist"
        aria-label="Zona do ranking"
        className="mb-4 flex flex-wrap gap-2"
      >
        {AMBITOS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={ambito === a.id}
            onClick={() => setAmbito(a.id)}
            className={clsx(
              "rounded-full border px-3 py-1 text-sm font-bold sm:text-base",
              ambito === a.id
                ? "border-light-black bg-light-black text-light-gray-0"
                : "border-light-gray-3 bg-white hover:bg-light-gray-1"
            )}
          >
            {a.nome}
          </button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="relative sm:col-span-2">
          <span className="sr-only">Pesquisar no ranking</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 fill-light-gray-5" />
          <input
            type="search"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Procurar por nome ou utilizador"
            className={clsx(campoClassName, "pl-9")}
          />
        </label>

        <label>
          <span className="sr-only">Ordenar por</span>
          <select
            value={metrica}
            onChange={(e) => setMetrica(e.target.value as Metrica)}
            className={campoClassName}
          >
            <option value="contribuicoes">Mais contribuições públicas</option>
            <option value="seguidores">Mais seguidores</option>
          </select>
        </label>
      </div>

      {podio.length > 0 && (
        <Podio podio={podio} metrica={metrica} outraMetrica={outraMetrica} />
      )}

      {linhas.length === 0 ? (
        <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
          {pesquisa
            ? "Ninguém nesta lista corresponde à pesquisa."
            : "Ainda não há ninguém nesta lista."}
        </p>
      ) : restantes.length === 0 ? null : (
        <div className="overflow-hidden rounded-xl border border-light-gray-2 bg-white/60">
          <table className="w-full table-fixed text-left text-sm sm:text-base">
            <caption className="sr-only">
              Ranking de {AMBITOS.find((a) => a.id === ambito)?.nome} por{" "}
              {NOMES_METRICA[metrica].toLowerCase()}
            </caption>
            <thead className="border-b border-light-gray-2 bg-light-gray-0 text-xs uppercase text-light-gray-6">
              <tr>
                <th scope="col" className="w-12 px-2 py-2 text-right sm:px-3">
                  #
                </th>
                <th scope="col" className="w-full px-3 py-2">
                  Pessoa
                </th>
                <th scope="col" className="w-24 px-3 py-2 text-right sm:w-56">
                  <span className="sm:hidden" aria-hidden>
                    {NOMES_CURTOS[metrica]}
                  </span>
                  <span className="sr-only sm:not-sr-only">
                    {NOMES_METRICA[metrica]}
                  </span>
                </th>
                <th
                  scope="col"
                  className="hidden w-32 px-3 py-2 text-right sm:table-cell"
                >
                  {NOMES_METRICA[outraMetrica]}
                </th>
              </tr>
            </thead>
            <tbody>
              {restantes.map(({ posicao, pessoa }) => (
                <tr
                  key={pessoa.login}
                  className="border-b border-light-gray-1 last:border-0"
                >
                  <td className="px-2 py-2 text-right font-mono tabular-nums text-light-gray-5 sm:px-3">
                    {posicao}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex min-w-0 items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pessoa.avatar}
                        alt=""
                        width={40}
                        height={40}
                        loading="lazy"
                        className="h-10 w-10 shrink-0 rounded-full border border-light-gray-2"
                      />
                      <div className="min-w-0">
                        <a
                          href={`https://github.com/${pessoa.login}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate font-bold hover:underline focus:underline"
                        >
                          {pessoa.nome ?? pessoa.login}
                        </a>
                        <span className="flex flex-wrap items-center gap-x-2 text-xs text-light-gray-6 sm:text-sm">
                          <span className="truncate">@{pessoa.login}</span>
                          {pessoa.localizacao && (
                            <span className="hidden items-center gap-1 truncate md:flex">
                              <LocationIcon className="fill-light-gray-6" />
                              {pessoa.localizacao}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-3 py-2 text-right font-mono font-bold tabular-nums"
                    title={formatoInteiro.format(pessoa[metrica])}
                  >
                    {formatoInteiro.format(pessoa[metrica])}
                  </td>
                  <td
                    className="hidden px-3 py-2 text-right font-mono tabular-nums text-light-gray-6 sm:table-cell"
                    title={formatoInteiro.format(pessoa[outraMetrica])}
                  >
                    {formatoNumero.format(pessoa[outraMetrica])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type Linha = { posicao: number; pessoa: Ranking["pessoas"][string] };

/** Os três primeiros, em cartões: 2.º, 1.º e 3.º lado a lado em ecrãs largos. */
function Podio({
  podio,
  metrica,
  outraMetrica,
}: {
  podio: Linha[];
  metrica: Metrica;
  outraMetrica: Metrica;
}) {
  // Na grelha larga, o 1.º fica ao centro; no HTML mantém-se a ordem 1, 2, 3.
  const ordemVisual = ["sm:order-2", "sm:order-1", "sm:order-3"];
  return (
    <ol
      aria-label="Pódio"
      className="mb-4 grid gap-3 sm:grid-cols-3 sm:items-end"
    >
      {podio.map(({ posicao, pessoa }, i) => {
        const primeiro = posicao === 1;
        return (
          <li
            key={pessoa.login}
            className={clsx(
              "rounded-xl p-px",
              ordemVisual[i],
              primeiro
                ? "bg-gradient-to-b from-marca-verde to-marca-vermelho shadow-lg shadow-marca-verde/10"
                : "bg-light-gray-2"
            )}
          >
            <a
              href={`https://github.com/${pessoa.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                "flex items-center gap-4 rounded-[11px] bg-white p-4 hover:bg-light-gray-1 sm:flex-col sm:text-center",
                primeiro ? "sm:pb-8 sm:pt-6" : "sm:pb-5"
              )}
            >
              <span className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pessoa.avatar}
                  alt=""
                  width={80}
                  height={80}
                  className={clsx(
                    "rounded-full border border-light-gray-2",
                    primeiro
                      ? "h-16 w-16 sm:h-20 sm:w-20"
                      : "h-14 w-14 sm:h-16 sm:w-16"
                  )}
                />
                <span
                  className={clsx(
                    "absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white font-mono text-xs font-bold",
                    primeiro
                      ? "bg-gradient-to-br from-marca-verde to-marca-vermelho text-[#fff]"
                      : "bg-light-gray-2 text-light-black"
                  )}
                >
                  {posicao}
                </span>
              </span>
              <span className="min-w-0 flex-1 sm:w-full">
                <span className="block truncate font-bold">
                  {pessoa.nome ?? pessoa.login}
                </span>
                <span className="block truncate text-sm text-light-gray-6">
                  @{pessoa.login}
                </span>
                <span className="mt-2 block text-xl font-black tabular-nums sm:text-2xl">
                  {formatoInteiro.format(pessoa[metrica])}
                </span>
                <span className="block text-xs text-light-gray-6">
                  {NOMES_METRICA[metrica].toLowerCase()} ·{" "}
                  {formatoNumero.format(pessoa[outraMetrica])}{" "}
                  {NOMES_METRICA[outraMetrica].toLowerCase()}
                </span>
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}
