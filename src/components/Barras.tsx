import { formatoNumero } from "@/lib/formatar";

const numeroCompleto = new Intl.NumberFormat("pt-PT", {
  useGrouping: "always",
});

/**
 * Lista de barras horizontais simples (rótulo, barra, número), relativas ao
 * maior valor. Uma só cor: é sempre a mesma série.
 */
export function Barras({
  itens,
  compacto = false,
}: {
  itens: { rotulo: string; valor: number }[];
  /** Números grandes em formato curto ("2 mil"). */
  compacto?: boolean;
}) {
  const maximo = Math.max(1, ...itens.map((i) => i.valor));
  return (
    <ul className="space-y-3">
      {itens.map((i) => (
        <li
          key={i.rotulo}
          className="grid grid-cols-[6.5rem_minmax(0,1fr)_3.5rem] items-center gap-3 text-sm"
        >
          <span className="truncate text-light-gray-8">{i.rotulo}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-light-gray-1">
            <span
              className="block h-full rounded-full bg-marca-verde"
              style={{ width: `${Math.round((i.valor / maximo) * 100)}%` }}
            />
          </span>
          <span className="text-right font-mono tabular-nums text-light-gray-6">
            {(compacto ? formatoNumero : numeroCompleto).format(i.valor)}
          </span>
        </li>
      ))}
    </ul>
  );
}
