# Evidência de Context7 MCP — 14/11/2026

Consulta real feita nesta revisão pelo Codex, não reconstruída como se tivesse ocorrido durante o desenvolvimento inicial.

1. Ferramenta: resolve_library_id. Biblioteca pesquisada: React.
2. Biblioteca selecionada: /reactjs/react.dev (documentação oficial).
3. Ferramenta: query_docs. Pergunta: TypeScript typed component props, useState arrays, immutable adding with spread, removing by id with filter, rendering map and grouping appointments.
4. Resposta original: [context7-resposta.json](context7-resposta.json).

## Aplicação no HairDay

- useState<Appointment[]> mantém os agendamentos no SalonProvider.
- Adicionar cria um array novo com spread; excluir usa filter por id.
- Props tipadas conectam App, BookingDialog e DayGrid.
- map renderiza profissionais/horários; filter seleciona o dia; reduce conta por período.
- Appointment passou a guardar também clientName, como solicitado no modelo mínimo do enunciado, sem perder a relação clientId.

Fontes retornadas: [React — arrays no estado](https://react.dev/learn/updating-arrays-in-state), [useState](https://react.dev/reference/react/useState), [TypeScript](https://react.dev/learn/typescript).
