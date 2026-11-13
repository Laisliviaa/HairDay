# HairDay

Sistema de agendamentos para salão/barbearia feito com React, Vite e TypeScript, baseado no protótipo do Figma da disciplina de SPA.

## Funcionalidades
- Agenda por data, dividida em Manhã, Tarde e Noite, com mensagem para período vazio
- Cadastro de agendamento (cliente, data, procedimentos, profissional e horário) com validação
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
