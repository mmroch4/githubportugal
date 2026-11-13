"use client";

import { SearchIcon } from "@primer/octicons-react";
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

type Props = {
  ranking: Ranking;
  /** Número de pessoas em cada zona, para os filtros. */
  contagens?: Partial<Record<Ambito, number>>;
};

const campoClassName =
  "min-h-[44px] w-full rounded-lg border border-light-gray-3 bg-white px-3 py-2 text-sm focus:border-marca-verde focus:outline-none focus:ring-2 focus:ring-marca-verde/30 sm:text-base";

const NOMES_METRICA: Record<Metrica, string> = {
  contribuicoes: "Contribuições públicas",
  seguidores: "Seguidores",
};

const NOMES_CURTOS: Record<Metrica, string> = {
  contribuicoes: "Contrib.",
  seguidores: "Seguid.",
};

const formatoInteiro = new Intl.NumberFormat("pt-PT", {
  useGrouping: "always",
});

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
  contagens = {},
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

  // As barras comparam cada pessoa com o 1.º lugar da lista.
  const lider = ranking.listas[ambito][metrica][0];
  const maximo = Math.max(1, lider ? ranking.pessoas[lider][metrica] : 1);

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
              "inline-flex min-h-[38px] items-center gap-2 rounded-full border px-4 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-marca-verde",
              ambito === a.id
                ? "border-marca-verde bg-marca-verde/10"
                : "border-light-gray-3 hover:bg-light-gray-1"
            )}
          >
            {a.nome}
            {contagens[a.id] !== undefined && (
              <span
                className={clsx(
                  "font-mono tabular-nums",
                  ambito === a.id ? "text-marca-verde" : "text-light-gray-6"
                )}
              >
                {formatoInteiro.format(contagens[a.id]!)}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="relative sm:col-span-2">
          <span className="sr-only">Procurar no ranking</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 fill-light-gray-5" />
          <input
            type="search"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Onde estou eu? Nome ou @utilizador"
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
        <Podio podio={podio} metrica={metrica} maximo={maximo} />
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
            <thead className="border-b border-light-gray-2 font-mono text-xs lowercase text-light-gray-6">
              <tr>
                <th
                  scope="col"
                  className="w-12 px-2 py-3 text-right font-normal sm:px-3"
                >
                  #
                </th>
                <th scope="col" className="w-full px-3 py-3 font-normal">
                  Pessoa
                </th>
                <th
                  scope="col"
                  className="w-28 px-3 py-3 text-right font-normal sm:w-64"
                >
                  <span className="sm:hidden" aria-hidden>
                    {NOMES_CURTOS[metrica]}
                  </span>
                  <span className="sr-only sm:not-sr-only">
                    {NOMES_METRICA[metrica]}
                  </span>
                </th>
                <th
                  scope="col"
                  className="hidden w-32 px-3 py-3 text-right font-normal sm:table-cell"
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
                          className="block truncate font-semibold hover:underline focus:underline"
                        >
                          {pessoa.nome ?? pessoa.login}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-3">
                      <span className="shrink-0 text-right font-mono font-semibold tabular-nums sm:w-[4.5rem]">
                        {formatoInteiro.format(pessoa[metrica])}
                      </span>
                      <span
                        aria-hidden="true"
                        className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-light-gray-1 sm:block"
                      >
                        <span
                          className="block h-full rounded-full bg-marca-verde/70"
                          style={{
                            width: `${Math.round(
                              (pessoa[metrica] / maximo) * 100
                            )}%`,
                          }}
                        />
                      </span>
                    </div>
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

/** Os três primeiros, em cartões compactos lado a lado. */
function Podio({
  podio,
  metrica,
  maximo,
}: {
  podio: Linha[];
  metrica: Metrica;
  maximo: number;
}) {
  return (
    <ol aria-label="Pódio" className="mb-4 grid gap-3 sm:grid-cols-3">
      {podio.map(({ posicao, pessoa }) => {
        const primeiro = posicao === 1;
        return (
          <li key={pessoa.login} className="min-w-0">
            <a
              href={`https://github.com/${pessoa.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                "flex h-full flex-col gap-4 rounded-xl border bg-white/60 p-5 hover:bg-white",
                primeiro ? "border-marca-verde/60" : "border-light-gray-2"
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={clsx(
                    "font-mono text-3xl font-bold",
                    primeiro ? "text-marca-verde" : "text-light-gray-7"
                  )}
                >
                  {String(posicao).padStart(2, "0")}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pessoa.avatar}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 rounded-full border border-light-gray-2"
                />
                <span className="min-w-0 truncate font-bold">
                  {pessoa.nome ?? pessoa.login}
                </span>
              </span>
              <span className="mt-auto flex flex-col gap-2">
                <span className="font-mono text-2xl font-bold tabular-nums">
                  {formatoInteiro.format(pessoa[metrica])}
                  <span className="sr-only">
                    {" "}
                    {NOMES_METRICA[metrica].toLowerCase()}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="h-1.5 overflow-hidden rounded-full bg-light-gray-1"
                >
                  <span
                    className="block h-full rounded-full bg-marca-verde"
                    style={{
                      width: `${Math.round((pessoa[metrica] / maximo) * 100)}%`,
                    }}
                  />
                </span>
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}
