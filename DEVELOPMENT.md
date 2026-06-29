# Desenvolvimento FleetOS

Este guia descreve como configurar, executar e desenvolver o FleetOS nas duas aplicações principais.

## Visão Geral

FleetOS é composto por duas aplicações:

- `web/` — painel administrativo em **Next.js**.
- `mobile/` — app motorista em **Expo React Native**.

Cada aplicação tem seu próprio ciclo de instalação e execução.

## Pré-requisitos

- Node.js 18 ou superior
- npm ou pnpm
- Expo CLI (opcional, mas recomendado para mobile)
  ```bash
  npm install -g expo-cli
  ```

## Configuração de Ambiente

### Web

1. Entre na pasta `web`:
   ```bash
   cd web
   ```
2. Instale dependências:
   ```bash
   npm install
   ```
3. Crie `.env.local` a partir de `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
4. Preencha as variáveis do Firebase no `.env.local`.

### Mobile

1. Entre em `mobile`:
   ```bash
   cd mobile
   ```
2. Instale dependências:
   ```bash
   npm install
   ```
3. Se desejar, copie as variáveis de ambiente de `mobile/.env.example`:
   ```bash
   cp .env.example .env
   ```

## Scripts Úteis

### Web

- `npm run dev` — inicia o servidor de desenvolvimento Next.js.
- `npm run build` — gera a build de produção.
- `npm run start` — executa a aplicação em modo produção.
- `npm run lint` — verifica erros de lint (Next.js).

### Mobile

- `npm run start` — inicia o Expo DevTools.
- `npm run android` — abre o app no emulador/dispositivo Android.
- `npm run ios` — abre o app no emulador/dispositivo iOS.
- `npm run web` — executa o app usando o navegador.

## Desenvolvimento Local

### Web

1. Configure o ambiente.
2. Rode `npm run dev`.
3. Acesse `http://localhost:3000`.

### Mobile

1. Rode `npx expo start`.
2. Use o Expo Go no seu dispositivo ou um emulador.

## Fluxo de Mudanças

1. Crie uma branch clara com prefixo `feature/`, `fix/` ou `refactor/`.
2. Faça commits pequenos e descritivos.
3. Atualize `CONTRIBUTING.md` e `ARCHITECTURE.md` quando houver mudanças significativas na estrutura.
4. Abra PR com contexto e impacto das mudanças.

## Qualidade do Código

- Mantenha tipagem `TypeScript` coerente.
- Separe regras de negócio da UI.
- Documente novos serviços, hooks e entidades de dados.
- Verifique se qualquer alteração em `firestore.rules` preserva isolamento de `tenantId`.
- Use `SearchSelect` para seleções com mais de 10 opções (nunca `<select>` nativo).
- Adicione confirmação (`confirm()`) antes de ações destrutivas (excluir).
- Modais devem ser responsivos: sidebar colapsável no mobile.

## Dependências Principais

### Web

| Pacote | Versão | Uso |
|--------|--------|-----|
| `next` | 15 | Framework React |
| `react` | 19 | UI library |
| `firebase` | latest | Backend (Auth + Firestore) |
| `zustand` | 5 | Estado global |
| `@tanstack/react-query` | 5 | Cache e fetch |
| `tailwindcss` | 3 | Estilos |
| `html5-qrcode` | 2.x | Leitura de câmera para escaneamento de placa |
| `lucide-react` | latest | Ícones |

### Mobile

| Pacote | Versão | Uso |
|--------|--------|-----|
| `expo` | 51 | Framework React Native |
| `expo-router` | 3.5 | Navegação |
| `react-native` | 0.74 | UI framework |
| `nativewind` | 4 | Estilos Tailwind |
| `zustand` | 5 | Estado global |
| `expo-sqlite` | latest | Persistência local |

## Notas Específicas do Projeto

### Mobile Offline-First

- O app inicializa `SQLite` em `mobile/src/lib/sqlite.ts`.
- A fila `sync_queue` é usada para operações offline e re-sincronização.
- A sincronização atual é implementada como simulação local em `mobile/src/lib/sync.ts`.

### Web Auth e Multi-Tenant

- `web/src/context/AuthContext.tsx` contém a maior parte do controle de sessão e autorização.
- O web app tem modo mock quando não há credenciais Firebase válidas.

### Escaneamento de Placa

- O componente `PlateScanner` usa `html5-qrcode` para leitura de câmera.
- Funciona melhor em dispositivos móveis com câmera traseira.
- Em desktop, pode precisar de permissão de câmera no navegador.
- A placa é normalizada: maiúsculos, sem caracteres especiais.

### Modais Responsivos

- Modais usam `fixed inset-0` com adaptação mobile.
- Mobile: fullscreen com sidebar colapsável.
- Desktop: tamanho fixo com sidebar fixa.
- Breakpoint: `md:` (768px).

## Próximos Passos Sugeridos

- Adicionar testes automatizados para web e mobile.
- Implementar migração de schema SQLite.
- Criar um endpoint de sincronização real para o mobile.
- Adicionar lint e verificação de tipo como parte de CI.
- Documentar API de sincronização para o motor offline-first.
