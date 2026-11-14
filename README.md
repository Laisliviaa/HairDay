# HairDay

Sistema de agendamentos para salão/barbearia feito com React, Vite e TypeScript, com identidade visual própria, para a disciplina de SPA.

## Funcionalidades
- Agenda do dia em grade por profissional, dividida em Manhã, Tarde e Noite, com mensagem para período vazio
- Cadastro de agendamento (cliente, data, procedimentos, profissional e horário) com validação
- Clientes com CPF (validado) e celular/WhatsApp obrigatórios, busca e histórico de atendimentos
- Procedimentos com variações de tempo e valor (ex: corte masculino e feminino) e reajuste programado por mês, com histórico e alerta
- Pagamento: pendente, parcial ou pago total, com sinal de 50% e registro do restante
- Mensagens prontas de confirmação e lembrete pelo WhatsApp e convite de calendário (.ics) por e-mail
- Filtro por profissional, status visual do atendimento e bloqueio de horários (almoço, folga, férias)
- Escala semanal com folgas fixas por profissional (ex: toda segunda e terça) e indicação de dia fechado
- Atendimentos terminam até as 21h; agenda de 2020 a 2030; sem nomes repetidos (clientes, profissionais, procedimentos)
- Três idiomas (português, inglês e espanhol) e tema claro/escuro
- Exclusão com confirmação e proteção contra quebrar agendamentos vinculados
- Horários flexíveis de 30 em 30 min: o tempo do atendimento é a soma dos procedimentos e não conflita com outro do mesmo profissional
- Cadastro de procedimentos com tempo, valor e quais podem ser feitos juntos
- Equipe com controle de disponibilidade
- Exclusão pela lixeira e layout responsivo

## Tecnologias
React, Vite, TypeScript, CSS, Context API. Desenvolvido com apoio de OpenCode, Context7 MCP e Playwright MCP.

## Como executar
```bash
npm install
npm run dev
```

## Estrutura
`src/components`, `src/context`, `src/types`, `src/utils`

## Referência e evidências

- [Figma do professor](https://www.figma.com/design/0UAXn1uIaIWTUDnBj1Tzct/Plataforma-de-agendamento--Community---Copy-?node-id=3-376)
- [Checklist de entrega e pendências](docs/CHECKLIST-ENTREGA.md)
- [Consulta Context7 MCP](docs/evidencias/context7.md)
- [Registro de testes Playwright MCP](docs/evidencias/playwright-mcp.json)
- [Captura desktop](docs/evidencias/mcp-1440.png) e [captura mobile](docs/evidencias/mcp-360.png)

Para conferir a compilação: `npm run build`. Para analisar o código: `npm run lint`.

Os dados ficam em memória: recarregar a página reinicia cadastros e agendamentos. O CPF é opcional; o telefone é obrigatório nesta versão. A estrutura atual de grade/modal ainda precisa ser alinhada à referência do professor (formulário lateral e lista por períodos); consulte o checklist antes da entrega.
