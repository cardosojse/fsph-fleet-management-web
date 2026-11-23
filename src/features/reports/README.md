# Relatórios

A página usa a rota `/relatorios` e a sessão autenticada da API. Em desenvolvimento,
inicie o backend compatível e aponte `VITE_API_PROXY_TARGET` para a origem da API
(o proxy do Vite usa `http://localhost:8080` por padrão).

## SVO

- Disponibilidade da frota e frota por status.
- Triagem e alocação, solicitações por dia e viagens em andamento.
- Consumo por veículo, abastecimentos recentes e alertas de manutenção.
- Relatório geral com as oito seções.

O frontend consulta `/api/v1/reports/svo/<indicador>` ou
`/api/v1/reports/svo/general`. O backend autoriza cada consulta e exportação com
as permissões das fontes de dados. Para viagens em andamento e para o geral,
os filtros de período e setor seguem o contrato do backend.

A impressão usa a prévia consultada. PDF e Excel usam a mesma consulta por
`snapshotId`. Uma mudança nos filtros requer uma nova consulta para habilitar as
ações. Se o snapshot expirar, consulte novamente.

## Abastecimentos existente

O relatório individual preexistente usa `/api/v1/reports/fuelings`, filtre por
datas e consulte com um perfil autorizado com `FUELINGS_READ`. A impressão usa a
resposta JSON. As exportações reenviam os filtros aplicados, pois esse endpoint
usa um contrato anterior ao snapshot. Os demais relatórios gerenciais de frota
ficam para uma etapa futura.
