# Contributing to FleetOS

Obrigado por contribuir para o FleetOS. Este guia ajuda você a colaborar de forma consistente e sustentável.

## Como contribuir

1. Fork este repositório.
2. Crie uma branch de feature ou correção:
   ```bash
   git checkout -b feature/minha-melhoria
   ```
3. Faça alterações claras e pequenas.
4. Teste localmente a aplicação web ou mobile antes de criar o pull request.
5. Abra o pull request com descrição do problema solucionado e quais partes do sistema foram impactadas.

## Estrutura de desenvolvimento

- `web/`: painel administrativo Next.js.
- `mobile/`: aplicativo de motorista Expo + React Native.
- `firestore.rules`: regras de segurança Firestore.

## Boas práticas

- Mantenha o código tipado com `TypeScript`.
- Separe lógica de negócio da camada de interface.
- Prefira funções puras em helpers e serviços.
- Não misture lógicas específicas de web e mobile; crie módulos compartilhados apenas quando for claro.
- Use seeds e mocks apenas em ambiente de desenvolvimento.

## Requisitos locais

- Node.js v18+
- `npm` ou `pnpm`
- Expo CLI para rodar mobile: `npx expo start`

## Testes e validação

- Execute `npm install` em cada pasta antes de testar.
- Verifique se alterações no `firestore.rules` mantêm o isolamento por `tenantId`.
- Para mudanças no mobile, revise `mobile/src/lib/sqlite.ts` e `mobile/src/lib/sync.ts`.

## Como enviar uma issue

1. Use título claro e objetivo.
2. Descreva o comportamento atual e o comportamento esperado.
3. Informe passos para reproduzir.
4. Anexe logs ou capturas de tela quando relevante.

## Notas de revisão de PR

- Verifique se o código está coerente com o padrão de arquitetura do projeto.
- Confirme se não há dependências desnecessárias.
- Valide se os dados mock não vazam para produção.
