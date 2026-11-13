/**
 * Cabeçalho das páginas (design v2): etiqueta mono, título e, à direita, as
 * ações. Sem parágrafo de descrição: a descrição fica nos metadados.
 */
export function CabecalhoPagina({
  etiqueta,
  titulo,
  children,
}: {
  /** Sem as barras: "23 projetos" aparece como "// 23 projetos". */
  etiqueta: string;
  titulo: string;
  /** Botões ou ligações à direita do título. */
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="flex min-w-0 flex-col gap-3">
        <p className="etiqueta">{`// ${etiqueta}`}</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          {titulo}
        </h1>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </header>
  );
}
