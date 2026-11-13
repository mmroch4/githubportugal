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

function local(e: Evento) {
  if (e.formato === "online") return "online";
  if (e.formato === "híbrido") return `${e.cidade} + online`;
  return e.cidade;
}

/** Uma linha da agenda: data, nome e cidade. */
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
    <li className="min-w-0">
      <a
        href={e.site}
        target="_blank"
        rel="noopener noreferrer"
        title={e.descricao}
        className={clsx(
          "flex items-center gap-4 rounded-xl border bg-white/60 p-3 pr-4 transition hover:bg-white",
          aDecorrer ? "border-marca-verde/60" : "border-light-gray-2"
        )}
      >
        <span
          aria-hidden="true"
          className={clsx(
            "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-light-gray-2 bg-light-gray-0 font-mono",
            passado && "text-light-gray-6"
          )}
        >
          <span className="text-xl font-bold leading-none">
            {formatoDiaCurto.format(inicio)}
          </span>
          <span className="text-[11px] uppercase text-light-gray-6">
            {formatoMesCurto.format(inicio).replace(".", "")}
          </span>
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate font-semibold">{e.nome}</span>
            {aDecorrer && (
              <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-marca-verde">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-marca-verde" />
                agora
              </span>
            )}
          </span>
          <span className="font-mono text-xs text-light-gray-6">
            <span className="sr-only">{formatarDatas(e.inicio, e.fim)} · </span>
            {e.tipo}
            {e.gratuito && <span className="text-marca-verde"> · grátis</span>}
          </span>
        </span>

        <span className="hidden shrink-0 font-mono text-sm text-light-gray-6 sm:block">
          {local(e)}
        </span>
      </a>
    </li>
  );
}
