import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { siteUrl } from "@/config/metadata";
import {
  COR,
  assinaturaValida,
  cortar,
  escapar,
  normalizar,
  type Embed,
} from "@/lib/discord";
import { formatarDatas, obterAgenda } from "@/lib/eventos";
import { obterRanking } from "@/lib/ranking";
import { AMBITOS, type Ambito, type Metrica } from "@/lib/ranking-tipos";

// Endpoint de interações do bot do Discord (comandos /ranking, /evento e
// /projeto). O URL deste endpoint fica configurado no Discord Developer Portal,
// em "Interactions Endpoint URL". Os comandos estão em scripts/discord/comandos.mjs.

export const dynamic = "force-dynamic";

const PING = 1;
const COMANDO = 2;
const PONG = 1;
const MENSAGEM = 4;
/** Mensagem que só quem escreveu o comando vê. */
const EFEMERA = 64;

type Opcao = { name: string; value: string | number | boolean };
type Interacao = {
  type: number;
  data?: { name: string; options?: Opcao[] };
};

const formatoInteiro = new Intl.NumberFormat("pt-PT");

function opcao(interacao: Interacao, nome: string) {
  const valor = interacao.data?.options?.find((o) => o.name === nome)?.value;
  return typeof valor === "string" ? valor : "";
}

function responder(embeds: Embed[], efemera = false) {
  return Response.json({
    type: MENSAGEM,
    data: {
      embeds,
      allowed_mentions: { parse: [] },
      ...(efemera ? { flags: EFEMERA } : {}),
    },
  });
}

function aviso(texto: string) {
  return responder([{ description: texto, color: COR }], true);
}

async function comandoRanking(interacao: Interacao) {
  const pedido = opcao(interacao, "cidade");
  const ambito = AMBITOS.find((a) => a.id === pedido) ?? AMBITOS[0];
  const metrica: Metrica =
    opcao(interacao, "ordem") === "seguidores" ? "seguidores" : "contribuicoes";

  const ranking = await obterRanking();
  const lista = ranking.listas[ambito.id as Ambito][metrica].slice(0, 10);
  if (lista.length === 0) {
    return aviso("Ainda não há dados do ranking. Volta a tentar mais tarde.");
  }

  const unidade = metrica === "seguidores" ? "seguidores" : "contribuições";
  const linhas = lista.map((login, i) => {
    const pessoa = ranking.pessoas[login];
    const nome = pessoa.nome ? `${escapar(pessoa.nome)} (${login})` : login;
    return `**${
      i + 1
    }.** [${nome}](https://github.com/${login}) · ${formatoInteiro.format(
      pessoa[metrica]
    )} ${unidade}`;
  });

  const parametros = new URLSearchParams();
  if (ambito.id !== "pais") parametros.set("cidade", ambito.id);
  if (metrica === "seguidores") parametros.set("ordem", "seguidores");
  const consulta = parametros.toString();

  return responder([
    {
      title: `Ranking do GitHub: ${ambito.nome}`,
      url: `${siteUrl}/ranking${consulta ? `?${consulta}` : ""}`,
      description: linhas.join("\n"),
      color: COR,
      footer: {
        text:
          metrica === "seguidores"
            ? "Ordenado por seguidores"
            : "Ordenado por contribuições públicas no último ano",
      },
    },
  ]);
}

async function comandoEvento(interacao: Interacao) {
  const cidade = normalizar(opcao(interacao, "cidade"));
  const tipo = opcao(interacao, "tipo");
  const { proximos } = await obterAgenda();

  const eventos = proximos
    .filter((e) => !tipo || e.tipo === tipo)
    .filter((e) => !cidade || normalizar(e.cidade).includes(cidade))
    .slice(0, 5);

  if (eventos.length === 0) {
    return aviso(
      `Não encontrei eventos com esses filtros. Vê a agenda completa em ${siteUrl}/eventos, ou adiciona um evento que conheças.`
    );
  }

  return responder([
    {
      title: "Próximos eventos tech em Portugal",
      url: `${siteUrl}/eventos`,
      color: COR,
      fields: eventos.map((e) => ({
        name: cortar(e.nome, 256),
        value: cortar(
          [
            `${formatarDatas(e.inicio, e.fim)} · ${escapar(e.cidade)}`,
            [
              e.tipo,
              e.formato !== "presencial" ? e.formato : "",
              e.gratuito ? "gratuito" : "",
            ]
              .filter(Boolean)
              .join(" · "),
            `[Site do evento](${e.site})`,
          ].join("\n"),
          1024
        ),
      })),
      footer: {
        text: "Agenda completa e calendário em githubportugal.com/eventos",
      },
    },
  ]);
}

type EntradaProjeto = {
  repositorio: string;
  descricao: string;
  categoria: string;
  site?: string;
};

async function comandoProjeto(interacao: Interacao) {
  const pesquisa = opcao(interacao, "pesquisa").trim();
  const termo = normalizar(pesquisa);
  if (!termo) return aviso("Escreve o que queres procurar.");

  const conteudo = await readFile(
    path.join(process.cwd(), "data", "projetos.yml"),
    "utf8"
  );
  const projetos =
    (parse(conteudo) as { projetos?: EntradaProjeto[] })?.projetos ?? [];

  const encontrados = projetos
    .map((p) => {
      const repo = normalizar(p.repositorio);
      const pontos =
        repo.split("/")[1] === termo
          ? 3
          : repo.includes(termo)
          ? 2
          : normalizar(`${p.categoria} ${p.descricao}`).includes(termo)
          ? 1
          : 0;
      return { p, pontos };
    })
    .filter(({ pontos }) => pontos > 0)
    .sort((a, b) => b.pontos - a.pontos);

  const urlDiretorio = `${siteUrl}/projetos?q=${encodeURIComponent(pesquisa)}`;
  if (encontrados.length === 0) {
    return aviso(
      `Não encontrei projetos para "${escapar(
        cortar(pesquisa, 60)
      )}". Conheces um projeto português que falte? Adiciona-o: ${siteUrl}/projetos`
    );
  }

  const mostrados = encontrados.slice(0, 5);
  return responder([
    {
      title: `Projetos para "${cortar(pesquisa, 60)}"`,
      url: urlDiretorio,
      color: COR,
      fields: mostrados.map(({ p }) => ({
        name: p.repositorio,
        value: cortar(
          `${escapar(p.descricao)}\n${
            p.categoria
          } · [GitHub](https://github.com/${p.repositorio})${
            p.site ? ` · [Site](${p.site})` : ""
          }`,
          1024
        ),
      })),
      footer:
        encontrados.length > mostrados.length
          ? {
              text: `E mais ${
                encontrados.length - mostrados.length
              } no diretório.`,
            }
          : undefined,
    },
  ]);
}

export async function POST(pedido: Request) {
  const chavePublica = process.env.DISCORD_PUBLIC_KEY;
  if (!chavePublica) {
    return new Response("O bot do Discord não está configurado.", {
      status: 503,
    });
  }

  const corpo = await pedido.text();
  const valida = assinaturaValida(
    corpo,
    pedido.headers.get("x-signature-ed25519"),
    pedido.headers.get("x-signature-timestamp"),
    chavePublica
  );
  if (!valida) return new Response("Assinatura inválida.", { status: 401 });

  let interacao: Interacao;
  try {
    interacao = JSON.parse(corpo) as Interacao;
  } catch {
    return new Response("Pedido inválido.", { status: 400 });
  }

  if (interacao.type === PING) return Response.json({ type: PONG });

  if (interacao.type === COMANDO) {
    try {
      switch (interacao.data?.name) {
        case "ranking":
          return await comandoRanking(interacao);
        case "evento":
          return await comandoEvento(interacao);
        case "projeto":
          return await comandoProjeto(interacao);
      }
    } catch (erro) {
      console.error("Erro no comando do Discord", erro);
      return aviso("Algo correu mal. Tenta outra vez daqui a pouco.");
    }
    return aviso("Não conheço esse comando.");
  }

  return new Response("Tipo de interação não suportado.", { status: 400 });
}
