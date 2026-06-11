# FleetOS - Sistema de Gestão de Frotas

Este repositório contém a base do FleetOS, um sistema de gestão de frotas multi-tenant offline-first.

## Estrutura do Projeto

* `/web` - Painel Admin construído com Next.js 15, Tailwind CSS, Zustand e React Query.
* `/mobile` - Aplicativo do motorista construído com Expo (React Native), NativeWind v4 e SQLite local para persistência offline.
* `firestore.rules` - Regras de segurança multi-tenant do Firebase.

## Pré-requisitos

* Node.js v18 ou superior
* npm, yarn ou pnpm

## Como Rodar

### Web Admin
1. Entre no diretório `/web`:
   ```bash
   cd web
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie e configure o arquivo `.env.local` com suas credenciais do Firebase (use o `.env.example` como base).
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### Mobile App
1. Entre no diretório `/mobile`:
   ```bash
   cd mobile
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o Expo:
   ```bash
   npx expo start
   ```
"# fleeOS" 
