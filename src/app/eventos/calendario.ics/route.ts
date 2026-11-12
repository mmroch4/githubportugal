import { siteUrl } from "@/config/metadata";
import { lerEventos, type Evento } from "@/lib/eventos";

// O calendário só muda quando data/eventos.yml muda, mas volta a ser gerado
// de hora a hora, como a página da agenda.
export const revalidate = 3600;

/** Escapa texto para o formato iCalendar (RFC 5545). */
function escapar(texto: string) {
  return texto
    .replace(/\\/g, "\\\\")
    .replace(/;/g, ";")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Divide linhas com mais de 75 octetos, como pede a RFC 5545. */
function dobrar(linha: string) {
  const bytes = new TextEncoder().encode(linha);
  if (bytes.length <= 75) return linha;

  const partes: string[] = [];
  let atual = "";
  let tamanho = 0;
  for (const caractere of linha) {
    const t = new TextEncoder().encode(caractere).length;
    const limite = partes.length === 0 ? 75 : 74;
    if (tamanho + t > limite) {
      partes.push(atual);
      atual = "";
      tamanho = 0;
    }
    atual += caractere;
    tamanho += t;
  }
  partes.push(atual);
  return partes.join("\r\n ");
}

const dataICS = (d: string) => d.replace(/-/g, "");

/** No iCalendar, a data de fim de um evento de dia inteiro é exclusiva. */
function diaSeguinte(d: string) {
  const data = new Date(`${d}T00:00:00Z`);
  data.setUTCDate(data.getUTCDate() + 1);
  return data.toISOString().slice(0, 10);
}

function vevent(e: Evento, carimbo: string) {
  const local = e.formato === "online" ? "Online" : `${e.cidade}, Portugal`;
  return [
    "BEGIN:VEVENT",
    `UID:${e.id}@githubportugal.com`,
    `DTSTAMP:${carimbo}`,
    `DTSTART;VALUE=DATE:${dataICS(e.inicio)}`,
    `DTEND;VALUE=DATE:${dataICS(diaSeguinte(e.fim))}`,
    `SUMMARY:${escapar(e.nome)}`,
    `DESCRIPTION:${escapar(`${e.descricao}\n\n${e.site}`)}`,
    `LOCATION:${escapar(local)}`,
    `URL:${e.site}`,
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
  ];
}

export async function GET() {
  const { eventos } = await lerEventos();
  const carimbo =
    new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";

  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GitHub Portugal//Agenda de eventos//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Eventos tech em Portugal (GitHub Portugal)",
    `X-WR-CALDESC:${escapar(
      `Agenda de eventos tech em Portugal: ${siteUrl}/eventos`
    )}`,
    "X-WR-TIMEZONE:Europe/Lisbon",
    ...eventos.flatMap((e) => vevent(e, carimbo)),
    "END:VCALENDAR",
  ];

  return new Response(linhas.map(dobrar).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="eventos-githubportugal.ics"',
    },
  });
}
