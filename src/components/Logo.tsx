import clsx from "clsx";
import Image from "next/image";

type LogoProps = {
  className?: string;
  /** Tamanho em píxeis (largura = altura). */
  size?: number;
  priority?: boolean;
  /** Texto alternativo; usa "" quando o nome já aparece ao lado. */
  alt?: string;
};

export function Logo({
  className,
  size = 96,
  priority,
  alt = "Logótipo do GitHub Portugal",
}: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      unoptimized
      className={clsx("select-none", className)}
    />
  );
}
