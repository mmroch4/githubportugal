import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Estas páginas leem os ficheiros de data/ quando voltam a ser geradas no servidor.
  outputFileTracingIncludes: {
    "/projetos": ["./data/projetos.yml"],
    "/eventos": ["./data/eventos.yml"],
    "/eventos/calendario.ics": ["./data/eventos.yml"],
    "/comunidades": ["./data/comunidades.yml"],
    "/artigos": ["./src/content/artigos/*.mdx"],
  },
};

const withMDX = createMDX({
  options: {
    // Tira o cabeçalho (frontmatter) dos artigos do texto; é lido em src/lib/artigos.ts.
    remarkPlugins: ["remark-frontmatter"],
  },
});

export default withMDX(nextConfig);
