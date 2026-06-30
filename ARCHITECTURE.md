# FleetOS Architecture

## Overview

FleetOS é composto por duas aplicações principais:

- `web/`: painel administrativo para gestores e operadores.
- `mobile/`: app do motorista com foco offline-first.

Os dois lados compartilham conceitos de tenant, usuário e contratos, mas não compartilham um pacote de dados comum no repositório atual.

## Principais Camadas

### Web Admin

- **Next.js 15** em modo `app/`.
- **Supabase** para autenticação (`auth`) e dados (`PostgreSQL`).
- **Zustand** para estado global de sessão e operações.
- **React Query** para gerenciamento de cache e fetch assíncrono.
- **Tailwind CSS** para estilos utilitários.
- **html5-qrcode** para leitura de câmera (escaneamento de placa de veículo).

### Mobile App

- **Expo Router** para navegação baseada em arquivos.
- **SQLite** como store local offline.
- **Sync Engine** para enfileirar alterações e sincronizar quando online.
- **Zustand** para estado compartilhado entre telas.
- **NativeWind** para estilos baseados em Tailwind.

## Data Flow

### Web

1. O usuário faz login via Supabase Auth.
2. `AuthContext` busca perfil e aplica controle de tenant.
3. Operações CRUD são executadas no Supabase (PostgreSQL).
4. Row Level Security (RLS) garante isolamento por `tenantId` e RBAC.

### Mobile

1. A aplicação inicializa o banco SQLite em `mobile/src/lib/sqlite.ts`.
2. Dados de sessão e seed são carregados localmente.
3. Modificações são gravadas nas tabelas locais e enfileiradas em `sync_queue`.
4. `syncEngine` detecta mudanças de rede e processa itens pendentes.

## Multi-Tenant

- Cada documento persiste um `tenantId`.
- Supabase RLS aplica isolamento por tenant em todas as tabelas.
- Mobile armazena `tenant_id` em tabelas locais para associar usuário e veículo ao tenant.

## Security Model

- A aplicação web depende de Supabase Auth.
- Row Level Security (RLS) define regras específicas por tabela e papel:
  - `super_admin`
  - `fleet_owner`
  - `driver`
- As regras validam `tenantId` em todas as operações de leitura e escrita.

## Offline-First Sync

- A fila local `sync_queue` mantém operações offline.
- O motor de sync executa sync quando o dispositivo volta online.
- A implementação atual usa simulação de backend; é uma base para integrar um serviço real.

## Componentes Compartilhados

### SearchSelect (`operations/_components/SearchSelect.tsx`)

Componente reutilizável de busca para seleção de itens. Substitui `<select>` nativos por um campo de pesquisa com filtro em tempo real.

**Props:**
- `items: SearchItem[]` — array de itens com `id`, `label` e `subtitle` opcional
- `value: string` — ID do item selecionado
- `onChange: (id: string) => void` — callback ao selecionar
- `placeholder`, `label`, `searchPlaceholder`, `emptyMessage` — textos customizáveis

**Uso:** seleção de motoristas (por nome/CPF) e veículos (por placa/modelo/marca) nos wizards de operações.

### PlateScanner (`operations/_components/PlateScanner.tsx`)

Componente de escaneamento de placa por câmera usando `html5-qrcode`.

**Funcionalidades:**
- Acessa câmera traseira automaticamente (`facingMode: "environment"`)
- Guia visual para alinhar a placa
- Leitura de código de barras e QR code
- Normalização da placa (maiúsculo, remove caracteres especiais)
- Feedback visual de sucesso com a placa lida
- Cooldown de 800ms para evitar leituras múltiplas

**Props:**
- `onScan: (plate: string) => void` — callback com a placa lida
- `onClose: () => void` — callback para fechar o scanner

### SignaturePad (`operations/_components/SignaturePad.tsx`)

Captura de assinatura digital em canvas.

## Arquitetura de Pastas

```
web/src/app/
├── (auth)/
│   └── login/
├── (tabs)/
│   ├── dashboard/
│   ├── finance/
│   ├── maintenance/
│   └── tickets/
├── operations/
│   ├── _components/
│   │   ├── DeliveryWizard.tsx
│   │   ├── ReturnWizard.tsx
│   │   ├── SwapWizard.tsx
│   │   ├── SearchSelect.tsx
│   │   ├── PlateScanner.tsx
│   │   ├── SignaturePad.tsx
│   │   └── OperationsOverview.tsx
│   ├── _hooks/
│   │   └── useOperations.ts
│   ├── _lib/
│   │   └── types.ts
│   └── page.tsx
├── vehicles/
│   ├── _components/
│   │   ├── VehicleModal.tsx (responsivo)
│   │   ├── VehiclesOverview.tsx
│   │   └── Vehicle*Tab.tsx (13 abas)
│   ├── _hooks/
│   │   └── useVehicles.ts
│   └── page.tsx
├── maintenance/
│   ├── _components/
│   │   ├── MaintenancePlanCatalogModal.tsx (CRUD completo)
│   │   ├── ProcedureCatalogModal.tsx (CRUD completo)
│   │   └── ...
│   ├── _hooks/
│   │   ├── useMaintenance.ts
│   │   ├── useMaintenancePlans.ts
│   │   └── useMaintenanceEngine.ts
│   └── page.tsx
└── ...
```

## Padrões de Componentes

### Modais Responsivos

Modais usam `fixed inset-0` com adaptação mobile:
- Mobile: fullscreen (`h-full`, `rounded-none`), sidebar colapsável com overlay
- Desktop: tamanho fixo (`max-w-5xl`, `h-[85vh]`), `rounded-2xl`
- Breakpoint: `md:` para desktop

### Hooks de Dados

Cada módulo segue o padrão:
- `useMódulo.ts`: hook principal com CRUD (load, save, delete)
- `useMóduloSpecific.ts`: hooks especializados (ex: `useMaintenancePlans`, `useProcedures`)
- Dados carregados via `getCollection()` do `AuthContext`
- Estado local com `useState`, callbacks com `useCallback`

### Wizards Multi-Step

Wizards de operações usam:
- Estado do passo atual (`delStep`, `retStep`, `swapStep`)
- Validação por passo (`validateDelStep`, `validateRetStep`)
- Progresso visual com indicadores de etapa
- Navegação `handleNext`/`handlePrev` com validação automática

## Padrões Recomendados

- Use a mesma tipagem para modelos de domínio em ambas as aplicações.
- Encapsule regras de negócios em serviços, não em componentes.
- Mantenha a lógica de sync separada de UI.
- Evolua o schema SQLite com migrações versionadas.
- Use `SearchSelect` para qualquer seleção que tenha mais de 10 opções.
- Prefira modais responsivos com sidebar colapsável em telas pequenas.
- Sempre adicione confirmação (`confirm()`) antes de ações destrutivas (excluir).
