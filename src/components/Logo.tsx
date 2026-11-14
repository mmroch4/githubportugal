import clsx from "clsx";
import {
  CHAVETA_DIREITA,
  CHAVETA_ESQUERDA,
  ESPESSURA_CHAVETAS,
  LOGOTIPO_VIEWBOX,
  QUINAS,
} from "@/lib/logotipo";

type LogoProps = {
  className?: string;
  /** Tamanho em píxeis (largura = altura). */
  size?: number;
  /** Mantido por compatibilidade: o SVG vai no HTML, não há nada a carregar. */
  priority?: boolean;
  /** Texto alternativo; usa "" quando o nome já aparece ao lado. */
  alt?: string;
};

/**
 * Logótipo em SVG no próprio HTML: as chavetas usam as cores da marca do tema
 * e as quinas a cor do texto, por isso fica bem em claro e em escuro.
 */
export function Logo({
  className,
  size = 96,
  alt = "Logótipo do GitHub Portugal",
}: LogoProps) {
  const traco = {
    fill: "none",
    strokeWidth: ESPESSURA_CHAVETAS,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg
      viewBox={LOGOTIPO_VIEWBOX}
      width={size}
      height={size}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={clsx("shrink-0 select-none text-light-black", className)}
    >
      <path d={CHAVETA_ESQUERDA} stroke="hsl(var(--marca-verde))" {...traco} />
      <path
        d={CHAVETA_DIREITA}
        stroke="hsl(var(--marca-vermelho))"
        {...traco}
      />
      <path d={QUINAS} fill="currentColor" />
    </svg>
  );
}
