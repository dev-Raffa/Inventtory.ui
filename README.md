# 🧱 Inventto — Sistema de Gestão de Estoque (Fase 1)

**Foco:** Integridade de Dados, Rastreabilidade e Arquitetura de Software

Este repositório representa a **Fase 1** do *Inventto*, um sistema de gestão de estoque projetado para lidar com **domínios complexos**, como produtos com variantes, histórico de movimentações e isolamento multi-tenant.

O projeto foi publicado como **projeto de portfólio**, com o objetivo de demonstrar **decisões arquiteturais**, **modelagem de domínio** e **preocupação real com integridade e segurança dos dados**.


## 📌 Por que este projeto existe?

Na prática, muitos sistemas de estoque falham silenciosamente por erros conceituais:

❌ Estoque tratado como um número editável

❌ Ausência de auditoria (quem alterou, quando e por quê)

❌ Regras de negócio vazando para o frontend

❌ Dificuldade para lidar com produtos com variantes (grades)



O Inventto foi projetado com uma abordagem **Defense-First**, assumindo desde o início que:

* **Integridade:** o estoque nunca é editado diretamente
* **Rastreabilidade:** o estoque atual é uma projeção do histórico
* **Segurança:** o frontend é tratado como um cliente não confiável
* **Complexidade:** variantes são tratadas como parte central do domínio


## 🏗️ Visão Geral da Arquitetura

A arquitetura segue o princípio de que **regras críticas vivem o mais próximo possível dos dados**.

```
Usuário
  ↓
Frontend (React / Vite)
  ↓
Edge Functions (Orquestração)
  ↓
PostgreSQL (Camada de Integridade)
   ├─ Validação de Regras de Domínio
   ├─ Transações Atômicas
   ├─ Registro de Movimentações
   └─ Projeção do Estoque Atual
```

> O frontend orquestra fluxos e UX.
> O banco de dados garante a verdade do sistema.


## 🧠 Decisões de Domínio (Highlights)

### 1. Estoque é uma Consequência, não um Input

Nenhum usuário pode “editar” o estoque diretamente.

**Regra fundamental:**

```
Estoque Atual =
Σ Entradas − Σ Saídas + Σ Ajustes
```

**Benefícios:**

* Auditoria confiável
* Histórico imutável
* Impossibilidade de alteração sem rastreabilidade


### 2. Variantes como Cidadãos de Primeira Classe

Produtos com variantes **não são tratados como exceção**.

* Cada variante possui ciclo de vida próprio
* Atributos armazenados em `JSONB` para flexibilidade
* SKUs individuais para cada combinação válida

Isso evita:

* Lógica condicional espalhada
* Explosão de colunas na tabela principal
* Modelagens frágeis e difíceis de evoluir


### 3. Error Handler Global e Determinístico

Em vez de tratar erros de forma pontual (`console.log(err)`), o projeto utiliza uma **estratégia centralizada de tratamento de erros**.

**Fluxo de tratamento:**

* 🛑 **Interceptação:** erros capturados na camada de service
* ⚙️ **Tradução:** códigos técnicos do PostgreSQL (ex: `23505`, `PGRST116`) são convertidos em mensagens de negócio
* 🌐 **Centralização:** o `QueryClient` gerencia o feedback global
* 🔔 **UI:** mensagens padronizadas são exibidas ao usuário

Essa abordagem melhora:

* Experiência de desenvolvimento
* Previsibilidade da UI
* Manutenção do código



## 🎯 Escopo da Fase 1

### ✅ Incluído

* Cadastro de produtos simples e com variantes
* Modelagem dinâmica de atributos
* Movimentações de estoque transacionais
* Histórico de movimentações imutável (audit trail)
* Suporte multi-tenant com isolamento via RLS

### 🚫 Excluído (intencionalmente)

* Preços e cálculos financeiros
* Pedidos e vendas
* Relatórios e dashboards
* Gestão de fornecedores

> O foco desta fase é **integridade do estoque**, não funcionalidades comerciais.


## 🗄️ Backend e Segurança (Supabase)

O PostgreSQL é utilizado como **núcleo do domínio**, não apenas como repositório de dados.

* **Row Level Security (RLS):** isolamento forçado entre organizações
* **Security Definer:** funções críticas executam regras sensíveis com segurança
* **Multi-Tenancy:** todas as entidades principais possuem `organization_id`

Mesmo que o frontend falhe, o banco **impede estados inválidos**.


## ⚖️ Trade-offs Arquiteturais

Decisões conscientes tomadas durante o desenvolvimento:

| Decisão                    | Trade-off (Custo)                   | Benefício (Ganho)                             |
| -------------------------- | ----------------------------------- | --------------------------------------------- |
| Regras no banco (PL/pgSQL) | Maior complexidade de versionamento | Integridade garantida independente do client  |
| Variantes em JSONB         | Queries analíticas mais complexas   | Flexibilidade total sem migrations constantes |
| Frontend como orquestrador | Menos otimizações locais            | Fonte única da verdade e previsibilidade      |


## 🚧 Limitações Conhecidas

Como todo software real, existem limitações conhecidas:

* Ausência de lock pessimista para cenários altamente concorrentes
* Event Sourcing parcial (histórico transacional)
* Algumas garantias de imutabilidade ainda dependem da aplicação

Essas limitações são **conhecidas, documentadas e intencionais** nesta fase.


## 🔮 Possíveis Evoluções

* Lock transacional para movimentações de estoque
* Triggers para impedir alterações em dados históricos
* Importação e exportação via CSV
* Views materializadas para relatórios
* Separação clara entre leitura e escrita (CQRS)


## 🛠️ Stack Tecnológica

* **Frontend:** React, Vite, TypeScript, TailwindCSS, shadcn/ui
* **State Management:** TanStack Query (Server State)
* **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
* **Qualidade:** ESLint, Prettier, Husky, Vitest


## 📬 Contato

**Rafael da Conceição**
Desenvolvedor Web Full Stack

📧 [raffa.d3v@gmail.com](mailto:raffa.d3v@gmail.com)

🔗 [https://github.com/dev-Raffa](https://github.com/dev-Raffa)


### Consideração final

Este projeto **não busca ser um produto pronto**, mas sim demonstrar **capacidade de decisão técnica**, **entendimento de domínio** e **preocupação com integridade de sistemas reais**.

Ele representa uma fase fechada do projeto.
O desenvolvimento comercial continua em um repositório privado.
