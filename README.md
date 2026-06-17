# FleetOS

FleetOS é uma plataforma de gestão de frotas com painel administrativo web e aplicativo móvel offline-first. O projeto combina:

- Web Admin em **Next.js 15** com **React 19**, **Tailwind CSS**, **Zustand** e **React Query**.
- Mobile App em **Expo 51** com **React Native 0.74**, **NativeWind 4** e **SQLite** para persistência local.
- Backend de dados via **Firebase** (Firestore + Auth) e um modo de execução mock para desenvolvimento sem credenciais.

---

## Visão Geral da Arquitetura

### Web (`/web`)

- `web/src/lib/firebase.ts`: inicializa Firebase com `NEXT_PUBLIC_*` env vars.
  - Se as variáveis não estiverem definidas, entra em **Mock Mode** e mantém o app funcional localmente.
- `web/src/context/AuthContext.tsx`: gerencia autenticação, sessões, CRUD e multi-tenant.
  - Suporta perfis de usuário, roles e regras de acesso.
  - Implementa helpers de RBAC, impersonação e logs de auditoria.
- `web/src/app/page.tsx`: rota raiz que redireciona para `/dashboard` ou `/login` com base no estado de sessão.
- `web/next.config.js`: configuração Next padrão com `reactStrictMode: true`.

### Mobile (`/mobile`)

- Estrutura de navegação: **Expo Router** com agrupamento `(auth)` e `(tabs)`.
- `mobile/src/lib/sqlite.ts`: define o schema local e popular seeds iniciais.
  - Tabelas: `users`, `drivers`, `vehicles`, `contracts`, `payments`, `maintenance`, `fines`, `notifications`, `sync_queue`.
- `mobile/src/lib/sync.ts`: motor de sincronização offline-first.
  - Monitora rede via `@react-native-community/netinfo`.
  - Enfileira operações no SQLite com `sync_queue` e sincroniza automaticamente ao voltar online.
  - Atualmente, a sincronização é simulada localmente para representar integração com backend.
- `mobile/src/store/useStore.ts`: estado global de driver com `zustand`.
  - Carrega sessão local, atualiza quilometragem offline, tickets e dashboard.
- `mobile/app/_layout.tsx`: inicializa banco, sessão e listener de sync no carregamento do app.

### Segurança e Regras de Acesso

- `firestore.rules`: regras de segurança Firestore com modelo multi-tenant.
  - `user_profiles`, `companies`, `drivers`, `vehicles`, `contracts` e coleções ERP suportam isolamento por `tenantId`.
  - Permite leitura/escrita apenas para usuários autenticados com papel e tenant compatíveis.
  - Regras validadas com helpers `isSuperAdmin`, `isFleetOwner`, `isDriver` e `belongsToTenant`.

---

## Diretório Principal

- `mobile/`: aplicativo móvel Expo + NativeWind.
- `web/`: painel administrativo Next.js.
- `firestore.rules`: regras de segurança Firestore.
- `README.md`: documentação do projeto.
- `stitch_downloads/`: protótipos ou versões estáticas importadas.

---

## Tecnologias Principais

### Web

- `next`, `react`, `react-dom`
- `@tanstack/react-query`
- `firebase`
- `zustand`
- `tailwindcss`, `postcss`, `autoprefixer`
- `typescript`

### Mobile

- `expo`, `expo-router`, `expo-sqlite`
- `react-native`
- `nativewind`
- `@react-native-community/netinfo`
- `@tanstack/react-query`
- `zustand`
- `react-native-reanimated`, `react-native-safe-area-context`, `react-native-svg`

---

## Como Executar

### 1. Configuração comum

- Tenha `Node.js v18+` instalado.
- Recomenda-se `npm` ou `pnpm`.
- Cada aplicação usa seu próprio `package.json`.

### 2. Rodar o Web Admin

```bash
cd web
npm install
cp .env.example .env.local
# preencha as variáveis Firebase em .env.local
npm run dev
```

### 3. Rodar o Mobile App

```bash
cd mobile
npm install
# use .env.example para definir variáveis de Firebase se necessário
npx expo start
```

---

## Configuração de Ambiente

O projeto espera variáveis de ambiente em `web/.env` ou `web/.env.local` e `mobile/.env.example`.

Variáveis esperadas:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

> Se não houver credenciais válidas, o web app entra em modo mock-controlado para testes locais.

---

## Observações de Engenharia

### Pontos fortes

- Arquitetura clara em duas camadas: admin web e app móvel.
- Mobile offline-first com esquema local e fila de sincronização.
- Segurança multi-tenant pensada no Firestore com regras de tenant boundary.
- Uso de `Zustand` para estado compartilhado e `React Query` para gerenciamento de dados.

### Limitações identificadas

- A sincronização móvel é atualmente simulada e não persiste em backend real.
- Falta de testes automatizados e validação de contrato de dados entre web e mobile.
- `AuthContext` e regras de Firestore fazem muitos `get()` em cada requisição, o que pode afetar desempenho em escala.
- Ausência de migração de schema SQLite e versão de dados no app móvel.
- Não há documentação de deploy nem checklist de produção.

### Recomendações técnicas

- Externalizar seeds e mock data para arquivos JSON/fixtures.
- Adicionar testes unitários/integração e lint no pipeline.
- Implementar uma API de sincronização real para o motor offline-first.
- Adicionar um `CONTRIBUTING.md` ou `ARCHITECTURE.md` para guiar futuros desenvolvedores.
- Rever a política de regras Firestore para reduzir leituras repetidas e evitar uso excessivo de `get()`.

---

## Melhorias sugeridas

1. Centralizar tipos e modelos `Tenant`, `User`, `Driver`, `Vehicle`, `Contract` em um pacote compartilhado.
2. Separar a lógica de persistência do `AuthContext` em hooks e serviços.
3. Implementar `syncEngine` com backend real ou WebSocket para confirmação de entrega.
4. Documentar a estrutura de dados usada pelo `sync_queue` e o formato de payload.
5. Adicionar handlers de erro mais robustos para falha de rede e inconsistência de dados.

---

## Documentação Adicional

- `CONTRIBUTING.md`: guia de colaboração, checklist de PR e boas práticas.
- `ARCHITECTURE.md`: visão detalhada da arquitetura e fluxo de dados.

---

## Contato

Para manutenção e desenvolvimento, use a arquitetura de dual stack: `Next.js` para admin e `Expo/React Native` para mobile. O foco principal deve ser a estabilidade do fluxo offline e a proteção de borda multi-tenant.
 
