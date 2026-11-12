# Como contribuir

Obrigado pelo interesse em contribuir para o GitHub Portugal! Todas as contribuições são bem-vindas: correções de texto, melhorias de design, novas funcionalidades ou sugestões de projetos e mantenedores portugueses.

## Antes de começar

- Procura nas [issues](https://github.com/GitHub-Portugal/website/issues) se já existe algo sobre o mesmo tema.
- Para alterações grandes, abre primeiro uma issue para discutirmos a ideia.
- Os textos do site estão em **português de Portugal** (pt-PT). Evita formas do português do Brasil (por exemplo, "partilhar" em vez de "compartilhar", "ficheiro" em vez de "arquivo").

## Correr o projeto localmente

Precisas do [Node.js](https://nodejs.org/) 20.9 ou superior e do [Yarn](https://classic.yarnpkg.com/) 1.x.

```bash
git clone https://github.com/GitHub-Portugal/website.git
cd website
yarn install
yarn dev
```

O site fica disponível em <http://localhost:3000>.

Antes de abrires um pull request, confirma que o projeto compila e que o lint passa:

```bash
yarn lint
yarn build
```

## Estrutura

- `src/app/` — páginas (App Router do Next.js). A página "Sobre" está em `src/app/sobre/about.mdx`.
- `src/components/` — componentes reutilizáveis.
- `src/config/metadata.ts` — metadados do site e links da comunidade (Discord, WhatsApp, repositório).

## Abrir um pull request

1. Faz um fork do repositório e cria um ramo a partir do `main`.
2. Faz as tuas alterações em commits pequenos e com mensagens claras.
3. Abre um pull request a explicar o que mudou e porquê. Se a alteração for visual, junta uma captura de ecrã.

## Sugerir projetos ou mantenedores

Conheces um projeto open source mantido por portugueses? Abre uma issue com o nome do projeto, o link para o repositório e uma breve descrição. Em breve vamos ter uma forma estruturada de adicionar projetos diretamente por pull request.

## Comunidade

Tens dúvidas? Fala connosco no [Discord](https://discord.com/invite/cnJdppDkUp) ou no [WhatsApp](https://chat.whatsapp.com/EfKv6GPEgd89XgYXhiAhFk).
