"use client";

import clsx from "clsx";
import { useId, useRef, useState } from "react";

/*
 * Gráficos simples em HTML e SVG, sem bibliotecas. As cores vêm das variáveis
 * --viz-* (src/app/globals.css), com valores próprios para o tema escuro. Todos
 * os gráficos mostram os valores ao passar o rato (ou ao tocar) e têm uma
 * tabela com os mesmos números para leitores de ecrã.
 */

export type Barra = { rotulo: string; valor: number; detalhe?: string };

const numero = new Intl.NumberFormat("pt-PT");
const percentagem = new Intl.NumberFormat("pt-PT", {
  style: "percent",
  maximumFractionDigits: 1,
});

/** Cabeçalho e moldura de um gráfico. */
export function Cartao({
  titulo,
  descricao,
  children,
  className,
}: {
  titulo: string;
  descricao?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx(
        "rounded-xl border border-light-gray-2 bg-white/60 p-4 sm:p-5",
        className
      )}
    >
      <h3 className="font-semibold">{titulo}</h3>
      {descricao && (
        <p className="mt-1 text-sm text-light-gray-6">{descricao}</p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Tabela com os mesmos valores do gráfico, só para leitores de ecrã. */
function TabelaAcessivel({
  titulo,
  colunas,
  linhas,
}: {
  titulo: string;
  colunas: string[];
  linhas: (string | number)[][];
}) {
  return (
    <div className="sr-only">
      <table>
        <caption>{titulo}</caption>
        <thead>
          <tr>
            {colunas.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={String(linha[0])}>
              {linha.map((celula, i) =>
                i === 0 ? (
                  <th key={i} scope="row">
                    {celula}
                  </th>
                ) : (
                  <td key={i}>
                    {typeof celula === "number"
                      ? numero.format(celula)
                      : celula}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Barras horizontais ordenadas, com o valor escrito no fim de cada barra. Ao
 * passar o rato, a linha fica destacada e aparece a percentagem do total.
 */
export function BarrasHorizontais({
  titulo,
  dados,
  unidade,
  mostrarPercentagem = true,
}: {
  titulo: string;
  dados: Barra[];
  /** Nome da medida, por exemplo "pessoas" ou "estrelas". */
  unidade: string;
  mostrarPercentagem?: boolean;
}) {
  const [ativa, setAtiva] = useState<number | null>(null);
  const maximo = Math.max(1, ...dados.map((d) => d.valor));
  const total = dados.reduce((t, d) => t + d.valor, 0);

  return (
    <div>
      <ul
        aria-hidden="true"
        className="flex flex-col gap-0.5"
        onMouseLeave={() => setAtiva(null)}
      >
        {dados.map((d, i) => {
          const largura = (d.valor / maximo) * 100;
          const destacada = ativa === i;
          return (
            <li
              key={d.rotulo}
              onMouseEnter={() => setAtiva(i)}
              onClick={() => setAtiva(destacada ? null : i)}
              className={clsx(
                "relative grid cursor-default grid-cols-[minmax(5rem,36%)_1fr_auto] items-center gap-3 rounded px-1 py-1 text-sm",
                destacada && "bg-light-gray-1"
              )}
            >
              <span className="truncate text-light-gray-7" title={d.rotulo}>
                {d.rotulo}
              </span>
              <span className="block min-w-0">
                <span
                  className="block h-3.5 rounded-r bg-marca-verde/80"
                  style={{ width: `max(2px, ${largura}%)` }}
                />
              </span>
              <span className="min-w-[2.5rem] text-right tabular-nums text-light-black">
                {numero.format(d.valor)}
              </span>
              {destacada && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute -top-9 right-1 z-10 whitespace-nowrap rounded border border-light-gray-2 bg-white px-2 py-1 text-xs shadow-md"
                >
                  <strong className="font-semibold">{d.rotulo}</strong>
                  {": "}
                  {numero.format(d.valor)} {unidade}
                  {mostrarPercentagem && total > 0 && (
                    <span className="text-light-gray-6">
                      {" "}
                      ({percentagem.format(d.valor / total)})
                    </span>
                  )}
                  {d.detalhe && (
                    <span className="text-light-gray-6"> · {d.detalhe}</span>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <TabelaAcessivel
        titulo={titulo}
        colunas={["", unidade]}
        linhas={dados.map((d) => [d.rotulo, d.valor])}
      />
    </div>
  );
}

/**
 * Colunas para valores ordenados (anos, escalões): eixo horizontal com os
 * rótulos e o valor por cima de cada coluna.
 */
export function Colunas({
  titulo,
  dados,
  unidade,
  rotuloEixo,
}: {
  titulo: string;
  dados: Barra[];
  unidade: string;
  /** Nome do eixo horizontal, por exemplo "Contribuições no último ano". */
  rotuloEixo?: string;
}) {
  const [ativa, setAtiva] = useState<number | null>(null);
  const maximo = Math.max(1, ...dados.map((d) => d.valor));
  const total = dados.reduce((t, d) => t + d.valor, 0);
  // Com muitas colunas, só alguns rótulos cabem no eixo.
  const passo = Math.ceil(dados.length / 8);

  return (
    <div>
      <div aria-hidden="true">
        <div
          className="flex h-44 items-end gap-0.5 border-b border-light-gray-3"
          onMouseLeave={() => setAtiva(null)}
        >
          {dados.map((d, i) => {
            const destacada = ativa === i;
            return (
              <div
                key={d.rotulo}
                onMouseEnter={() => setAtiva(i)}
                onClick={() => setAtiva(destacada ? null : i)}
                className={clsx(
                  "relative flex h-full flex-1 cursor-default flex-col items-center justify-end rounded-t",
                  destacada && "bg-light-gray-1"
                )}
              >
                <span className="mb-1 text-xs tabular-nums text-light-gray-7">
                  {dados.length <= 12 || destacada
                    ? numero.format(d.valor)
                    : ""}
                </span>
                <span
                  className="w-full max-w-[3rem] rounded-t bg-marca-verde/80"
                  style={{
                    height: `calc(${(d.valor / maximo) * 100}% - 1.25rem)`,
                    minHeight: d.valor > 0 ? 2 : 0,
                  }}
                />
                {destacada && (
                  <span
                    role="tooltip"
                    className={clsx(
                      "pointer-events-none absolute top-0 z-10 whitespace-nowrap rounded border border-light-gray-2 bg-white px-2 py-1 text-xs shadow-md",
                      i < dados.length / 2 ? "left-0" : "right-0"
                    )}
                  >
                    <strong className="font-semibold">{d.rotulo}</strong>
                    {": "}
                    {numero.format(d.valor)} {unidade}
                    {total > 0 && (
                      <span className="text-light-gray-6">
                        {" "}
                        ({percentagem.format(d.valor / total)})
                      </span>
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex gap-0.5">
          {dados.map((d, i) => (
            <span
              key={d.rotulo}
              className="flex-1 text-center text-xs leading-tight text-light-gray-6"
            >
              {i % passo === 0 ? d.rotulo : ""}
            </span>
          ))}
        </div>
        {rotuloEixo && (
          <p className="mt-2 text-center text-xs text-light-gray-6">
            {rotuloEixo}
          </p>
        )}
      </div>
      <TabelaAcessivel
        titulo={titulo}
        colunas={[rotuloEixo ?? "", unidade]}
        linhas={dados.map((d) => [d.rotulo, d.valor])}
      />
    </div>
  );
}

export type Serie = {
  nome: string;
  /** Variável CSS da cor, por exemplo "--viz-1". */
  cor: string;
  valores: number[];
};

const formatoDataCurta = new Intl.DateTimeFormat("pt-PT", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Linhas ao longo do tempo, com uma régua vertical e os valores do ponto mais próximo. */
export function Linhas({
  titulo,
  datas,
  series,
}: {
  titulo: string;
  /** Datas no formato AAAA-MM-DD, por ordem. */
  datas: string[];
  series: Serie[];
}) {
  const id = useId();
  const svg = useRef<SVGSVGElement>(null);
  const [ativo, setAtivo] = useState<number | null>(null);

  const L = 480;
  const A = 200;
  const margem = { cima: 12, direita: 12, baixo: 24, esquerda: 52 };
  const largura = L - margem.esquerda - margem.direita;
  const altura = A - margem.cima - margem.baixo;

  const maximoBruto = Math.max(1, ...series.flatMap((s) => s.valores));
  const ordem = 10 ** Math.floor(Math.log10(maximoBruto));
  const maximo = Math.ceil(maximoBruto / ordem) * ordem;
  const marcas = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maximo);

  const x = (i: number) =>
    margem.esquerda +
    (datas.length > 1 ? (i / (datas.length - 1)) * largura : largura / 2);
  const y = (v: number) => margem.cima + altura - (v / maximo) * altura;

  function mover(evento: React.PointerEvent<SVGSVGElement>) {
    const caixa = svg.current?.getBoundingClientRect();
    if (!caixa || datas.length === 0) return;
    const px = ((evento.clientX - caixa.left) / caixa.width) * L;
    const fracao = (px - margem.esquerda) / largura;
    const i = Math.round(fracao * (datas.length - 1));
    setAtivo(Math.min(datas.length - 1, Math.max(0, i)));
  }

  const formatarData = (d: string) =>
    formatoDataCurta.format(new Date(`${d}T00:00:00Z`));

  return (
    <div>
      <ul className="mb-3 flex flex-wrap gap-4 text-sm" aria-hidden="true">
        {series.map((s) => (
          <li key={s.nome} className="flex items-center gap-2">
            <span
              className="h-0.5 w-4 rounded"
              style={{ background: `var(${s.cor})` }}
            />
            {s.nome}
          </li>
        ))}
      </ul>
      <div className="relative" aria-hidden="true">
        <svg
          ref={svg}
          viewBox={`0 0 ${L} ${A}`}
          className="h-auto w-full touch-none overflow-visible"
          onPointerMove={mover}
          onPointerDown={mover}
          onPointerLeave={() => setAtivo(null)}
        >
          <title id={id}>{titulo}</title>
          {marcas.map((m) => (
            <g key={m}>
              <line
                x1={margem.esquerda}
                x2={L - margem.direita}
                y1={y(m)}
                y2={y(m)}
                className="stroke-light-gray-2"
                strokeWidth={1}
              />
              <text
                x={margem.esquerda - 8}
                y={y(m)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-light-gray-6 text-[12px]"
              >
                {numero.format(m)}
              </text>
            </g>
          ))}
          {datas.map((d, i) =>
            i === 0 || i === datas.length - 1 ? (
              <text
                key={d}
                x={x(i)}
                y={A - 6}
                textAnchor={i === 0 ? "start" : "end"}
                className="fill-light-gray-6 text-[12px]"
              >
                {formatarData(d)}
              </text>
            ) : null
          )}
          {ativo !== null && (
            <line
              x1={x(ativo)}
              x2={x(ativo)}
              y1={margem.cima}
              y2={margem.cima + altura}
              className="stroke-light-gray-4"
              strokeWidth={1}
            />
          )}
          {series.map((s) => (
            <g key={s.nome}>
              <polyline
                fill="none"
                stroke={`var(${s.cor})`}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={s.valores.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
              />
              {(datas.length === 1 || ativo !== null) && (
                <circle
                  cx={x(ativo ?? 0)}
                  cy={y(s.valores[ativo ?? 0])}
                  r={4}
                  fill={`var(${s.cor})`}
                  className="stroke-white"
                  strokeWidth={2}
                />
              )}
            </g>
          ))}
        </svg>
        {ativo !== null && (
          <div
            role="tooltip"
            className="pointer-events-none absolute top-0 z-10 whitespace-nowrap rounded border border-light-gray-2 bg-white px-2 py-1 text-xs shadow-md"
            style={
              x(ativo) > L / 2
                ? { right: `${((L - x(ativo)) / L) * 100 + 2}%` }
                : { left: `${(x(ativo) / L) * 100 + 2}%` }
            }
          >
            <p className="mb-1 font-semibold">{formatarData(datas[ativo])}</p>
            {series.map((s) => (
              <p key={s.nome} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: `var(${s.cor})` }}
                />
                {s.nome}: {numero.format(s.valores[ativo])}
              </p>
            ))}
          </div>
        )}
      </div>
      <TabelaAcessivel
        titulo={titulo}
        colunas={["Data", ...series.map((s) => s.nome)]}
        linhas={datas.map((d, i) => [
          formatarData(d),
          ...series.map((s) => s.valores[i]),
        ])}
      />
    </div>
  );
}
