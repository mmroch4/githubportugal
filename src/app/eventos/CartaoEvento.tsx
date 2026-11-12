import {
  CalendarIcon,
  GlobeIcon,
  LinkExternalIcon,
  LocationIcon,
} from "@primer/octicons-react";
import clsx from "clsx";
import { formatarDatas, type Evento } from "@/lib/eventos";

const formatoDiaCurto = new Intl.DateTimeFormat("pt-PT", {
  day: "numeric",
  timeZone: "UTC",
});
const formatoMesCurto = new Intl.DateTimeFormat("pt-PT", {
  month: "short",
  timeZone: "UTC",
});

function diaSeguinte(d: string) {
  const data = new Date(`${d}T00:00:00Z`);
  data.setUTCDate(data.getUTCDate() + 1);
  return data.toISOString().slice(0, 10);
}

/** Link para criar o evento no Google Calendar, como evento de dia inteiro. */
function linkGoogleCalendar(e: Evento) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.nome,
    dates: `${e.inicio.replace(/-/g, "")}/${diaSeguinte(e.fim).replace(
      /-/g,
      ""
    )}`,
    details: `${e.descricao}\n\n${e.site}`,
    location: e.formato === "online" ? "Online" : `${e.cidade}, Portugal`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

const etiquetaClassName =
  "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium";

export function CartaoEvento({
  evento: e,
  hoje,
  passado = false,
}: {
  evento: Evento;
  hoje: string;
  passado?: boolean;
}) {
  const aDecorrer = !passado && e.inicio <= hoje && e.fim >= hoje;
  const inicio = new Date(`${e.inicio}T00:00:00Z`);

  return (
    <li
      className={clsx(
        "flex gap-4 rounded-md border bg-white p-4",
        aDecorrer ? "border-light-green-3" : "border-light-gray-2"
      )}
    >
      <div
        aria-hidden="true"
        className={clsx(
          "flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-md border",
          passado
            ? "border-light-gray-2 bg-light-gray-0 text-light-gray-6"
            : "border-light-gray-2 bg-light-gray-0"
        )}
      >
        <span className="text-2xl font-black leading-none">
          {formatoDiaCurto.format(inicio)}
        </span>
        <span className="text-xs font-bold uppercase text-light-gray-6">
          {formatoMesCurto.format(inicio).replace(".", "")}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <a
            href={e.site}
            target="_blank"
            rel="noopener noreferrer"
            className="break-words font-bold hover:underline focus:underline sm:text-lg"
          >
            {e.nome}
          </a>
          {aDecorrer && (
            <span
              className={clsx(
                etiquetaClassName,
                "border-light-green-2 bg-light-green-0 text-light-green-8"
              )}
            >
              A decorrer
            </span>
          )}
        </div>

        <p className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-light-gray-7">
          <span className="flex items-center gap-1">
            <CalendarIcon className="fill-light-gray-6" />
            {formatarDatas(e.inicio, e.fim)}
          </span>
          <span className="flex items-center gap-1">
            {e.formato === "online" ? (
              <GlobeIcon className="fill-light-gray-6" />
            ) : (
              <LocationIcon className="fill-light-gray-6" />
            )}
            {e.formato === "online"
              ? "Online"
              : e.formato === "híbrido"
              ? `${e.cidade} e online`
              : e.cidade}
          </span>
        </p>

        {!passado && (
          <p className="mb-3 text-sm text-light-gray-8 sm:text-base">
            {e.descricao}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span
            className={clsx(
              etiquetaClassName,
              "border-light-gray-2 text-light-gray-7"
            )}
          >
            {e.tipo}
          </span>
          {e.gratuito && (
            <span
              className={clsx(
                etiquetaClassName,
                "border-light-blue-2 bg-light-blue-0 text-light-blue-7"
              )}
            >
              Gratuito
            </span>
          )}
          {!passado && (
            <a
              href={linkGoogleCalendar(e)}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 font-medium text-light-blue-6 hover:underline focus:underline"
            >
              Adicionar ao Google Calendar
              <LinkExternalIcon size={12} />
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
