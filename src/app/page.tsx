import {
  ArrowRightIcon,
  BookIcon,
  CalendarIcon,
  GraphIcon,
  IssueOpenedIcon,
  OrganizationIcon,
  PeopleIcon,
  RepoIcon,
  StarIcon,
  VerifiedIcon,
} from "@primer/octicons-react";
import clsx from "clsx";
import Link from "next/link";
import { RiDiscordFill } from "react-icons/ri";
import { links } from "@/config/metadata";
import { lerArtigos, formatarData } from "@/lib/artigos";
import { lerProgramadores } from "@/lib/estatisticas";
import { formatarDatas, obterAgenda } from "@/lib/eventos";
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

const numeroCompleto = new Intl.NumberFormat("pt-PT");

const cartao =
  "group relative flex flex-col rounded-xl border border-light-gray-2 bg-white/60 p-5 transition hover:border-light-gray-3 hover:bg-white";

/** Título de um cartão do bento, com ícone e seta. */
function TituloCartao({
  icone: Icone,
  children,
}: {
  icone: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-1 flex items-center gap-2 font-bold">
      <Icone className="fill-marca-verde" />
      {children}
      <ArrowRightIcon className="ml-auto fill-light-gray-5 transition group-hover:translate-x-0.5 group-hover:fill-light-black" />
    </h3>
  );
}

export default async function Home() {
  const [programadores, diretorio, ranking, agenda, artigos, logins] =
    await Promise.all([
      lerProgramadores(),
      obterDiretorio(),
      obterRanking(),
      obterAgenda(),
      lerArtigos(),
      listarLogins(),
    ]);
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
    .slice(0, 3);
  const estrelas = diretorio.projetos.reduce(
    (total, p) => total + (p.estrelas ?? 0),
    0
  );
  const proximos = agenda.proximos.slice(0, 3);
  const artigo = artigos[0];

  const numeros = [
    programadores && {
      valor: formatoNumero.format(programadores.pessoas),
      rotulo: "programadores no ranking",
    },
    programadores && {
      valor: formatoNumero.format(programadores.contribuicoes),
      rotulo: "contribuições públicas num ano",
    },
    {
      valor: numeroCompleto.format(diretorio.projetos.length),
      rotulo: "projetos no diretório",
    },
    // Sem dados do GitHub (sem token ou API em baixo) não há estrelas a mostrar.
    estrelas > 0 && {
      valor: formatoNumero.format(estrelas),
      rotulo: "estrelas nesses projetos",
    },
  ].filter((n): n is { valor: string; rotulo: string } => Boolean(n));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
      {/* Hero */}
      <section className="grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:py-20">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-light-gray-2 bg-white/60 px-3 py-1 font-mono text-xs text-light-gray-7">
            <span className="h-1.5 w-1.5 rounded-full bg-marca-verde shadow-[0_0_8px] shadow-marca-verde" />
            de dev para dev · não oficial
          </p>
          <h1 className="mb-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            O open source{" "}
            <span className="bg-gradient-to-r from-marca-verde to-marca-vermelho bg-clip-text text-transparent">
              português
            </span>
            , num só sítio.
          </h1>
          <p className="mb-8 max-w-xl text-lg text-light-gray-7">
            Projetos, pessoas, eventos e um guia para começar. Tudo feito pela
            comunidade, em código aberto e no GitHub.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/projetos"
              className="group botao-primario"
            >
              Explorar projetos
              <ArrowRightIcon className="fill-current transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/primeiras-contribuicoes"
              className="botao-secundario"
            >
              Fazer a primeira contribuição
            </Link>
            <a
              href={links.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2 py-3 text-sm font-medium text-light-gray-6 hover:text-light-black"
            >
              <RiDiscordFill className="h-4 w-4" />
              Junta-te no Discord
            </a>
          </div>
        </div>

        {/* "Terminal" com o top 5 do ranking */}
        {top.length > 0 && (
          <Link
            href="/ranking"
            className="group block overflow-hidden rounded-xl border border-light-gray-2 bg-white/70 shadow-2xl shadow-marca-verde/5 backdrop-blur hover:border-light-gray-3"
          >
            <div className="flex items-center gap-2 border-b border-light-gray-2 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-light-gray-2" />
              <span className="h-3 w-3 rounded-full bg-light-gray-2" />
              <span className="h-3 w-3 rounded-full bg-light-gray-2" />
              <span className="ml-2 font-mono text-xs text-light-gray-6">
                githubportugal — ranking
              </span>
            </div>
            <div className="p-4 font-mono text-sm sm:p-5">
              <p className="mb-4 text-light-gray-6">
                <span className="text-marca-verde">$</span> gp ranking --top 5
              </p>
              <ol className="space-y-3">
                {top.map((p, i) => (
                  <li key={p.login} className="flex items-center gap-3">
                    <span className="w-5 text-light-gray-5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.avatar}
                      alt=""
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-full border border-light-gray-2"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      <span className="text-light-black">
                        {p.nome ?? p.login}
                      </span>{" "}
                      <span className="hidden text-light-gray-5 sm:inline">
                        @{p.login}
                      </span>
                    </span>
                    <span className="tabular-nums text-marca-verde">
                      {numeroCompleto.format(p.contribuicoes)}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-light-gray-5 group-hover:text-light-gray-7">
                → ver o ranking completo
                <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-light-gray-5" />
              </p>
            </div>
          </Link>
        )}
      </section>

      {/* Números */}
      <section
        aria-label="A comunidade em números"
        className="mb-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-light-gray-2 bg-light-gray-2 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none"
      >
        {numeros.map((n, i) => (
          <Link
            key={n.rotulo}
            href="/estatisticas"
            className={clsx(
              "bg-light-gray-0 p-5 hover:bg-light-gray-1 sm:p-6",
              // Com um número ímpar, o último ocupa a linha toda no telemóvel.
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

      {/* Bento */}
      <section aria-labelledby="explorar" className="mb-16">
        <h2
          id="explorar"
          className="mb-6 font-mono text-xs uppercase tracking-wider text-light-gray-5"
        >
          Explorar
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/projetos" className={`${cartao} md:col-span-2`}>
            <TituloCartao icone={RepoIcon}>Projetos</TituloCartao>
            <p className="mb-4 text-sm text-light-gray-6">
              Projetos open source criados ou mantidos por portugueses.
            </p>
            <ul className="mt-auto divide-y divide-light-gray-2 rounded-lg border border-light-gray-2">
              {destaques.map((p) => (
                <li key={p.repositorio} className="flex items-center gap-3 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.avatar}
                    alt=""
                    width={32}
                    height={32}
                    loading="lazy"
                    className="h-8 w-8 rounded-md border border-light-gray-2"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">
                      <span className="font-normal text-light-gray-6">
                        {p.dono}/
                      </span>
                      {p.nome}
                    </span>
                    <span className="block truncate text-xs text-light-gray-6">
                      {p.descricao}
                    </span>
                  </span>
                  {p.estrelas !== null && (
                    <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-light-gray-7">
                      <StarIcon size={12} className="fill-current" />
                      {formatoNumero.format(p.estrelas)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Link>

          <Link href="/primeiras-contribuicoes" className={cartao}>
            <TituloCartao icone={IssueOpenedIcon}>
              Primeiras contribuições
            </TituloCartao>
            <p className="mb-4 text-sm text-light-gray-6">
              Issues abertas à espera de alguém como tu.
            </p>
            {issues.length > 0 && (
              <p className="mb-3 font-mono text-4xl font-bold tabular-nums">
                {numeroCompleto.format(issues.length)}
                <span className="ml-2 text-sm font-normal text-light-gray-6">
                  issues
                </span>
              </p>
            )}
            <ul className="mt-auto space-y-2">
              {issues.slice(0, 3).map((i) => (
                <li
                  key={i.url}
                  className="truncate border-l-2 border-marca-verde/60 pl-3 text-sm text-light-gray-7"
                >
                  {i.titulo}
                </li>
              ))}
            </ul>
          </Link>

          <Link href="/eventos" className={cartao}>
            <TituloCartao icone={CalendarIcon}>Próximos eventos</TituloCartao>
            {proximos.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {proximos.map((e) => (
                  <li key={e.id} className="flex gap-3">
                    <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-md border border-light-gray-2 font-mono leading-none">
                      <span className="text-base font-bold">
                        {Number(e.inicio.slice(8, 10))}
                      </span>
                      <span className="text-[10px] uppercase text-light-gray-6">
                        {new Intl.DateTimeFormat("pt-PT", {
                          month: "short",
                          timeZone: "UTC",
                        })
                          .format(new Date(`${e.inicio}T00:00:00Z`))
                          .replace(".", "")}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">
                        {e.nome}
                      </span>
                      <span className="block truncate text-xs text-light-gray-6">
                        {e.cidade} · {formatarDatas(e.inicio, e.fim)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-light-gray-6">
                Ainda não há eventos marcados. Conheces algum? Adiciona-o.
              </p>
            )}
          </Link>

          <Link href="/guia" className={cartao}>
            <TituloCartao icone={BookIcon}>Guia de código aberto</TituloCartao>
            <p className="mb-4 text-sm text-light-gray-6">
              Do primeiro fork à manutenção de um projeto, em português.
            </p>
            <pre className="mt-auto overflow-hidden rounded-md border border-light-gray-2 bg-light-gray-0 p-3 font-mono text-xs leading-relaxed text-light-gray-7">
              <span className="text-light-gray-5">$</span> git checkout -b{" "}
              <span className="text-marca-verde">primeira-contribuicao</span>
              {"\n"}
              <span className="text-light-gray-5">$</span> git commit -m{" "}
              <span className="text-marca-vermelho">
                &quot;Olá, mundo&quot;
              </span>
            </pre>
          </Link>

          {artigo ? (
            <Link href={`/artigos/${artigo.slug}`} className={cartao}>
              <TituloCartao icone={BookIcon}>Último artigo</TituloCartao>
              <p className="mb-1 mt-2 font-bold">{artigo.titulo}</p>
              <p className="mb-4 line-clamp-3 text-sm text-light-gray-6">
                {artigo.descricao}
              </p>
              <p className="mt-auto font-mono text-xs text-light-gray-5">
                {formatarData(artigo.data)} · {artigo.minutos} min
              </p>
            </Link>
          ) : (
            <Link href="/artigos" className={cartao}>
              <TituloCartao icone={BookIcon}>Artigos</TituloCartao>
              <p className="text-sm text-light-gray-6">Textos da comunidade.</p>
            </Link>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              href: "/mantenedores",
              icone: PeopleIcon,
              nome: "Mantenedores",
              texto: `${logins.length} pessoas por trás dos projetos`,
            },
            {
              href: "/comunidades",
              icone: PeopleIcon,
              nome: "Comunidades",
              texto: "Meetups e grupos tech",
            },
            {
              href: "/empresas",
              icone: OrganizationIcon,
              nome: "Empresas",
              texto: "Quem faz open source em Portugal",
            },
            {
              href: "/estatisticas",
              icone: GraphIcon,
              nome: "Estatísticas",
              texto: "Linguagens, cidades e evolução",
            },
          ].map((c) => (
            <Link key={c.href} href={c.href} className={cartao}>
              <TituloCartao icone={c.icone}>{c.nome}</TituloCartao>
              <p className="text-sm text-light-gray-6">{c.texto}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Chamada final */}
      <section className="relative overflow-hidden rounded-2xl border border-light-gray-2 bg-white/60 px-6 py-10 sm:px-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-marca-verde/25 to-marca-vermelho/25 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-black tracking-tight sm:text-3xl">
              Tens um projeto open source?
            </h2>
            <p className="max-w-xl text-light-gray-7">
              Adiciona-o ao diretório com um pull request e mostra no README que
              foi feito em Portugal.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`${links.repository}/blob/main/CONTRIBUTING.md#adicionar-um-projeto`}
              target="_blank"
              rel="noopener noreferrer"
              className="botao-primario"
            >
              Adicionar projeto
            </a>
            <Link
              href="/selo"
              className="botao-secundario"
            >
              <VerifiedIcon className="fill-current" />
              Obter o selo
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
