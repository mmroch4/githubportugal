import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-light-gray-2 bg-white/60 shadow-2xl shadow-black/20">
        <div aria-hidden className="flex gap-2 border-b border-light-gray-2 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-light-gray-3" />
          <span className="h-2.5 w-2.5 rounded-full bg-light-gray-3" />
          <span className="h-2.5 w-2.5 rounded-full bg-light-gray-3" />
        </div>
        <div className="flex flex-col gap-3 p-6 font-mono text-[15px] text-light-gray-8">
          <p>
            <span className="text-marca-verde">$</span> cd /esta-página
          </p>
          <h1 className="text-marca-vermelho">404: página não encontrada</h1>
          <p className="mt-2">
            <span className="text-marca-verde">$</span> cd ~
          </p>
          <Link href="/" className="botao-primario mt-2 self-start font-sans">
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}
