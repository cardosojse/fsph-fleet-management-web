# Prévia isolada das telas existentes

Publicada em 06/11/2026 na branch `chore/preview-integracao-telas` de cada repositório.

- Login: <https://fsph-fleet-web-staging.vercel.app/login>.
- API: <https://fsph-fleet-api-staging.onrender.com>.
- Frontend publicado: `0fc89e4`, no fork autorizado
  `BarbosaDev01/fsph-fleet-management-web-deploy`.
- Backend publicado: `035bd54`, no repositório oficial.
- Deploy Vercel: `dpl_3Y5TuXiBWznps7ksycMi2xUDvPiw`, Ready.
- Deploy Render: `dep-dbn10k5fbbac73boge00`, live.

## Origem das telas e preservação

As telas já existiam como trabalho local em `feat/conexão-telas`. Foram copiadas
para um novo worktree, com autorização do usuário, antes dos ajustes de integração.
O conteúdo original foi arquivado e foram comparados hashes SHA-256 de 75 arquivos
do frontend e 189 do backend. Os 264 arquivos, índices, estados Git, branches
ativas e referências de `main` permaneceram inalterados. As branches anteriores
`chore/deploy-vercel`, `chore/deploy-render` e `docs/route-architecture` foram preservadas.

Os ajustes desta branch mantêm a configuração Vercel, adicionam suporte a
`VITE_API_URL`, sincronizam as permissões com o backend combinado e preservam
as páginas, layouts e chamadas de API existentes. Os arquivos privados de
validação ficam fora do Git e do upload Vercel.

## Backend correspondente

Os endpoints `/api/v1/transports` e `/api/v1/routes` já estavam implementados em
`docs/route-architecture`, commit `57dac36`. Foram integrados à cópia do backend
publicado, mantendo também os módulos existentes de viagens, solicitações,
manutenção, abastecimento e notificações.

As migrations anteriores foram preservadas. Os novos módulos usam as versões
V20–V24, com permissões combinadas. A prévia usa o novo banco `fleet_ui_preview`
na branch Neon de homologação; o banco `fleet_staging` anterior e a produção
permaneceram intactos. Foram aplicadas 23 migrations, até a versão 24.

## Validação pública

- Backend: 158 testes sem falhas nos relatórios finais; após a execução completa,
  foi reexecutada a classe de transportes/rotas ajustada para V20–V24. JAR gerado.
- Frontend: build, lint e 14 testes unitários passaram.
- O teste real no navegador passou nas URLs Vercel/Render, sem simular respostas.
- Verificados login, início, conta, setores, usuários, veículos, documentos,
  motoristas, CNHs, transportes e seu detalhe, viagens e seu detalhe e permissões.
- Cada tela consultou seu endpoint real com HTTP 200; criação e exclusão de um
  setor pela interface e logout também passaram. O setor temporário foi removido.
- As capturas de login e início foram inspecionadas visualmente.

O banco contém somente dados de demonstração desta prévia: setor, motorista,
veículo, documento, CNH, transporte, viagem planejada e parada. As credenciais
de acesso estão no arquivo local ignorado
`.deploy-validation/acesso-preview.local.txt`; não estão neste documento nem em commits.

Os serviços compartilhados anteriores da equipe foram preservados. Foram usados
somente o projeto Vercel e o serviço Render de homologação criados nesta tarefa,
com deploys automáticos desligados. Não houve merge em `main`.

**Retenção:** a branch Neon expira em 12/11/2026 às 16h, America/Fortaleza.
O ambiente depende de ajustar essa retenção para continuar após a data.
