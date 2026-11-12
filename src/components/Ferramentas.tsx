import { Pesquisa } from "@/components/Pesquisa";
import { BotaoTema } from "@/components/Tema";

const botaoClassName =
  "flex h-11 w-11 items-center justify-center rounded-full border border-light-gray-3 bg-white shadow-md hover:bg-light-gray-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-light-blue-4";

/** Botões fixos no canto do ecrã: pesquisa global e escolha do tema. */
export function Ferramentas() {
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 print:hidden">
      <Pesquisa botaoClassName={botaoClassName} />
      <BotaoTema className={botaoClassName} />
    </div>
  );
}
