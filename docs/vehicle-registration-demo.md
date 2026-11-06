# Cadastro demonstrativo de veículos

O cadastro em `/veiculos/novo` usa exclusivamente o `FleetDataProvider`. Recarregar a página restaura os registros iniciais. Não há endpoints, upload de documentos, transações financeiras ou integração com escalas.

## Suposições locais

- Placas: formatos antigo (`ABC-1234`) e Mercosul (`ABC1D23`), com hífen opcional. A comparação ignora hífen e caixa; os novos registros são armazenados sem hífen.
- Ano: inteiro entre 1900 e o próximo ano. É uma convenção demonstrativa, não uma definição regulatória.
- Status: preserva `Ativo`, `Manutenção` e `Inativo`. Cadastrar um veículo não cria nem atribui rotas.
- Capacidade e ocupação: inteiros que incluem o motorista. Não há limite específico por setor ou categoria sem contrato definido. Quilometragem é informada em quilômetros inteiros; não se verifica regressão em um cadastro novo sem leitura anterior.
- CRLV, seguro e carta: a data informada deve ser igual ou posterior ao dia atual em `America/Sao_Paulo`. Isso não comprova autenticidade documental. Os campos de CRLV e seguro são obrigatórios.
- Documentos anexos: descrição textual dos documentos, sem armazenamento de arquivos.
- Abastecimento: descrição opcional, sem interpretar valores monetários ou litros contidos no texto. O combustível do abastecimento é um campo opcional adicional, necessário para verificar compatibilidade. Nesta simulação, combustíveis iguais são compatíveis e Flex aceita gasolina, etanol ou Flex. Para híbridos ou quando faltar o combustível do abastecimento, a compatibilidade fica não verificada. Não se verificam limites de litros, preços, autorizações ou condições técnicas reais.
- Carta: opcional. Informar qualquer dado da carta exige limite, valor usado e validade. Valores são armazenados em centavos inteiros; o saldo é derivado de limite menos valor usado. Aceitam-se valores brasileiros (`1.500,00`) ou ponto decimal (`1500.00`), com até duas casas. Não há pagamento, autorização de despesa ou política de limites por setor.
- Conflitos: plantões de motoristas podem ser encontrados pela identidade de um veículo existente, mas este formulário não solicita um intervalo de uso. Por isso, ele informa a limitação e não afirma ausência de sobreposição. Placas existentes continuam bloqueadas por duplicidade. A validação de conflito de plantões permanece no cadastro de motoristas.
- Erros demonstrativos: o painel amarelo apresenta exemplos estáticos, separados das validações do formulário. Eles não são falhas reais nem bloqueiam o envio.

Os campos novos são opcionais no tipo `Vehicle` para preservar registros antigos incompletos. O formulário aplica as validações exigidas aos novos cadastros. Os detalhes mostram os dados complementares quando disponíveis.
