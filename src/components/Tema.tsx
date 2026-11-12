"use client";

import { DeviceDesktopIcon, MoonIcon, SunIcon } from "@primer/octicons-react";
import { useEffect, useSyncExternalStore } from "react";

export type Tema = "sistema" | "claro" | "escuro";

const CHAVE = "tema";
const SEGUINTE: Record<Tema, Tema> = {
  escuro: "claro",
  claro: "sistema",
  sistema: "escuro",
};
const NOMES: Record<Tema, string> = {
  sistema: "do sistema",
  claro: "claro",
  escuro: "escuro",
};

/**
 * Script que corre antes da página aparecer, para aplicar o tema guardado sem
 * um flash do tema errado. O site é escuro por omissão; "sistema" segue o tema
 * do sistema operativo.
 */
export const scriptTema = `(function(){try{var t=localStorage.getItem("${CHAVE}");var e=t!=="claro"&&(t!=="sistema"||window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",e)}catch(_){}})()`;

function lerTema(): Tema {
  try {
    const t = localStorage.getItem(CHAVE);
    return t === "claro" || t === "sistema" ? t : "escuro";
  } catch {
    return "escuro";
  }
}

const EVENTO = "mudanca-tema";

function subscrever(avisar: () => void) {
  window.addEventListener("storage", avisar);
  window.addEventListener(EVENTO, avisar);
  return () => {
    window.removeEventListener("storage", avisar);
    window.removeEventListener(EVENTO, avisar);
  };
}

function aplicar(tema: Tema) {
  const escuro =
    tema === "escuro" ||
    (tema === "sistema" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", escuro);
}

/** Botão que alterna entre o tema do sistema, claro e escuro. */
export function BotaoTema({ className }: { className?: string }) {
  // null no servidor: o tema só é conhecido no browser.
  const tema = useSyncExternalStore<Tema | null>(
    subscrever,
    lerTema,
    () => null
  );

  useEffect(() => {
    if (tema === null) return;
    aplicar(tema);
    if (tema !== "sistema") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const mudou = () => aplicar("sistema");
    media.addEventListener("change", mudou);
    return () => media.removeEventListener("change", mudou);
  }, [tema]);

  const mudar = () => {
    const novo = SEGUINTE[tema ?? "escuro"];
    try {
      if (novo === "escuro") localStorage.removeItem(CHAVE);
      else localStorage.setItem(CHAVE, novo);
    } catch {}
    aplicar(novo);
    window.dispatchEvent(new Event(EVENTO));
  };

  const atual = tema ?? "escuro";
  const Icone =
    atual === "claro"
      ? SunIcon
      : atual === "escuro"
      ? MoonIcon
      : DeviceDesktopIcon;
  const rotulo = `Tema ${NOMES[atual]}. Mudar para o tema ${
    NOMES[SEGUINTE[atual]]
  }`;

  return (
    <button
      type="button"
      onClick={mudar}
      className={className}
      aria-label={rotulo}
      title={rotulo}
    >
      <Icone className="fill-current" />
    </button>
  );
}
