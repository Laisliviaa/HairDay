# HairDay

Aplicação de agendamentos para salão/barbearia, feita com React, Vite, TypeScript e CSS para a disciplina de SPA.

## Como executar

```bash
npm ci
npm run dev
```

Validações: `npm run build` (TypeScript e versão de produção) e `npm run lint`.

## Fluxo principal

O formulário lateral recebe data, horário e nome. Os horários seguem o Figma: 09:00 a 21:00, de hora em hora. Ao agendar, a lista mostra automaticamente a data escolhida, em ordem crescente e separada por Manhã, Tarde e Noite. Cada registro pode ser excluído individualmente; períodos vazios exibem a mensagem solicitada.

O cadastro básico reserva uma hora com um profissional disponível, respeitando folgas, bloqueios e outros atendimentos. Não exige telefone, CPF ou pagamento. Um atendimento iniciado às 21h termina às 22h. As opções extras ficam em “Mais opções de agendamento” e “Opções da agenda”.

## Recursos preservados

- Cadastro completo com procedimentos, duração, profissional e pagamentos.
- Grade por profissional, bloqueios de horário, equipe e escala semanal.
- Cadastro de clientes, procedimentos, histórico e reajustes.
- Detalhes do atendimento, status, convite de calendário e links de contato quando há telefone/e-mail.
- Português, inglês, espanhol e temas claro/escuro.

Dados de negócio ficam em memória: recarregar a página reinicia os cadastros e agendamentos. Apenas idioma e tema são persistidos. No cadastro completo de clientes, telefone é obrigatório e CPF é opcional.

## Estrutura e aprendizado

- `ScheduleSidebar`: formulário e validação do cadastro básico.
- `AppointmentList`: filtra por data/profissional e agrupa com reduce.
- `PeriodSection`: exibe a lista ordenada, estado vazio e botão de excluir.
- `SalonContext`: estado com useState e atualizações imutáveis.
- `src/types/salon.ts`: Appointment e demais tipos; Props tipadas em cada componente.

Ao cadastrar, o contexto cria um novo array com spread. A listagem usa filter, reduce e map. A exclusão usa filter pelo id; não altera os demais itens.

## Referência e evidências

- [Figma acessível](https://www.figma.com/design/vcQfqnyl7k2nBcvqiN0fqZ/Plataforma-de-agendamento?node-id=1164-390)
- [Checklist de entrega](docs/CHECKLIST-ENTREGA.md)
- [Consulta real ao Context7 MCP](docs/evidencias/context7.md)
- [Chamadas e resultados Playwright MCP](docs/evidencias/playwright-mcp.json)
- [Desktop](docs/evidencias/mcp-1440.png) · [Mobile](docs/evidencias/mcp-360.png) · [Tema claro](docs/evidencias/figma-claro.png)

Projeto desenvolvido com apoio de IA; esta revisão usou Codex, Context7 MCP e o servidor oficial Playwright MCP. Os assets do Figma e a fonte Catamaran estão em `public/figma`, servidos localmente.

## Reagendar

Clique no nome do cliente na agenda e em **Reagendar**. Escolha data e horário e salve. O botão aparece em atendimentos agendados ou confirmados. A agenda abre automaticamente a nova data.

O mesmo registro é atualizado: cliente, profissional, procedimentos, duração, valor e pagamento são preservados. Não há recálculo de preço ao mudar a data. Horários ocupados, bloqueios, folgas e indisponibilidade do profissional são respeitados. Cancelar descarta as alterações.

[Testes do reagendamento via Playwright MCP](docs/evidencias/reagendar-mcp.json) · [Captura mobile](docs/evidencias/reagendar-mobile.png).
