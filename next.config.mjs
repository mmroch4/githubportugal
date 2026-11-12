import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A página /projetos lê data/projetos.yml quando volta a ser gerada no servidor.
  outputFileTracingIncludes: {
    "/projetos": ["./data/projetos.yml"],
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
