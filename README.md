# 🏛️ Votações Parlamentares

**Sistema completo para consulta e análise de deputados federais do Brasil** usando MCP (Model Context Protocol) e dados abertos da Câmara dos Deputados.

[![Deco MCP](https://img.shields.io/badge/Deco-MCP-blue?style=flat-square)](https://deco.cx)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square)](https://reactjs.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square)](https://tailwindcss.com/)

## 🎯 Sobre o Projeto

Este projeto é uma **aplicação full-stack** que integra com a **API pública da Câmara dos Deputados** para fornecer:

- 📋 **Listagem completa** de deputados federais
- 👤 **Perfis detalhados** com informações completas
- 📊 **Dashboards analíticos** com rankings e comparações
- 🔍 **Sistema de busca e filtros** avançados
- 📱 **Interface responsiva** e moderna

## 🖼️ Sreenshots
- List all
<img width="1230" height="537" alt="image" src="https://github.com/user-attachments/assets/376c5fc7-899d-41e9-9ac8-859eaf14db32" />
- Comparisons
<img width="1197" height="668" alt="image" src="https://github.com/user-attachments/assets/a850854f-6c57-47ee-801c-dd7e318bcba3" />

### No deco chat
<img width="1508" height="614" alt="image" src="https://github.com/user-attachments/assets/45f0ec03-ba01-4134-b97f-bbb93bd9e82d" />


### 🏗️ Stack Tecnológica

- **🤖 Backend**: Cloudflare Workers + Deco MCP Server
- **⚛️ Frontend**: React 19 + TanStack Router + Tailwind CSS
- **📊 Gráficos**: Recharts para visualizações
- **🔧 Type Safety**: TypeScript completo com RPC tipado
- **⚡ Performance**: Cache inteligente + timeout configurável
- **🎨 UI**: shadcn/ui + Lucide Icons

## ✨ Funcionalidades Principais

### 🏠 **Página Inicial** (`/`)
- **Grid responsivo** com lista de deputados
- **Filtros inteligentes** por nome, UF e partido
- **Cards informativos** com foto, contato e dados básicos
- **Paginação robusta** com estados de loading
- **Busca em tempo real** com debounce

### 👤 **Perfil do Deputado** (`/deputado/[id]`)

#### **📅 Aba Eventos**
- Cronograma completo de eventos parlamentares
- Detalhes de presença e participação
- Filtros por tipo e período
- Interface timeline interativa

#### **💰 Aba Despesas**
- Lista detalhada de gastos parlamentares
- **🏆 Ranking interativo** dos 10 maiores gastadores
- **📊 Gráfico de comparação** com destaque da posição atual
- Valores formatados em Real brasileiro
- Categorização por tipo de despesa
- Detalhes de fornecedores e documentos

#### **🤝 Aba Frentes Parlamentares**
- Frentes de atuação do deputado
- Áreas de interesse e especialização
- Parcerias e colaborações

### 📊 **Dashboard de Ranking** (Novo!)

O projeto inclui um **sistema de ranking avançado** que permite:

- **Top 10 deputados** com maiores gastos
- **Posicionamento em tempo real** do deputado atual
- **Comparação visual** através de gráficos de barras
- **Destaque personalizado** para o deputado selecionado
- **Informações contextuais** sobre posição no ranking geral

## 🛠️ Ferramentas MCP Implementadas

### `LISTAR_DEPUTADOS`
```typescript
// Lista todos os deputados ativos
const deputados = await client.LISTAR_DEPUTADOS({});
```

### `EVENTOS_DEPUTADO`
```typescript
// Eventos de um deputado específico
const eventos = await client.EVENTOS_DEPUTADO({ 
  deputadoId: "12345" 
});
```

### `DESPESAS_DEPUTADO`
```typescript
// Despesas de um deputado específico
const despesas = await client.DESPESAS_DEPUTADO({ 
  deputadoId: "12345" 
});
```

### `FRENTES_DEPUTADO`
```typescript
// Frentes parlamentares de um deputado
const frentes = await client.FRENTES_DEPUTADO({ 
  deputadoId: "12345" 
});
```

### `RANKING_DESPESAS` ⭐ **Novo!**
```typescript
// Ranking de deputados por gastos
const ranking = await client.RANKING_DESPESAS({ 
  deputadoIdAtual: "12345",
  ano: 2024 
});
```

## 🚀 Instalação e Uso

### Pré-requisitos
- **Node.js** ≥22.0.0
- **Deno** ≥2.0.0  
- **Deco CLI**: `deno install -Ar -g -n deco jsr:@deco/cli`

### Setup Inicial
```bash
# 1. Clone o repositório
git clone <repository-url>
cd votacoes-parlamentares

# 2. Autenticação
deco login

# 3. Instalação de dependências
npm install

# 4. Configuração do projeto
npm run configure
```

### Desenvolvimento
```bash
# Inicia servidor de desenvolvimento (frontend + backend)
npm run dev

# Gera tipos para integrações externas
npm run gen

# Gera tipos para ferramentas próprias (após npm run dev)
npm run gen:self
```

### Deploy
```bash
# Build e deploy para produção
npm run deploy
```

## 📱 Interface e UX

### 🎨 Design System
- **Dark Mode** nativo com Tailwind CSS
- **Componentes reutilizáveis** via shadcn/ui
- **Ícones consistentes** com Lucide React
- **Tipografia otimizada** para leitura
- **Cores semânticas** para estados e ações

### 📊 Visualizações de Dados
- **Gráficos de barras** para rankings
- **Cards informativos** com dados estruturados
- **Badges de status** para identificação rápida
- **Formatação monetária** brasileira
- **Estados de loading** com skeletons

### 🔄 Estados da Aplicação
- ⏳ **Loading**: Skeleton loaders animados
- ❌ **Erro**: Mensagens claras com retry
- 📄 **Vazio**: Estados explicativos
- ✅ **Sucesso**: Feedback visual positivo

## 🏗️ Arquitetura

### Backend (MCP Server)
```
server/
├── main.ts          # Entry point + runtime setup
├── tools.ts         # Ferramentas MCP (CRUD operations)
├── workflows.ts     # Fluxos automatizados
├── schema.ts        # Schema de banco de dados
└── deco.gen.ts      # Tipos gerados automaticamente
```

### Frontend (React SPA)
```
view/src/
├── routes/          # Páginas da aplicação
├── components/      # Componentes reutilizáveis
├── hooks/           # TanStack Query hooks
├── lib/             # Utilitários e configurações
└── styles.css       # Estilos globais
```

## 🔧 API de Dados

O projeto consome a **API oficial da Câmara dos Deputados**:

- **Base URL**: `https://dadosabertos.camara.leg.br/api/v2/`
- **Documentação**: [Dados Abertos](https://dadosabertos.camara.leg.br/swagger/api.html)
- **Rate Limiting**: Respeitado automaticamente
- **Timeout**: 10s configurável por requisição

## 🎯 Features Implementadas

✅ **Listagem completa** de deputados federais  
✅ **Perfis detalhados** com 3 abas de informações  
✅ **Sistema de ranking** com gráficos interativos  
✅ **Filtros e busca** em tempo real  
✅ **Interface responsiva** mobile-first  
✅ **Cache inteligente** (5-10min via TanStack Query)  
✅ **Estados de loading** com skeletons  
✅ **Tratamento de erros** com retry  
✅ **TypeScript completo** com type safety  
✅ **Dark mode** nativo  
✅ **Formatação brasileira** (moeda, datas)  

## 🚧 Roadmap

- [ ] **Sistema de favoritos** para deputados
- [ ] **Comparação direta** entre múltiplos deputados
- [ ] Como **votou cada deputado**
- [ ] **Exportação de dados** (PDF, Excel)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🏛️ Dados Abertos

Este projeto utiliza exclusivamente **dados públicos** disponibilizados pela Câmara dos Deputados através de sua API oficial, em conformidade com a Lei de Acesso à Informação (LAI - Lei 12.527/2011).

---

**🇧🇷 Democratizando o acesso à informação parlamentar brasileira!**
