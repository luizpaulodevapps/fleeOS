# Contribuindo para o FleetOS

Obrigado por contribuir para o FleetOS. Este guia ajuda você a colaborar de forma consistente e sustentável.

## Como Contribuir

1. Fork este repositório.
2. Crie uma branch de feature ou correção:
   ```bash
   git checkout -b feature/minha-melhoria
   ```
3. Faça alterações claras e pequenas.
4. Teste localmente a aplicação web ou mobile antes de criar o pull request.
5. Abra o pull request com descrição do problema solucionado e quais partes do sistema foram impactadas.

## Estrutura de Desenvolvimento

- `web/`: painel administrativo Next.js.
- `mobile/`: aplicativo de motorista Expo + React Native.
- `supabase_schema.sql`: schema e seeds do banco de dados.

## Boas Práticas

- Mantenha o código tipado com `TypeScript`.
- Separe lógica de negócio da camada de interface.
- Prefira funções puras em helpers e serviços.
- Não misture lógicas específicas de web e mobile; crie módulos compartilhados apenas quando for claro.
- Use seeds e mocks apenas em ambiente de desenvolvimento.

## Convenções de Componentes

### Seleções (SearchSelect)

- **Nunca** use `<select>` nativo para listas com mais de 10 opções.
- Use o componente `SearchSelect` para motoristas, veículos e qualquer seleção que demande busca.
- O `SearchSelect` normaliza texto para busca (acentos, maiúsculas/minúsculas).

### Modais Responsivos

- Modais devem ser responsivos: sidebar colapsável no mobile com menu hamburguer.
- Use `fixed inset-0` com adaptação `md:` para desktop.
- Mobile: fullscreen, sidebar como overlay.
- Desktop: tamanho fixo, sidebar fixa.

### Ações Destrutivas

- Sempre adicione confirmação (`confirm()`) antes de excluir registros.
- Use ícone `Trash2` (vermelho) para botões de exclusão.
- Mensagem de confirmação deve mencionar o nome do item sendo excluído.

### Escaneamento de Câmera

- Use `html5-qrcode` para leitura de câmera (escaneamento de placa).
- O componente `PlateScanner` já implementa: cooldown, normalização, feedback visual.
- Para novos usos de escaneamento, reuse o `PlateScanner` ou crie variações.

## Requisitos Locais

- Node.js v18+
- `npm` ou `pnpm`
- Expo CLI para rodar mobile: `npx expo start`

## Testes e Validação

- Execute `npm install` em cada pasta antes de testar.
- Verifique se alterações no schema Supabase (`supabase_schema.sql`) mantêm o isolamento por `tenantId`.
- Para mudanças no mobile, revise `mobile/src/lib/sqlite.ts` e `mobile/src/lib/sync.ts`.
- Execute `npx tsc --noEmit` para verificar erros de TypeScript antes de commitar.

## Como Enviar uma Issue

1. Use título claro e objetivo.
2. Descreva o comportamento atual e o comportamento esperado.
3. Informe passos para reproduzir.
4. Anexe logs ou capturas de tela quando relevante.

## Notas de Revisão de PR

- Verifique se o código está coerente com o padrão de arquitetura do projeto.
- Confirme se não há dependências desnecessárias.
- Valide se os dados mock não vazam para produção.
- Verifique se modais são responsivos (testar em viewport mobile).
- Confirme que ações de exclusão têm confirmação.
- Valide que seleções usam `SearchSelect` para listas grandes.
