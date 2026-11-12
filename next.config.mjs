import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Estas páginas leem os ficheiros de data/ quando voltam a ser geradas no servidor.
  outputFileTracingIncludes: {
    "/projetos": ["./data/projetos.yml"],
    "/eventos": ["./data/eventos.yml"],
    "/eventos/calendario.ics": ["./data/eventos.yml"],
    "/comunidades": ["./data/comunidades.yml"],
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
