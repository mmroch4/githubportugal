import { CalendarIcon, PlusIcon } from "@primer/octicons-react";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { Metadata } from "next";
import Link from "next/link";
import { dadosEvento, metadadosPagina, paginaColecao } from "@/lib/seo";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { links } from "@/config/metadata";
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
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6">
      <CabecalhoPagina
        etiqueta={`${proximos.length} próximos`}
        titulo="Eventos"
      >
        <a
          href="/eventos/calendario.ics"
          title="Subscreve no Google Calendar, no Outlook ou no Calendário da Apple"
          className="botao-secundario"
        >
          <CalendarIcon className="fill-current" />
          Subscrever calendário
        </a>
        <a
          href={adicionarEvento}
          target="_blank"
          rel="noopener noreferrer"
          className="botao-primario"
        >
          <PlusIcon className="fill-current" />
          Adicionar evento
        </a>
      </CabecalhoPagina>

      {grupos.length === 0 ? (
        <p className="rounded border border-dashed border-light-gray-3 p-8 text-center text-light-gray-6">
          Não há eventos marcados de momento.{" "}
          <a
            href={adicionarEvento}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-marca-verde hover:underline focus:underline"
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
                className="mb-3 flex items-center gap-3 font-mono text-sm text-marca-verde"
              >
                {`// ${mesDe(`${mes}-01`).toLowerCase()}`}
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-light-gray-2"
                />
              </h2>
              <ul className="grid grid-cols-1 gap-2">
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
          <summary className="cursor-pointer select-none font-mono text-sm text-light-gray-6">
            {"// eventos passados"}
          </summary>
          <ul className="mt-3 grid grid-cols-1 gap-2">
            {passados.slice(0, MAX_PASSADOS).map((e) => (
              <CartaoEvento key={e.id} evento={e} hoje={hoje} passado />
            ))}
          </ul>
        </details>
      )}

      <p className="mt-10 font-mono text-sm text-light-gray-6">
        {"// procuras grupos? "}
        <Link href="/comunidades" className="text-marca-verde hover:underline">
          comunidades →
        </Link>
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
