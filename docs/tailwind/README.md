# Migração para Tailwind — 15/11/2026

Estilos dos componentes convertidos para utilitários Tailwind 4, compartilhados em src/styles.ts. O prefixo hd- serve apenas como marcador de elementos e estados; não possui regras CSS próprias. Classes completas ficam estáticas para o Tailwind detectá-las.

src/index.css mantém a entrada do Tailwind, fontes locais, tokens dos temas e estilos básicos de elementos com @apply. O Preflight não foi ativado para preservar os padrões nativos já utilizados. Valores calculados em tempo de execução (posição na grade e cores dos procedimentos) permanecem nos estilos inline.

Validação: comparação com a versão anterior em 24 cenários (quatro abas, dois temas e larguras 320/768/1440), sem diferenças nas dimensões e propriedades de estilo medidas. Também conferidos grade mobile escura e modal desktop claro. Isso não significa que todos os estados possíveis foram comparados.

- comparison-all.json: resultado da comparação via servidor oficial Playwright MCP.
- comparison-360-dark-Grade.json e comparison-1440-light-Modal.json: extras.
- audit-playwright-mcp.json: cadastro, validação, períodos, datas, exclusão, responsividade e console.
- audit-1440.png e audit-360.png: capturas da versão migrada.

Build aprovado; lint sem erros e com os cinco avisos anteriores. Código de negócio preservado. Backup anterior disponível na pasta hairday-original do workspace usado na migração. Nenhum push foi realizado nesta revisão.
