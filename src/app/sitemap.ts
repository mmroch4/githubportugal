import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://githubportugal.com/" },
    { url: "https://githubportugal.com/projetos" },
    { url: "https://githubportugal.com/sobre" },
  ];
}
