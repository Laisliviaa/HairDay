# Conferência dos requisitos — 14/11/2026

Fonte: [enunciado do professor](https://deluxe-blue-bc1.notion.site/Projeto-04-HairDay-Agendamentos-com-React-TypeScript-IA-414dfca74d8d81919380c39dcde5d2e3). Referência visual: [cópia acessível, frame 1164:390](https://www.figma.com/design/vcQfqnyl7k2nBcvqiN0fqZ/Plataforma-de-agendamento?node-id=1164-390).

| Critério | Situação |
| --- | --- |
| React, Vite e TypeScript | Implementado; build aprovado. |
| Componentes, Props e estado tipado | ScheduleSidebar, AppointmentList, PeriodSection, SalonContext e tipos. |
| id, clientName, date e time | Presentes no tipo Appointment. |
| Formulário à esquerda e lista à direita | Implementado conforme a estrutura do Figma; empilhados no celular. |
| Referência visual | Fonte Catamaran, cores do tema escuro, proporções, horários, ícones e lista por períodos adaptados do frame. Navegação e opções avançadas são extensões preservadas. |
| Horários do Figma | 09h a 21h, de hora em hora, inclusive início às 21h. |
| Nome, data e horário obrigatórios | Validação do formulário básico, incluindo nome só com espaços. |
| Aparecer imediatamente na data agendada | Cadastro atualiza estado e seleciona a data na agenda. |
| Filtrar e agrupar por períodos | filter, reduce e map; cada período ordenado por time. |
| Mensagem vazia exata | Testada em português nos três períodos. |
| Excluir apenas um registro | Teste preserva outros registros. |
| Desktop e mobile | Testes em 1440, 360 e 320 px; capturas desktop/mobile. |
| Context7 MCP | Consulta e resposta original em evidencias/context7.md e JSON. |
| Playwright MCP | Registro atualizado das chamadas do servidor oficial e resultados em evidencias/playwright-mcp.json. |
| README, AGENTS e screenshots | Presentes. |

## Antes de enviar

- Publicar o commit e integrar a branch na main; conferir se o link de entrega mostra a versão atual.
- Atualizar o Kanban do grupo para refletir o trabalho realmente concluído.
- Cada integrante deve saber explicar useState, Props, Appointment, map, filter, reduce e exclusão por id.

## Decisões e limites

O cadastro básico reserva uma hora e atribui um profissional disponível, preservando a gestão de equipe existente. Os demais recursos ficaram nas opções avançadas. As reservas das 21h podem terminar às 22h; a referência indica hora de início, não de encerramento.

Dados em memória são permitidos no enunciado. Backend, login e localStorage de agendamentos não foram adicionados. Reagendamento foi acrescentado como extra em 15/11/2026, depois da conferência da entrega; testes separados em evidencias/reagendar-mcp.json. Os testes cobrem o fluxo obrigatório e regressões centrais, não uma auditoria de todos os extras. Cinco avisos de lint preexistentes continuam; não há erros de compilação. Esta conferência técnica não garante a nota do professor.
