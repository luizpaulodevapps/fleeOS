# FleetOS

FleetOS é uma plataforma de gestão de frotas com painel administrativo web e aplicativo móvel offline-first. O projeto combina:

- Web Admin em **Next.js 15** com **React 19**, **Tailwind CSS**, **Zustand** e **React Query**.
- Mobile App em **Expo 51** com **React Native 0.74**, **NativeWind 4** e **SQLite** para persistência local.
- Backend de dados via **Supabase** (PostgreSQL + Auth) e um modo de execução mock para desenvolvimento sem credenciais.

---

## Visão Geral da Arquitetura

### Web (`/web`)

- `web/src/lib/supabaseClient.ts`: cliente Supabase com operações REST (auth + banco de dados).
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

- Supabase Row Level Security (RLS) com modelo multi-tenant.
- `supabase_schema.sql`: script completo de schema com tabelas, seeds e política de isolamento por `tenantId`.
- Autenticação via Supabase Auth (email + senha com bcrypt).

---

## Diretório Principal

- `mobile/`: aplicativo móvel Expo + NativeWind.
- `web/`: painel administrativo Next.js.
- `saas-stack-infra/`: console de infraestrutura SaaS (Vite).
- `supabase_schema.sql`: schema e seeds do banco de dados.
- `README.md`: documentação do projeto.

---

## Módulos e Funcionalidades

### Central de Operações (`/operations`)

Wizard guiado para gestão de entrega, devolução e troca de veículos:

- **Entrega de Veículo** (8 passos): Seleção de motorista via busca → seleção de veículo via busca ou **escaneamento de placa por câmera** → contrato → checklist → vistoria → assinatura → financeiro → revisão.
- **Devolução de Veículo** (6 passos): Escaneamento ou seleção do veículo → checklist → avarias → ajuste financeiro → quitação → revisão.
- **Troca de Veículo** (6 passos): Seleção do motorista → checklist antigo → novo veículo → checklist novo → assinatura → revisão.

Componentes:
- `SearchSelect`: componente reutilizável de busca para seleção de motoristas e veículos (substitui `<select>` por pesquisa).
- `PlateScanner`: leitura de placa por câmera usando `html5-qrcode`. Suporta câmera traseira em dispositivos móveis, leitura de código de barras e QR code.
- `SignaturePad`: captura de assinatura digital.

### Gestão de Veículos (`/vehicles`)

Prontuário digital completo com 13 abas:

| Aba | Descrição |
|-----|-----------|
| Ficha Técnica | Dados cadastrais, placa, modelo, ano, renavam, chassi |
| Patrimônio | Aquisição, NF, depreciação, FIPE |
| Performance | KPIs operacionais, custo/km, receita |
| Operação Atual | Vínculo ativo, motorista, contrato, próximo manutenção |
| Compliance & Regulação | Alvarás, pontos de táxi, vistorias DTP, taxímetro |
| Bloqueios & Travas | Bloqueios mecânicos, regulatorios, administrativos |
| Histórico Motoristas | Motoristas anteriores e duração dos vínculos |
| Equipamentos | Rastreador, taxímetro, luminoso, equipamentos |
| Sinistros & Avarias | Registro de sinistros com mapa de avarias |
| Manutenção & OS | Ordens de serviço, histórico, agendamentos |
| Vistorias Checklists | Checklists de entrega e devolução com fotos |
| Documentos CRLV | Upload de documentos, CNH, CRLV, seguro |
| Histórico Auditoria | Timeline de todas as operações |

**Modal responsivo**: sidebar colapsável no mobile com menu hamburguer, fullscreen em telas pequenas.

### Gestão de Manutenção (`/maintenance`)

Sistema completo de manutenção com 9 sub-módulos:

| Sub-aba | Descrição |
|---------|-----------|
| Alertas da Frota | Motor de alertas baseado em km e tempo |
| Ordens de Serviço | Criação, acompanhamento e conclusão de OS |
| Planos Preventivos | Itens de plano por veículo (legado) |
| Catálogo de Planos | **Planos reutilizáveis** por categoria de veículo com CRUD completo |
| Catálogo Técnico | Especificações técnicas por modelo |
| Estoque Técnico | Peças, movimentações, estoque baixo |
| Compras & Fornecedores | Pedidos de compra e gestão de fornecedores |
| Catalogação de Peças | Fila provisória de catalogação |
| Custos & BI | Análise de custos e relatórios |

**CRUD Completo**:
- Planos de manutenção: criar, editar, excluir com confirmação.
- Procedimentos: criar, editar, excluir com kits de peças.
- Vínculos veículo → plano: atribuir/remover planos a veículos.

### Outros Módulos

- `/drivers`: Cadastro de motoristas com prontuário, CNH, CONDUTAX, histórico.
- `/contracts`: Gestão de contratos de locação com ciclo de vida completo.
- `/assignments`: Vínculos motorista-veículo com validações.
- `/cashier`: Sessões de caixa, borderô, checklist de abertura/fechamento.
- `/financial`: Extrato financeiro, conciliação, compliance, cobranças.
- `/pricing`: Regras de precificação, tabelas, pacotes, categorias.
- `/fines`: Infrações de trânsito com identificação do motorista.
- `/claims`: Sinistros com mapa de avarias, processo regulatório.
- `/dispatcher`: Processos regulatórios, transferências de alvarás.
- `/documents`: Templates de documentos com motor de variáveis.
- `/reports`: Relatórios e ROI.
- `/settings`: Configurações do sistema.
- `/portals/workshop`: Portal da oficina.
- `/portals/adjuster`: Portal do regulador.

---

## Tecnologias Principais

### Web

- `next`, `react`, `react-dom`
- `@tanstack/react-query`
- `zustand`
- `tailwindcss`, `postcss`, `autoprefixer`
- `typescript`
- `html5-qrcode` (leitura de câmera para escaneamento de placa)
- `lucide-react` (ícones)

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
# preencha as variáveis Supabase em .env.local
npm run dev
```

### 3. Rodar o Mobile App

```bash
cd mobile
npm install
# use .env.example para definir variáveis de Supabase se necessário
npx expo start
```

---

## Configuração de Ambiente

O projeto espera variáveis de ambiente em `web/.env` ou `web/.env.local` e `mobile/.env`.

Variáveis esperadas:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> Se não houver credenciais válidas, o web app entra em modo mock-controlado para testes locais.

---

## Observações de Engenharia

### Pontos fortes

- Arquitetura clara em duas camadas: admin web e app móvel.
- Mobile offline-first com esquema local e fila de sincronização.
- Segurança multi-tenant via Supabase RLS com isolamento por `tenantId`.
- Uso de `Zustand` para estado compartilhado e `React Query` para gerenciamento de dados.
- Componentes reutilizáveis (SearchSelect, PlateScanner, SignaturePad).
- Modais responsivos com adaptação mobile-first.

### Limitações identificadas

- A sincronização móvel é atualmente simulada e não persiste em backend real.
- Falta de testes automatizados e validação de contrato de dados entre web e mobile.
- `AuthContext` e operações Supabase fazem muitas consultas, o que pode afetar desempenho em escala.
- Ausência de migração de schema SQLite e versão de dados no app móvel.
- Não há documentação de deploy nem checklist de produção.

### Recomendações técnicas

- Externalizar seeds e mock data para arquivos JSON/fixtures.
- Adicionar testes unitários/integração e lint no pipeline.
- Implementar uma API de sincronização real para o motor offline-first.
- Otimizar consultas Supabase para reduzir chamadas repetidas.
- Documentar a estrutura de dados usada pelo `sync_queue` e o formato de payload.

---

## Melhorias Sugeridas

1. Centralizar tipos e modelos `Tenant`, `User`, `Driver`, `Vehicle`, `Contract` em um pacote compartilhado.
2. Separar a lógica de persistência do `AuthContext` em hooks e serviços.
3. Implementar `syncEngine` com backend real ou WebSocket para confirmação de entrega.
4. Documentar a estrutura de dados usada pelo `sync_queue` e o formato de payload.
5. Adicionar handlers de erro mais robustos para falha de rede e inconsistência de dados.

---

## Documentação Adicional

- `CONTRIBUTING.md`: guia de colaboração, checklist de PR e boas práticas.
- `ARCHITECTURE.md`: visão detalhada da arquitetura e fluxo de dados.
- `DEVELOPMENT.md`: guia de setup e desenvolvimento local.

---

## Contato

Para manutenção e desenvolvimento, use a arquitetura de dual stack: `Next.js` para admin e `Expo/React Native` para mobile. O foco principal deve ser a estabilidade do fluxo offline e a proteção de borda multi-tenant.
