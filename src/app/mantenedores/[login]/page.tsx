import {
  ArrowLeftIcon,
  LinkIcon,
  LocationIcon,
  MarkGithubIcon,
  OrganizationIcon,
  PeopleIcon,
  StarIcon,
} from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CartaoProjeto } from "@/components/CartaoProjeto";
import { caminhoMantenedor, formatoNumero } from "@/lib/formatar";
import { listarLogins, obterMantenedor } from "@/lib/mantenedores";

export const revalidate = 21600;
// Só existem páginas para quem está em data/mantenedores.yml.
export const dynamicParams = false;

type Props = { params: Promise<{ login: string }> };

export async function generateStaticParams() {
  const logins = await listarLogins();
  return logins.map((login) => ({ login: login.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { login } = await params;
  const m = await obterMantenedor(login);
  if (!m) return {};

  const title = m.nome === m.login ? m.login : `${m.nome} (@${m.login})`;
  const description =
    m.bio ??
    `Projetos open source mantidos por ${m.nome} no diretório do GitHub Portugal.`;

  return {
    title,
    description,
    alternates: { canonical: caminhoMantenedor(m.login) },
    openGraph: { title, description, type: "profile", images: [m.avatar] },
  };
}

const buttonClassName =
  "flex w-fit items-center justify-center rounded p-2 hover:bg-light-gray-1 focus:bg-light-gray-1 active:bg-light-gray-2 md:p-3";

export default async function PerfilMantenedor({ params }: Props) {
  const { login } = await params;
  const m = await obterMantenedor(login);
  if (!m) notFound();

  return (
    <main className="m-auto w-full max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
      <nav className="mb-2 sm:mb-3 md:mb-4">
        <Link href="/mantenedores" className={buttonClassName}>
          <ArrowLeftIcon
            verticalAlign="middle"
            className="h-5 w-5 fill-light-black md:h-6 md:w-6"
          />
          <span className="sr-only">Voltar aos mantenedores</span>
        </Link>
      </nav>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={m.avatar}
          alt=""
          width={128}
          height={128}
          className="h-24 w-24 shrink-0 rounded-full border border-light-gray-2 sm:h-32 sm:w-32"
        />

        <div className="min-w-0">
          <h1 className="break-words text-3xl font-black sm:text-4xl">
            {m.nome}
          </h1>
          <p className="mb-2 text-lg text-light-gray-6">@{m.login}</p>
          {m.bio && (
            <p className="mb-3 max-w-2xl text-base text-light-gray-8 sm:text-lg">
              {m.bio}
            </p>
          )}

          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-light-gray-6 sm:text-base">
            {m.localizacao && (
              <li className="flex items-center gap-1">
                <LocationIcon className="fill-light-gray-6" />
                {m.localizacao}
              </li>
            )}
            {m.empresa && (
              <li className="flex items-center gap-1">
                <OrganizationIcon className="fill-light-gray-6" />
                {m.empresa}
              </li>
            )}
            {m.seguidores !== null && (
              <li className="flex items-center gap-1">
                <PeopleIcon className="fill-light-gray-6" />
                {formatoNumero.format(m.seguidores)} seguidores
              </li>
            )}
            {m.estrelas > 0 && (
              <li className="flex items-center gap-1">
                <StarIcon className="fill-light-gray-6" />
                {formatoNumero.format(m.estrelas)} estrelas nos projetos
              </li>
            )}
          </ul>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded bg-light-gray-9 px-4 py-2 text-sm font-bold text-white sm:text-base"
            >
              <MarkGithubIcon className="fill-white" />
              Perfil no GitHub
            </a>
            {m.site && (
              <a
                href={m.site}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded border border-light-gray-3 px-4 py-2 text-sm font-bold sm:text-base"
              >
                <LinkIcon className="fill-light-black" />
                Site
              </a>
            )}
          </div>
        </div>
      </header>

      <section>
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">
          Projetos no diretório
        </h2>

        {m.projetos.length === 0 ? (
          <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
            Ainda não há projetos desta pessoa no{" "}
            <Link href="/projetos" className="font-medium underline">
              diretório
            </Link>
            .
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {m.projetos.map((p) => (
              <CartaoProjeto
                key={p.repositorio}
                projeto={p}
                atualizadoEm={m.atualizadoEm}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
