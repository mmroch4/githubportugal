import { CalendarIcon, PeopleIcon, PlusIcon } from "@primer/octicons-react";
import { Metadata } from "next";
import Link from "next/link";
import { dadosEvento, metadadosPagina, paginaColecao } from "@/lib/seo";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { links, siteUrl } from "@/config/metadata";
import { mesDe, obterAgenda, type Evento } from "@/lib/eventos";
import { CartaoEvento } from "./CartaoEvento";

// Volta a gerar a página de hora a hora, para os eventos que já acabaram
// passarem para a lista de eventos passados.
export const revalidate = 3600;

const description =
  "Agenda de conferências, meetups, workshops e hackathons de tecnologia em Portugal, mantida pela comunidade.";

export const metadata: Metadata = metadadosPagina({
  titulo: "Eventos tech em Portugal",
  descricao: description,
  caminho: "/eventos",
});

const MAX_PASSADOS = 12;

function agruparPorMes(eventos: Evento[], hoje: string) {
  const grupos = new Map<string, Evento[]>();
  for (const e of eventos) {
    // Um evento que começou num mês anterior e ainda decorre fica no mês atual.
    const chave = e.inicio < hoje ? hoje.slice(0, 7) : e.inicio.slice(0, 7);
    const lista = grupos.get(chave) ?? [];
    lista.push(e);
    grupos.set(chave, lista);
  }
  return Array.from(grupos.entries());
}

export default async function Eventos() {
  const { proximos, passados, hoje } = await obterAgenda();
  const grupos = agruparPorMes(proximos, hoje);
  const adicionarEvento = `${links.repository}/blob/main/CONTRIBUTING.md#adicionar-um-evento`;

  return (
    <main className="m-auto w-full max-w-lg p-4 pb-8 sm:max-w-xl sm:px-6 md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-black sm:text-4xl md:text-5xl">
            Eventos
          </h1>
          <p className="max-w-2xl text-base text-light-gray-7 sm:text-lg">
            Conferências, meetups, workshops e hackathons de tecnologia em
            Portugal. Organizas ou conheces um evento que não está aqui?
            Adiciona-o com um pull request.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/comunidades"
            className="flex items-center justify-center gap-2 rounded border border-light-gray-3 px-4 py-2 text-sm font-bold sm:text-base"
          >
            <PeopleIcon className="fill-light-black" />
            Comunidades
          </Link>
          <a
            href="/eventos/calendario.ics"
            title="Subscreve este calendário no Google Calendar, no Outlook ou no Calendário da Apple"
            className="flex items-center justify-center gap-2 rounded border border-light-gray-3 px-4 py-2 text-sm font-bold sm:text-base"
          >
            <CalendarIcon className="fill-light-black" />
            Calendário (.ics)
          </a>
          <a
            href={adicionarEvento}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded bg-light-gray-9 px-4 py-2 text-sm font-bold text-white sm:text-base"
          >
            <PlusIcon className="fill-white" />
            Adicionar evento
          </a>
        </div>
      </header>

      {grupos.length === 0 ? (
        <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
          Não há eventos marcados de momento.{" "}
          <a
            href={adicionarEvento}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-light-blue-6 hover:underline focus:underline"
          >
            Adiciona o próximo
          </a>
          .
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {grupos.map(([mes, eventos]) => (
            <section key={mes} aria-labelledby={`mes-${mes}`}>
              <h2
                id={`mes-${mes}`}
                className="mb-3 text-lg font-bold first-letter:uppercase sm:text-xl"
              >
                {mesDe(`${mes}-01`)}
              </h2>
              <ul className="flex flex-col gap-3">
                {eventos.map((e) => (
                  <CartaoEvento key={e.id} evento={e} hoje={hoje} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {passados.length > 0 && (
        <details className="group mt-10">
          <summary className="cursor-pointer select-none font-bold text-light-gray-7">
            Eventos passados
          </summary>
          <ul className="mt-3 flex flex-col gap-3">
            {passados.slice(0, MAX_PASSADOS).map((e) => (
              <CartaoEvento key={e.id} evento={e} hoje={hoje} passado />
            ))}
          </ul>
        </details>
      )}

      <p className="mt-8 text-sm text-light-gray-6">
        Para teres a agenda no teu calendário, subscreve{" "}
        <code className="break-all rounded bg-light-gray-1 px-1">
          {`${siteUrl}/eventos/calendario.ics`}
        </code>{" "}
        no Google Calendar, no Outlook ou no Calendário da Apple. Os eventos
        novos aparecem sozinhos.
      </p>
      <DadosEstruturados
        dados={paginaColecao({
          nome: "Eventos tech em Portugal",
          descricao: description,
          caminho: "/eventos",
          itens: proximos.map(dadosEvento),
        })}
      />
    </main>
  );
}
