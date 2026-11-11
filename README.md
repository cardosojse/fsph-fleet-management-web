# fsph-fleet-management-web

Frontend do sistema de gestão de frotas da FSPH.

## Requisitos

- Node.js 24;
- pnpm 11;
- API da pasta `../gestao-frotas` disponível em `http://localhost:8081` para integração local.

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

O contrato em `src/shared/api/generated/schema.d.ts` é versionado para builds reproduzíveis. Por padrão, `pnpm api:generate` usa `openapi/gestao-frotas.json`, um snapshot dos controllers, records e enums de `../gestao-frotas`, sem precisar de banco ou backend em execução.

Para atualizar esse snapshot após uma alteração no backend:

```bash
pnpm api:snapshot
pnpm api:generate
# Outra localização do backend:
pnpm api:snapshot C:/caminho/gestao-frotas
```

O extrator offline suporta os padrões atuais de records e controllers; não substitui o Springdoc. Para validar o contrato publicado, use `OPENAPI_URL=http://localhost:8081/v3/api-docs pnpm api:generate` (PowerShell: `$env:OPENAPI_URL='http://localhost:8081/v3/api-docs'; pnpm api:generate`). A variável não é carregada automaticamente do `.env` pelo script Node. Revise o diff ao atualizar o contrato.

## Telas integradas

- `/login`: autenticação JWT; `/conta`: usuário atual e alteração da própria senha;
- `/setores`: listagem, criação, edição e exclusão;
- `/usuarios`: cadastro, edição, senha, desativação e reativação;
- `/veiculos`: cadastro, edição, quilometragem, desativação e histórico de documentos;
- `/motoristas`: vínculo com usuário motorista, desativação e histórico de CNHs;
- `/transportes`: solicitação, filtros, paginação, detalhes e cancelamento;
- `/viagens`: planejamento, filtros, paginação, reagendamento, paradas, início e conclusão com quilometragem;
- `/permissoes`: consulta e substituição das permissões por perfil (ADMIN é fixo).

Inicie o backend conforme o README de `gestao-frotas` e use as credenciais cadastradas nele. Nenhum dado de demonstração é usado no aplicativo. Um `401` encerra a sessão local; erros `403`, conflitos e violações de validação são apresentados na tela. As consultas são atualizadas após alterações.

`/auth/me` retorna o perfil, mas não as permissões efetivas. Como a matriz pode ser personalizada, a interface não presume permissões por perfil: o backend autoriza cada operação e a tela informa quando o acesso é restrito. Se a consulta auxiliar de setores, usuários ou frota for restrita, os formulários permitem informar o identificador necessário.

Os três filtros `GET /api/v1/drivers/find/{status|role|sector}` estão ambíguos no backend e o parâmetro `active` não corresponde a `{status}`. Eles foram excluídos do snapshot e do cliente; a tela usa `GET /api/v1/drivers` com busca local. Isso precisa ser corrigido no backend antes de integrar esses endpoints. Os demais endpoints dos controllers possuem serviços tipados.

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

Por padrão, o frontend estará em `http://localhost:8082` e o Nginx encaminhará `/api` para o backend em `http://host.docker.internal:8081`, evitando conflito com a porta do Spring Boot.

As variáveis `FRONTEND_PORT` e `BACKEND_UPSTREAM` permitem alterar esses endereços.

## Qualidade

A CI executa formatação, lint, typecheck, testes, build e Playwright. Dependências npm e GitHub Actions são monitoradas pelo Dependabot.

## Deploy e desempenho

Consulte [as medições de build, carregamento por rota e login de staging](docs/performance-staging.md).
