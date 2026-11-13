import { ArrowRightIcon } from "@primer/octicons-react";
import clsx from "clsx";
import Link from "next/link";
import { Barras } from "@/components/Barras";
import {
  TerminalInicio,
  type SeparadorTerminal,
} from "@/components/inicio/TerminalInicio";
import { links } from "@/config/metadata";
import { lerProgramadores } from "@/lib/estatisticas";
import { obterAgenda } from "@/lib/eventos";
import { formatoNumero } from "@/lib/formatar";
import { obterPrimeirasContribuicoes } from "@/lib/issues";
import { listarLogins } from "@/lib/mantenedores";
import { obterDiretorio } from "@/lib/projetos";
import { obterRanking } from "@/lib/ranking";
import { metadadosPagina } from "@/lib/seo";

// Os dados do GitHub (estrelas, issues) atualizam, no máximo, de 6 em 6 horas.
export const revalidate = 21600;

export const metadata = {
  ...metadadosPagina({
    titulo: "GitHub Portugal",
    tituloSocial:
      "GitHub Portugal: comunidade de programadores e de open source em Portugal",
    descricao:
      "Comunidade portuguesa de programadores e de projetos open source no GitHub: diretório de projetos, mantenedores, primeiras contribuições, ranking, eventos, comunidades, empresas e um guia de código aberto em português.",
    caminho: "/",
  }),
  title: {
    absolute:
      "GitHub Portugal: comunidade de programadores e de open source em Portugal",
  },
};

const numeroCompleto = new Intl.NumberFormat("pt-PT", {
  useGrouping: "always",
});
const mesCurto = new Intl.DateTimeFormat("pt-PT", {
  month: "short",
  timeZone: "UTC",
});

const cartao =
  "flex min-w-0 flex-col rounded-xl border border-light-gray-2 bg-white/60 p-5 sm:p-6";

/** Dia e mês de um evento ("14 nov"). */
function diaMes(data: string) {
  const d = new Date(`${data}T00:00:00Z`);
  return {
    dia: String(d.getUTCDate()).padStart(2, "0"),
    mes: mesCurto.format(d).replace(".", ""),
  };
}

/** Cabeçalho de um cartão: título e ligação "→". */
function TopoCartao({ titulo, href }: { titulo: string; href: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-lg font-semibold">
        <Link href={href} className="hover:text-marca-verde">
          {titulo}
        </Link>
      </h3>
      <Link
        href={href}
        aria-label={`Ver ${titulo.toLowerCase()}`}
        className="font-mono text-sm text-marca-verde"
      >
        →
      </Link>
    </div>
  );
}

export default async function Home() {
  const [programadores, diretorio, ranking, agenda, logins] = await Promise.all(
    [
      lerProgramadores(),
      obterDiretorio(),
      obterRanking(),
      obterAgenda(),
      listarLogins(),
    ]
  );
  const { issues } = await obterPrimeirasContribuicoes(
    diretorio.projetos,
    diretorio.atualizadoEm
  );

  const top = ranking.listas.pais.contribuicoes
    .slice(0, 5)
    .map((login) => ranking.pessoas[login]);
  const destaques = [...diretorio.projetos]
    .filter((p) => !p.arquivado)
    .sort((a, b) => (b.estrelas ?? 0) - (a.estrelas ?? 0))
    .slice(0, 5);
  const proximos = agenda.proximos.slice(0, 5);

  const separadores: SeparadorTerminal[] = [
    top.length > 0 && {
      id: "ranking",
      comando: "gp ranking --top 5",
      linhas: top.map((p, i) => ({
        chave: p.login,
        prefixo: String(i + 1).padStart(2, "0"),
        avatar: p.avatar,
        texto: p.nome ?? p.login,
        valor: numeroCompleto.format(p.contribuicoes),
      })),
      ligacao: { href: "/ranking", texto: "ranking completo" },
    },
    {
      id: "projetos",
      comando: "gp projetos --top 5",
      linhas: destaques.map((p, i) => ({
        chave: p.repositorio,
        prefixo: String(i + 1).padStart(2, "0"),
        avatar: p.avatar,
        texto: p.repositorio,
        valor:
          p.estrelas !== null
            ? `★ ${formatoNumero.format(p.estrelas)}`
            : undefined,
      })),
      ligacao: { href: "/projetos", texto: "todos os projetos" },
    },
    proximos.length > 0 && {
      id: "eventos",
      comando: "gp eventos --proximos",
      linhas: proximos.map((e) => {
        const { dia, mes } = diaMes(e.inicio);
        return { chave: e.id, prefixo: `${dia} ${mes}`, texto: e.nome };
      }),
      ligacao: { href: "/eventos", texto: "agenda" },
    },
  ].filter((s): s is SeparadorTerminal => Boolean(s));

  const numeros = [
    programadores && {
      valor: numeroCompleto.format(programadores.pessoas),
      rotulo: "pessoas",
    },
    programadores &&
      programadores.ativas > 0 && {
        valor: numeroCompleto.format(programadores.ativas),
        rotulo: "ativas",
      },
    programadores && {
      valor: formatoNumero.format(programadores.contribuicoes),
      rotulo: "contribuições",
    },
    {
      valor: numeroCompleto.format(diretorio.projetos.length),
      rotulo: "projetos",
    },
  ].filter((n): n is { valor: string; rotulo: string } => Boolean(n));

  const linguagens = (programadores?.linguagens ?? [])
    .filter((l) => l.rotulo !== "Outras")
    .slice(0, 6);
  const cidades = programadores?.cidades ?? [];

  const atalhos = [
    {
      href: "/mantenedores",
      nome: "Mantenedores",
      extra: String(logins.length),
    },
    { href: "/comunidades", nome: "Comunidades" },
    { href: "/empresas", nome: "Empresas" },
    { href: "/guia", nome: "Guia" },
    { href: "/artigos", nome: "Artigos" },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
      {/* Hero */}
      <section className="grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:py-20">
        <div>
          <h1 className="mb-5 text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
            O open source portugu
            <span className="text-marca-vermelho">ês</span>, num só sítio.
          </h1>
          <p className="mb-8 max-w-xl text-lg text-light-gray-7">
            Projetos, pessoas e eventos da comunidade.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/projetos" className="botao-primario group">
              Explorar projetos
              <ArrowRightIcon className="fill-current transition group-hover:translate-x-0.5" />
            </Link>
            <Link href="/primeiras-contribuicoes" className="botao-secundario">
              Primeira contribuição
            </Link>
          </div>
        </div>

        <TerminalInicio separadores={separadores} />
      </section>

      {/* Números */}
      <section
        aria-label="A comunidade em números"
        className="mb-20 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-light-gray-2 bg-light-gray-2 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none"
      >
        {numeros.map((n, i) => (
          <Link
            key={n.rotulo}
            href="/estatisticas"
            className={clsx(
              "bg-light-gray-0 p-5 hover:bg-light-gray-1 sm:p-6",
              numeros.length % 2 === 1 &&
                i === numeros.length - 1 &&
                "col-span-2 lg:col-span-1"
            )}
          >
            <span className="block font-mono text-2xl font-bold tabular-nums sm:text-3xl">
              {n.valor}
            </span>
            <span className="text-sm text-light-gray-6">{n.rotulo}</span>
          </Link>
        ))}
      </section>

      {/* Portugal em código */}
      {programadores && (
        <section aria-labelledby="portugal-em-codigo" className="mb-20">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 id="portugal-em-codigo" className="etiqueta">
              {"// portugal em código"}
            </h2>
            <Link
              href="/estatisticas"
              className="font-mono text-sm text-marca-verde hover:underline"
            >
              estatísticas →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className={cartao}>
              <h3 className="mb-4 font-semibold">Linguagens</h3>
              <Barras
                itens={linguagens.map((l) => ({
                  rotulo: l.rotulo,
                  valor: l.valor,
                }))}
              />
            </div>
            <div className={cartao}>
              <h3 className="mb-4 font-semibold">Cidades</h3>
              <Barras
                itens={cidades.map((c) => ({
                  rotulo: c.rotulo,
                  valor: c.valor,
                }))}
              />
            </div>
          </div>
        </section>
      )}

      {/* Explorar */}
      <section aria-labelledby="explorar" className="mb-20">
        <h2 id="explorar" className="etiqueta mb-6">
          {"// explorar"}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className={cartao}>
            <TopoCartao titulo="Projetos" href="/projetos" />
            <ul className="divide-y divide-light-gray-2">
              {destaques.slice(0, 3).map((p) => (
                <li key={p.repositorio}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 py-3 hover:text-marca-verde"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.avatar}
                      alt=""
                      width={28}
                      height={28}
                      loading="lazy"
                      className="h-7 w-7 rounded-md border border-light-gray-2"
                    />
                    <span className="min-w-0 truncate">
                      <span className="text-light-gray-6">{p.dono}/</span>
                      <span className="font-semibold">{p.nome}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={cartao}>
            <TopoCartao titulo="Para começar" href="/primeiras-contribuicoes" />
            {issues.length > 0 ? (
              <ul className="divide-y divide-light-gray-2">
                {issues.slice(0, 3).map((i) => (
                  <li key={i.url}>
                    <a
                      href={i.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col gap-1 py-3 hover:text-marca-verde"
                    >
                      <span className="line-clamp-1 font-medium">
                        {i.titulo}
                      </span>
                      <span className="truncate font-mono text-xs text-light-gray-6">
                        {i.repositorio}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-3 text-sm text-light-gray-6">
                Sem issues abertas neste momento.
              </p>
            )}
          </div>

          <div className={cartao}>
            <TopoCartao titulo="Eventos" href="/eventos" />
            {proximos.length > 0 ? (
              <ul className="divide-y divide-light-gray-2">
                {proximos.slice(0, 3).map((e) => {
                  const { dia, mes } = diaMes(e.inicio);
                  return (
                    <li key={e.id} className="flex items-center gap-3 py-3">
                      <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-light-gray-3 font-mono leading-none">
                        <span className="font-bold">{dia}</span>
                        <span className="text-[10px] uppercase text-light-gray-6">
                          {mes}
                        </span>
                      </span>
                      <span className="min-w-0 truncate font-semibold">
                        {e.nome}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="py-3 text-sm text-light-gray-6">
                Sem eventos marcados.
              </p>
            )}
          </div>
        </div>

        <ul className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {atalhos.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className="flex min-h-[52px] items-center justify-between rounded-xl border border-light-gray-2 px-4 font-medium hover:border-light-gray-3 hover:bg-white/60"
              >
                {a.nome}
                <span className="font-mono text-light-gray-6">
                  {a.extra ?? "→"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Chamada final */}
      <section className="flex flex-col gap-6 rounded-2xl border border-light-gray-2 bg-gradient-to-r from-white/60 via-white/60 to-marca-verde/10 px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
          Tens um projeto open source?
        </h2>
        <div className="flex flex-wrap gap-3">
          <a
            href={`${links.repository}/blob/main/CONTRIBUTING.md#adicionar-um-projeto`}
            target="_blank"
            rel="noopener noreferrer"
            className="botao-primario"
          >
            Adicionar projeto
          </a>
          <Link href="/selo" className="botao-secundario">
            Obter o selo
          </Link>
        </div>
      </section>
    </main>
  );
}
