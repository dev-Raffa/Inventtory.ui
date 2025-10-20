# Inventto - Gestor de Estoque (Frontend)

Inventto é um sistema web moderno para gestão de inventário e controle de estoque, focado em pequenas e médias empresas (PMEs). O objetivo é fornecer uma ferramenta visual, rápida e inteligente para substituir o controle manual em planilhas, dando ao gestor total visibilidade sobre seu capital de inventário.

Este repositório contém o frontend da aplicação, desenvolvido com React e TypeScript, seguindo uma arquitetura modular e escalável.

## Funcionalidades da Fase 1

- Gestão de Produtos com Variações (Grades)
- Controle de Movimentações de Estoque (Entrada, Saída, Ajuste)
- Histórico de Movimentações (Audit Trail)
- Alertas de Estoque Mínimo
- Dashboard com KPIs e Relatórios

## Stack Tecnológica

Esta stack foi escolhida para balancear agilidade de desenvolvimento com estrutura e manutenibilidade a longo prazo, evitando overengineering.

| Categoria | Biblioteca | Propósito |
| :--- | :--- | :--- |
| **Core** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) | Fundação da UI e build tool de alta performance. |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) | Tipagem estática para segurança e manutenibilidade. |
| **Roteamento** | [React Router](https://reactrouter.com/) | Padrão da indústria para roteamento SPA. |
| **Estado (Servidor)** | [TanStack Query](https://tanstack.com/query) | Gerenciamento de dados da API, cache, revalidação e paginação. |
| **Estado (Cliente)** | [Zustand](https://zustand-demo.pmnd.rs/) | Gerenciamento de estado global simples e leve. |
| **Cliente HTTP** | [Axios](https://axios-http.com/) | Criação de instâncias de API e interceptors (ex: JWT). |
| **Formulários** | [React Hook Form](https://react-hook-form.com/) | Gerenciamento de formulários complexos com performance. |
| **Validação** | [Zod](https://zod.dev/) | Validação de schemas (formulários e APIs) com inferência de tipos. |
| **UI & Estilização** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS para desenvolvimento ágil de UIs customizadas. |
| **Componentes** | [Shadcn/ui](https://ui.shadcn.com/) | "Copie e cole" componentes acessíveis e estilizados com Tailwind. |
| **Testes** | [Vitest](https://vitest.dev/) + [RTL](https://testing-library.com/) | Testes unitários e de integração rápidos e co-localizados. |
| **Qualidade** | [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) + [Husky](https://typicode.github.io/husky/) | Padronização e qualidade de código. |

## Arquitetura do Projeto

O projeto segue uma arquitetura orientada a features (feature-based). Em vez de organizar o código por tipo de arquivo (ex: /components, /hooks, /pages), nós o organizamos por domínio de negócio.

Isso torna o projeto mais modular, fácil de navegar e de dar manutenção.

``` json
|-- /cypress/              # Testes End-to-End (E2E) (se aplicável)
|-- /src/
|   |
|   |-- /api/              # Configuração global do Axios, instâncias e interceptors.
|   |-- /assets/           # Imagens, fontes, SVGs estáticos.
|   |-- /components/       # Componentes de UI 100% genéricos (Button,      Modal, Input).
|   |-- /config/           # Constantes e configuração de .env.
|   |-- /hooks/            # Hooks customizados genéricos (ex: useDebounce).
|   |-- /lib/              # Configuração de libs (tailwind, zod, etc.).
|   |-- /providers/        # Provedores React (Auth, QueryClient, Router).
|   |-- /routes/           # Configuração central das rotas (Rotas públicas e privadas).
|   |-- /store/            # Stores globais do Zustand (ex: useAuthStore).
|   |
|   |-- /features/         # <-- CORAÇÃO DA ARQUITETURA
|   |   |
|   |   |-- /auth/         # Domínio: Autenticação
|   |   |   |-- /components/ # Componentes específicos de Auth (LoginForm)
|   |   |   |-- /pages/      # Telas (LoginPage, RegisterPage)
|   |   |   |-- /api/        # Chamadas de API (authApi.ts)
|   |   |   |-- /hooks/      # Hooks (useAuth.ts)
|   |   |   |-- types.ts     # Tipos TypeScript do domínio
|   |   |
|   |   |-- /products/     # Domínio: Produtos
|   |   |   |-- /components/ # ProductList, ProductForm, Stepper, SummaryCard
|   |   |   |-- /pages/      # ProductListPage, ProductCreatePage
|   |   |   |-- /api/        # productsApi.ts
|   |   |   |-- /hooks/      # useProducts.ts (contém a lógica do TanStack Query)
|   |   |   |-- types.ts
|   |   |
|   |   |-- /inventory/    # Domínio: Estoque
|   |   |   |-- /components/ # StockMovementForm, HistoryTable
|   |   |   |-- ...etc
|   |   |
|   |   |-- /dashboard/    # Domínio: Dashboard
|   |   |   |-- /components/ # KpiCard, RecentAlertsWidget
|   |   |   |-- /pages/      # DashboardPage
|   |
|   |-- App.tsx            # Ponto de entrada principal com Provedores e Rotas
|   |-- main.tsx           # Renderização do app
|
|-- .eslintrc.cjs
|-- .prettierrc
|-- package.json
|-- tsconfig.json
|-- vite.config.ts         # Configuração do Vite e Vitest
```

## Testes

Nossa estratégia de testes se baseia em co-localização (colocation) para testes unitários e de integração.

- **Testes Unitários / Integração (Vitest + RTL):** Os arquivos de teste (ex: ProductList.test.tsx) ficam dentro da pasta da feature, ao lado do componente que estão testando. Isso facilita a manutenção e garante que os testes sejam parte integrante do desenvolvimento da feature.

- **Testes End-to-End (Cypress/Playwright):** Ficam na pasta /cypress na raiz do projeto, pois testam a aplicação como um todo.

## Como Começar

- Clone este repositório:

```bash
git clone [URL_DO_REPOSITORIO]
cd inventto-frontend
```

- Instale as dependências:

```bash
npm install
# ou yarn install / pnpm install
```

- Crie seu arquivo de ambiente local:

```bash
cp .env.example .env
```

- Atualize o .env com a URL do seu backend.

- Rode o servidor de desenvolvimento:

```bash
npm run dev
```

## Scripts Disponíveis

```bash
npm run dev: Inicia o servidor de desenvolvimento com Vite.
```

```bash
npm run build: Gera a build de produção do app.
```

```bash
npm run lint: Roda o ESLint para analisar o código.
```

```bash
npm run test: Roda todos os testes unitários com Vitest no modo "watch".
```

```bash
npm run test:ui: Abre a interface gráfica do Vitest.
```

## Licença

Este projeto é licenciado sob a Licença MIT.
