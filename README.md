# fsph-fleet-management-web

Frontend do sistema de gestão de frotas da FSPH.

## Requisitos

- Node.js 24;
- pnpm 11;
- API `fsph-fleet-management` disponível em `http://localhost:8080` para integração local.

O projeto declara as versões de runtime em `.nvmrc`, `.node-version` e `package.json`.

## Início rápido

```bash
cp .env.example .env
pnpm install
pnpm dev
```

O frontend será servido em `http://localhost:5173`. As chamadas iniciadas em `/api` são encaminhadas pelo Vite para `VITE_API_PROXY_TARGET`, evitando CORS no desenvolvimento.

## Scripts

- `pnpm dev`: servidor de desenvolvimento;
- `pnpm build`: typecheck e build de produção;
- `pnpm lint`: análise estática;
- `pnpm format:check`: valida formatação;
- `pnpm test`: testes unitários e de componentes;
- `pnpm test:e2e`: testes Playwright;
- `pnpm api:generate`: gera os tipos TypeScript a partir do OpenAPI da API.

Para gerar o contrato com outra URL:

```bash
OPENAPI_URL=https://api.exemplo/v3/api-docs pnpm api:generate
```

O contrato em `src/shared/api/generated/schema.d.ts` é versionado para que builds sejam reproduzíveis. O arquivo inicial é apenas um contrato vazio; execute a geração com a API atualizada e revise o diff antes de implementar os módulos de negócio.

## Arquitetura

```text
src/
  app/          # providers, router, tema e composição global
  features/     # funcionalidades organizadas por domínio
  shared/       # cliente HTTP, componentes e utilitários reutilizáveis
  test/         # configuração de testes
e2e/            # cenários Playwright
```

Estado remoto pertence ao TanStack Query. Estado de formulário pertence ao React Hook Form. Dados efêmeros de interface devem permanecer locais ao componente sempre que possível.

## API e autenticação

O cliente `openapi-fetch` adiciona automaticamente `Authorization: Bearer` quando existe token no `sessionStorage`. O armazenamento atual é compatível com o contrato JWT da API e deve ser revisto se o backend adotar cookie `HttpOnly` ou BFF.

Erros da API devem ser normalizados com `parseProblemDetail`, preservando `code`, `detail` e as violações por campo.

## Docker

Para gerar a imagem e servir o frontend com Nginx:

```bash
docker compose up --build
```

Por padrão, o frontend estará em `http://localhost:8081` e o Nginx encaminhará `/api` para o backend em `http://host.docker.internal:8080`.

As variáveis `FRONTEND_PORT` e `BACKEND_UPSTREAM` permitem alterar esses endereços.

## Qualidade

A CI executa formatação, lint, typecheck, testes, build e Playwright. Dependências npm e GitHub Actions são monitoradas pelo Dependabot.
