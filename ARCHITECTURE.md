# FleetOS Architecture

## Overview

FleetOS é composto por duas aplicações principais:

- `web/`: painel administrativo para gestores e operadores.
- `mobile/`: app do motorista com foco offline-first.

Os dois lados compartilham conceitos de tenant, usuário e contratos, mas não compartilham um pacote de dados comum no repositório atual.

## Principais Camadas

### Web Admin

- **Next.js 15** em modo `app/`.
- **Firebase** para autenticação (`auth`) e dados (`firestore`).
- **Zustand** para estado global de sessão e operações.
- **React Query** para gerenciamento de cache e fetch assíncrono.
- **Tailwind CSS** para estilos utilitários.

### Mobile App

- **Expo Router** para navegação baseada em arquivos.
- **SQLite** como store local offline.
- **Sync Engine** para enfileirar alterações e sincronizar quando online.
- **Zustand** para estado compartilhado entre telas.
- **NativeWind** para estilos baseados em Tailwind.

## Data Flow

### Web

1. O usuário faz login via Firebase Auth.
2. `AuthContext` busca perfil e aplica controle de tenant.
3. Operações CRUD são executadas no Firestore.
4. Regras em `firestore.rules` garantem isolamento por `tenantId` e RBAC.

### Mobile

1. A aplicação inicializa o banco SQLite em `mobile/src/lib/sqlite.ts`.
2. Dados de sessão e seed são carregados localmente.
3. Modificações são gravadas nas tabelas locais e enfileiradas em `sync_queue`.
4. `syncEngine` detecta mudanças de rede e processa itens pendentes.

## Multi-Tenant

- Cada documento persiste um `tenantId`.
- Firestore aplica limites por tenant para leitura e escrita.
- Mobile armazena `tenant_id` em tabelas locais para associar usuário e veículo ao tenant.

## Security Model

- A aplicação web depende de Firebase Auth.
- `firestore.rules` define regras específicas por coleção e papel:
  - `super_admin`
  - `fleet_owner`
  - `driver`
- As regras validam `tenantId` tanto no `resource.data` quanto em `request.resource.data`.

## Offline-First Sync

- A fila local `sync_queue` mantém operações offline.
- O motor de sync executa sync quando o dispositivo volta online.
- A implementação atual usa simulação de backend; é uma base para integrar um serviço real.

## Arquitetura de pastas

- `web/src/app/`: interfaces e navegação do painel.
- `web/src/context/`: contexto de autenticação e dados.
- `web/src/lib/`: integração Firebase e utilitários.
- `mobile/app/`: telas Expo Router.
- `mobile/src/lib/`: persistência SQLite e sincronização.
- `mobile/src/store/`: estado de sessão do motorista.

## Padrões Recomendados

- Use a mesma tipagem para modelos de domínio em ambas as aplicações.
- Encapsule regras de negócios em serviços, não em componentes.
- Mantenha a lógica de sync separada de UI.
- Evolua o schema SQLite com migrações versionadas.
