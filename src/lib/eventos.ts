import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";

const FICHEIRO_EVENTOS = path.join(process.cwd(), "data", "eventos.yml");

export type FormatoEvento = "presencial" | "online" | "híbrido";

export type Evento = {
  /** Identificador estável, usado no calendário (.ics). */
  id: string;
  nome: string;
  descricao: string;
  tipo: string;
  /** AAAA-MM-DD */
  inicio: string;
  /** AAAA-MM-DD, igual a `inicio` em eventos de um só dia. */
  fim: string;
  cidade: string;
  formato: FormatoEvento;
  gratuito: boolean;
  site: string;
};

type EntradaEvento = {
  nome: string;
  descricao: string;
  tipo: string;
  inicio: string;
  fim?: string;
  cidade: string;
  formato?: FormatoEvento;
  gratuito?: boolean;
  site: string;
};

/** Data de hoje em Portugal continental, no formato AAAA-MM-DD. */
export function hojeEmPortugal(agora = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
}

function slug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function lerEventos(): Promise<{
  eventos: Evento[];
  tipos: string[];
}> {
  const conteudo = await readFile(FICHEIRO_EVENTOS, "utf8");
  const dados = parse(conteudo) as {
    tipos?: string[];
    eventos?: EntradaEvento[];
  };

  const eventos = (dados?.eventos ?? []).map((e) => ({
    id: `${e.inicio}-${slug(e.nome)}`,
    nome: e.nome,
    descricao: e.descricao,
    tipo: e.tipo,
    inicio: String(e.inicio),
    fim: String(e.fim ?? e.inicio),
    cidade: e.cidade,
    formato: e.formato ?? "presencial",
    gratuito: e.gratuito === true,
    site: e.site,
  }));

  eventos.sort(
    (a, b) =>
      a.inicio.localeCompare(b.inicio) || a.nome.localeCompare(b.nome, "pt-PT")
  );

  return { eventos, tipos: dados?.tipos ?? [] };
}

export type Agenda = {
  /** Eventos a decorrer hoje ou futuros, do mais próximo para o mais distante. */
  proximos: Evento[];
  /** Eventos que já terminaram, do mais recente para o mais antigo. */
  passados: Evento[];
  tipos: string[];
  hoje: string;
};

export async function obterAgenda(agora = new Date()): Promise<Agenda> {
  const { eventos, tipos } = await lerEventos();
  const hoje = hojeEmPortugal(agora);

  return {
    proximos: eventos.filter((e) => e.fim >= hoje),
    passados: eventos.filter((e) => e.fim < hoje).reverse(),
    tipos,
    hoje,
  };
}

const formatoDia = new Intl.DateTimeFormat("pt-PT", {
  day: "numeric",
  timeZone: "UTC",
});
const formatoDiaMes = new Intl.DateTimeFormat("pt-PT", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const formatoCompleto = new Intl.DateTimeFormat("pt-PT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const formatoMes = new Intl.DateTimeFormat("pt-PT", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const data = (d: string) => new Date(`${d}T00:00:00Z`);

/** "14 de novembro de 2026", "17 a 20 de novembro de 2026" ou "30 de abril a 2 de maio de 2027". */
export function formatarDatas(inicio: string, fim: string) {
  if (inicio === fim) return formatoCompleto.format(data(inicio));
  const [ai, mi] = inicio.split("-");
  const [af, mf] = fim.split("-");
  if (ai === af && mi === mf) {
    return `${formatoDia.format(data(inicio))} a ${formatoCompleto.format(
      data(fim)
    )}`;
  }
  if (ai === af) {
    return `${formatoDiaMes.format(data(inicio))} a ${formatoCompleto.format(
      data(fim)
    )}`;
  }
  return `${formatoCompleto.format(data(inicio))} a ${formatoCompleto.format(
    data(fim)
  )}`;
}

/** "novembro de 2026", para agrupar a agenda por mês. */
export function mesDe(inicio: string) {
  return formatoMes.format(data(`${inicio.slice(0, 7)}-01`));
}
