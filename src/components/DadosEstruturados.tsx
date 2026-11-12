/**
 * Dados estruturados (JSON-LD) para motores de pesquisa e assistentes de IA.
 * O `<` é escapado para que nenhum texto vindo dos dados feche a tag <script>.
 */
export function DadosEstruturados({ dados }: { dados: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(dados).replace(/</g, "\\u003c"),
      }}
    />
  );
}
