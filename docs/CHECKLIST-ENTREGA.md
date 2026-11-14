# Conferência dos requisitos — 14/11/2026

Fonte: [enunciado do professor](https://deluxe-blue-bc1.notion.site/Projeto-04-HairDay-Agendamentos-com-React-TypeScript-IA-414dfca74d8d81919380c39dcde5d2e3), relido em 14/11/2026.

| Critério | Situação e localização |
| --- | --- |
| React, Vite e TypeScript | Implementado; build aprovado. |
| Componentes, Props e estado tipado | src/components, SalonContext e src/types/salon.ts. |
| Appointment com id, nome, data e horário | clientName registrado ao agendar, além de clientId para vincular ao cadastro. |
| Cadastro, atualização imediata, data selecionada | BookingDialog e App; testes MCP. |
| Validação de nome, data e horário | ClientForm e BookingDialog; testes de formulário vazio e data vazia. |
| Filtrar por dia | DayGrid usa filter; testes MCP de duas datas. |
| Manhã, Tarde, Noite e ordem crescente | DayGrid usa reduce; linhas da grade posicionadas por horário, testadas com cadastro fora de ordem. |
| Mensagem exata por período vazio | Conferida nos três períodos em português. |
| Excluir apenas o registro escolhido | filter por id no contexto; teste remove um entre três e mantém os outros dois. |
| Desktop e celular | Capturas MCP em 1440 e 360 px; grid possui rolagem interna. |
| README e AGENTS | Presentes e complementados com fontes e evidências. |
| Context7 MCP | Consulta real registrada em evidencias/context7.md e resposta JSON. |
| Playwright MCP | Servidor oficial via MCP SDK, chamadas e resultados em evidencias/playwright-mcp.json. |
| Fidelidade ao Figma | PENDENTE: formulário lateral e lista por períodos diferem da grade/modal atual. Professor ainda não confirmou essa alteração. |
| Horários idênticos ao Figma | PENDENTE conferir: versão atual oferece intervalos de 30 min e encerra atendimentos às 21h. |
| Publicação dos últimos ajustes | Conferir push e integração da branch antes de enviar o link principal. |

## Próxima etapa obrigatória

Conferir e adaptar a estrutura ao Figma. Em 14/11 a integração Figma recusou acesso ao arquivo original. É necessária uma cópia acessível para conferir os detalhes sem presumir aprovação da grade. Personalização visual é opcional, mas não foi interpretada como dispensa da estrutura descrita no enunciado.

## O que não precisa entrar agora

Editar/reagendar, banco de dados, login e persistência em localStorage não aparecem como requisitos obrigatórios. Temas, idiomas e gestão de procedimentos já existentes foram preservados.

## Limites da revisão

Os testes exercitam os critérios centrais, não todos os recursos extras. Cinco avisos de lint preexistentes continuam registrados; não impedem o build. A agenda fica em memória e é apagada ao recarregar. A organização do Kanban precisa ser conferida pelo grupo.

No teste MCP, o console registrou bloqueio de Google Fonts pelo isolamento do navegador de teste (ERR_BLOCKED_BY_CLIENT). As capturas usam a fonte alternativa; isso não foi contado como falha das interações, mas a aparência com as fontes externas ainda deve ser conferida no navegador normal.
