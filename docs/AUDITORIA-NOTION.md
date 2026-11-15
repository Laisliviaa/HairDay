# Conferência do enunciado — 15/11/2026

Fonte lida diretamente: [Projeto 04 — HairDay no Notion](https://deluxe-blue-bc1.notion.site/Projeto-04-HairDay-Agendamentos-com-React-TypeScript-IA-414dfca74d8d81919380c39dcde5d2e3).

O Figma não foi acessado nesta conferência, por solicitação da usuária. Portanto, não se atribui aprovação à fidelidade visual. A comparação da migração foi com a aplicação local anterior.

## Requisitos presentes

| Exigência | Evidência |
| --- | --- |
| React, Vite e TypeScript | package.json, componentes .tsx; build aprovado. |
| CSS ou Tailwind | Migrado para Tailwind 4 com plugin oficial do Vite. |
| Nome, data e horário; cadastro imediato | ScheduleSidebar e SalonContext; teste MCP atual aprovado. |
| Mostrar a data recém-agendada | onSaved → showSaved → setDate; teste aprovado. |
| Filtro por dia | AppointmentList usa filter; teste troca o dia e retorna. |
| Manhã 09–12h, Tarde 13–18h, Noite 19–21h | helpers.ts, reduce e PeriodSection; horários de início de 09:00 a 21:00. |
| Ordem crescente | sort por time; teste insere fora de ordem e verifica 09, 12, 13 e 21h. |
| Mensagem vazia exata | Testada em português nos três períodos. |
| Excluir apenas o item escolhido | filter por id; teste exclui um e mantém os outros três. Há confirmação antes da exclusão. |
| Validar nome, data e horário | Testados vazios e nome com espaços. |
| Componentes reutilizáveis, Props, useState, eventos | ScheduleSidebar, AppointmentList, PeriodSection, DateField e contexto. |
| map, filter e reduce | Presentes no fluxo principal de listagem e cadastro. |
| Appointment com id, clientName, date e time | src/types/salon.ts; inclui outros campos para funções extras. |
| Um AGENTS.md específico na raiz | Papel, objetivo, stack, tipagem, validação, pastas, Context7, Playwright e tarefas pequenas. |
| README curto com objetivo, tecnologias, instalação e execução | Presente, atualizado para Tailwind. |
| Capturas desktop e mobile | docs/evidencias e novas capturas docs/tailwind/audit-1440.png e audit-360.png. |
| Context7 MCP real | docs/evidencias/context7.md e context7-resposta.json, registrados em 14/11. |
| Playwright MCP real | Evidência anterior preservada e execução nova em docs/tailwind/audit-playwright-mcp.json. |
| Responsividade e console | Fluxo principal em 320, 360, 768 e 1440 px sem overflow; console sem erros. |

Os nomes AppointmentForm e AppointmentItem são sugestões do enunciado, não arquivos obrigatórios: essas responsabilidades estão em ScheduleSidebar e PeriodSection.

## O que não está comprovado nesta auditoria

- Publicação da versão local atual no GitHub. O remoto configurado é https://github.com/Laisliviaa/HairDay; isso não comprova que os arquivos locais já foram enviados. A migração desta revisão não foi publicada.
- Cartões do Kanban atualizados e commits por etapa. O board não foi alterado nem auditado.
- Fidelidade ao Figma: excluída do escopo desta conferência. Existem registros históricos, mas não houve nova validação.
- Entendimento individual: cada integrante ainda precisa conseguir explicar useState, Props, Appointment, map/filter/reduce, inclusão e exclusão.

## Limites e observações

Dados de negócio em memória atendem ao enunciado. Persistir agendamentos em localStorage é opcional; hoje apenas tema e idioma persistem. Bloqueio de sobreposição existe por profissional, permitindo dois atendimentos simultâneos com profissionais diferentes.

Os testes atuais cobrem os requisitos centrais, não todas as combinações dos extras de gestão. Build aprovado; lint sem erros, com cinco avisos preexistentes. Não é possível garantir 100% da entrega nem uma nota apenas com a conferência local.
