# Banco de Talentos API

API REST do Banco de Talentos desenvolvida para a Point Media em parceria com a Fatec Tatuí.

## Sumário

- [Sobre](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura](#estrutura-do-projeto)
- [Banco](#banco-de-dados)
- [Instalação](#instalação-e-configuração)
- [Autenticação](#autenticação-e-permissões)
- [Respostas](#padrão-das-respostas)
- [Endpoints](#endpoints)
- [Validação e segurança](#validação-e-segurança)
- [Testes e diagnóstico](#testes-e-diagnóstico)
- [Deploy](#publicação)
- [Limitações](#limitações-atuais)

## Sobre o projeto

O sistema centraliza dados de pessoas interessadas em oportunidades na Point Media. A API recebe e valida informações do front-end, autentica usuários, aplica permissões e regras de negócio, persiste os dados no PostgreSQL/Neon e devolve respostas JSON padronizadas.

## Funcionalidades

### Candidato

- Cadastro, login, logout, alteração e exclusão da própria conta.
- Perfil pessoal e profissional.
- LinkedIn, portfólio, currículo e cargo desejado.
- Experiências e formações.
- Apresentação cultural e carta de recomendação.
- Habilidades, níveis e áreas de interesse.
- Consulta de vagas ativas e candidatura.
- Consulta das próprias candidaturas.

### RH

- Criação, edição, pausa, fechamento e exclusão de vagas.
- Habilidades obrigatórias/opcionais por vaga.
- Consulta de candidaturas e candidatos por vaga.
- Atualização de status e favorito.
- Administração dos catálogos de habilidades e áreas.

### Administrador

- Todas as permissões de RH.
- Criação de usuários corporativos.
- Listagem e busca de usuários.

## Tecnologias

| Tecnologia | Uso |
|---|---|
| Node.js 20+ | Runtime |
| Express 5 | Servidor e rotas REST |
| PostgreSQL/Neon | Persistência relacional |
| `pg` | Driver PostgreSQL |
| Zod | Validação dos contratos |
| JWT | Tokens de autenticação |
| bcrypt | Hash das senhas |
| Helmet | Cabeçalhos defensivos |
| express-rate-limit | Limite de tentativas |
| CORS | Controle de origens |
| Supertest/Node Test Runner | Testes HTTP |
| Oxlint | Análise estática |

## Arquitetura

```text
HTTP → Middlewares → Routes → Controllers → Models → PostgreSQL
```

- **Routes:** método, caminho, autenticação, permissão e schema.
- **Controllers:** regras de negócio e respostas HTTP.
- **Models:** SQL parametrizado e transações.
- **Schemas:** contratos Zod para body, params e query.
- **Middlewares:** autenticação, autorização, validação, 404 e erros.
- **Config:** ambiente, CORS e pool PostgreSQL.

`app.js` monta e exporta o Express sem abrir porta. `src/server/server.js` inicia o servidor, verifica o banco e encerra o pool em `SIGINT`/`SIGTERM`.

## Estrutura do projeto

```text
BancoDTalentos_API/
├── app.js
├── package.json
├── .env-example
├── README.md
├── ALTERACOES.md
├── migrations/
│   └── 001_api_hardening.sql
├── test/
│   └── app.test.js
└── src/
    ├── config/       # ambiente, CORS e PostgreSQL
    ├── controllers/  # regras de negócio
    ├── middleware/   # autenticação, validação e erros
    ├── models/       # consultas SQL
    ├── routes/       # endpoints
    ├── schemas/      # contratos Zod
    ├── scripts/      # diagnóstico do banco
    ├── server/       # inicialização HTTP
    └── utils/        # respostas reutilizáveis
```

## Banco de dados

| Tabela | Conteúdo |
|---|---|
| `usuarios` | Identidade, hash e cargo |
| `candidatos` | Perfil pessoal/profissional |
| `sessoes` | Tokens ativos |
| `experiencias` | Histórico profissional |
| `formacoes` | Histórico acadêmico |
| `cultura_candidato` | Motivação, valores e apresentação |
| `habilidades` | Catálogo de competências |
| `habilidades_candidato` | Competências do candidato |
| `areas_interesse` | Catálogo de áreas |
| `interesses_candidato` | Interesses do candidato |
| `vagas` | Oportunidades |
| `habilidades_vaga` | Requisitos da vaga |
| `candidaturas` | Relação candidato-vaga |

Relações dependentes usam `ON DELETE CASCADE`. Uma candidatura é única por candidato/vaga. A área da vaga usa `ON DELETE SET NULL`.

### Valores controlados

| Campo | Valores |
|---|---|
| Cargo | `candidato`, `rh`, `admin` |
| Habilidade | `hard`, `soft` |
| Experiência | `junior`, `pleno`, `senior`, `especialista` |
| Formação | `cursando`, `concluido`, `trancado` |
| Turno | `manhã`, `tarde`, `noite` |
| Trabalho | `remoto`, `hibrido`, `presencial` |
| Contrato | `CLT`, `PJ`, `Estágio` |
| Vaga | `ativo`, `pausado`, `fechado` |
| Candidatura | `novo`, `em análise`, `em triagem`, `contratado`, `dispensado` |

## Instalação e configuração

```bash
npm ci
```

Crie `.env` na mesma pasta de `package.json`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://usuario:senha@host/banco?sslmode=require
JWT_SECRET=segredo-aleatorio-com-no-minimo-32-caracteres
JWT_EXPIRES_IN=1d
SESSION_TTL_DAYS=30
DB_CONNECTION_TIMEOUT_MS=60000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

| Variável | Obrigatória | Padrão | Função |
|---|---:|---|---|
| `DATABASE_URL` | Sim | — | URL do PostgreSQL/Neon |
| `JWT_SECRET` | Sim | — | Assina JWT; mínimo 32 caracteres |
| `NODE_ENV` | Não | `development` | Ambiente |
| `PORT` | Não | `3000` | Porta HTTP |
| `JWT_EXPIRES_IN` | Não | `1d` | Validade do token |
| `SESSION_TTL_DAYS` | Não | `30` | Retenção da sessão |
| `DB_CONNECTION_TIMEOUT_MS` | Não | `60000` | Timeout PostgreSQL |
| `CORS_ORIGINS` | Não | localhost | Origens separadas por vírgula |

Nunca versionar `.env`. No Windows, confirme que o nome não virou `.env.txt`.

### Scripts

| Comando | Função |
|---|---|
| `npm run dev` | Nodemon |
| `npm start` | Produção |
| `npm run lint` | Análise estática |
| `npm run check` | Sintaxe JS |
| `npm test` | Testes automatizados |
| `npm audit` | Vulnerabilidades |
| `npm run db:check` | DNS, TCP e login no Neon |

## Autenticação e permissões

O login gera JWT com ID, e-mail e cargo. A API também exige que o token exista em `sessoes`. Novo login invalida a sessão anterior e logout revoga a atual.

```http
Authorization: Bearer SEU_TOKEN
```

| Recurso | Público | Candidato | RH | Admin |
|---|:---:|:---:|:---:|:---:|
| Cadastro/login/vagas ativas | Sim | Sim | Sim | Sim |
| Próprio perfil/histórico | Não | Sim | Não | Não |
| Candidatura | Não | Sim | Não | Não |
| Gestão de vagas/candidaturas | Não | Não | Sim | Sim |
| Catálogos | Não | leitura | Sim | Sim |
| Usuários corporativos | Não | Não | Não | Sim |

## Padrão das respostas

Sucesso:

```json
{"sucesso":true,"mensagem":"Operação concluída.","dados":{}}
```

Erro:

```json
{"sucesso":false,"mensagem":"Descrição.","codigo":"BAD_REQUEST"}
```

Validação:

```json
{
  "sucesso": false,
  "mensagem": "Dados inválidos.",
  "codigo": "VALIDATION_ERROR",
  "erros": [{"campo":"email","mensagem":"E-mail inválido."}]
}
```

| HTTP | Código comum |
|---:|---|
| 400 | `BAD_REQUEST`, `VALIDATION_ERROR` |
| 401 | `UNAUTHORIZED` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND`, `ROUTE_NOT_FOUND` |
| 409 | `CONFLICT` |
| 429 | `RATE_LIMITED` |
| 500 | `INTERNAL_ERROR` |

## Endpoints

Base local: `http://localhost:3000`.

### Usuários

| Método | Rota | Acesso |
|---|---|---|
| POST | `/usuarios/registrar` | Público |
| POST | `/usuarios/login` | Público |
| POST | `/usuarios/logout` | Autenticado |
| PUT | `/usuarios/atualizar/:id` | Próprio usuário |
| DELETE | `/usuarios/deletar/:id` | Próprio usuário |
| GET | `/usuarios` | Admin |
| GET | `/usuarios/nome?nome=...` | Admin |
| GET | `/usuarios/:id` | Admin |
| POST | `/usuarios/admin/criar-usuario` | Admin |

Cadastro:

```json
{"nome_completo":"Pessoa","email":"pessoa@email.com","senha":"Senha123!"}
```

Login usa `email` e `senha`. Exclusão usa `{ "senha": "..." }`. Criação corporativa adiciona `cargo: "rh"` ou `"admin"`.

### Candidato

| Método | Rota |
|---|---|
| POST | `/candidatos/perfil-base` |
| GET | `/candidatos/meu-perfil` |
| POST | `/candidatos/cultura` |
| GET | `/candidatos/buscar-cultura` |

Perfil:

```json
{
  "telefone":"15999999999","cep":"18270000","numero_rua":"100",
  "cidade":"Tatuí","estado":"SP","data_nascimento":"2000-05-20",
  "url_foto":"https://exemplo/foto.jpg","linkedin_url":"https://linkedin.com/in/pessoa",
  "portfolio_url":"https://portfolio.exemplo","curriculo_url":"https://exemplo/curriculo.pdf",
  "cargo_desejado":"Desenvolvedor Backend"
}
```

Cultura aceita `motivacao`, `descricao_valores`, `apresentacao` e `arquivo_recomendacao`.

### Histórico

```text
POST   /historico/experiencias/create
GET    /historico/experiencias
PUT    /historico/experiencias/editar/:id
DELETE /historico/experiencias/deletar/:id
POST   /historico/formacoes/create
GET    /historico/formacoes
PUT    /historico/formacoes/editar/:id
DELETE /historico/formacoes/deletar/:id
```

Experiência:

```json
{"empresa":"Empresa","cargo":"Dev","descricao":"Atividades","data_inicio":"2024-01-01","data_fim":null,"atual":true}
```

Formação:

```json
{"curso":"DSM","instituicao":"Fatec","semestre_atual":4,"turno":"noite","status":"cursando","data_inicio":"2025-01-01","data_fim":null,"url_certificado":null}
```

Os POSTs aceitam um objeto ou até 20 itens. O usuário só altera registros próprios.

### Habilidades e áreas

```text
GET/POST/PUT/DELETE /habilidades
POST /habilidades-candidatos/vincular
GET  /habilidades-candidatos/buscar
DELETE /habilidades-candidatos/desvincular/:id

GET/POST/PUT/DELETE /areas-interesse
POST /interesses-candidato/vincular
GET  /interesses-candidato
DELETE /interesses-candidato/desvincular/:id
```

```json
{"habilidades":[{"habilidade_id":1,"nivel":4,"nivel_experiencia":"pleno"}]}
```

```json
{"areas_ids":[1,2,3]}
```

O caminho antigo `/interesse-candidato` permanece como alias.

### Vagas

| Método | Rota | Acesso |
|---|---|---|
| GET | `/vagas` | Público; ativas |
| GET | `/vagas/:id` | Público; ativa |
| GET | `/vagas/admin/todas` | RH/Admin |
| POST | `/vagas/create` | RH/Admin |
| PUT | `/vagas/update/:id` | RH/Admin |
| DELETE | `/vagas/delete/:id` | RH/Admin |

```json
{
  "titulo":"Desenvolvedor Front-end","descricao":"Descrição",
  "modelo_trabalho":"hibrido","tipo_contrato":"CLT",
  "salario_min":3000,"salario_max":5000,"status":"ativo",
  "area_interesse_id":1,
  "habilidades":[{"habilidade_id":1,"obrigatoria":true}]
}
```

Vaga e habilidades são gravadas na mesma transação.

### Candidaturas

| Método | Rota | Acesso |
|---|---|---|
| POST | `/candidaturas/inscrever` | Candidato |
| GET | `/candidaturas/minhas-candidaturas` | Candidato |
| GET | `/candidaturas` | RH/Admin |
| GET | `/candidaturas/vaga/:vagaId` | RH/Admin |
| PUT | `/candidaturas/atualizar-status/:id` | RH/Admin |

```json
{
  "vaga_id":1,"pretensao_salarial":4500,"disponibilidade":"integral",
  "preferencia_contrato":"CLT","preferencia_modelo_trabalho":"hibrido"
}
```

Somente vagas ativas aceitam inscrição. O acompanhamento aceita `status` e/ou `favorito`.

## Validação e segurança

- E-mail normalizado e validado.
- Senha entre 8 e 72 caracteres.
- IDs inteiros positivos.
- URLs, CEP, UF e datas validados.
- Valores monetários não negativos.
- Datas finais não podem anteceder as iniciais.
- Enums e limites de arrays/textos controlados.
- Bcrypt, JWT HS256 e sessões revogáveis.
- SQL parametrizado.
- Helmet, rate limit, CORS explícito e limite de 1 MB.
- Propriedade dos registros do candidato verificada.
- Transações em operações compostas.
- Erros internos não expõem stack trace.

## Arquivos e uploads

A API armazena URLs de foto, currículo, portfólio e recomendação. O upload binário ainda não existe. Foto/PDF deverá ser enviado a Cloudinary, S3, R2 ou Supabase Storage e somente a URL será salva. Não armazene arquivos binários no PostgreSQL.

## Testes e diagnóstico

```bash
npm run lint
npm run check
npm test
npm audit
npm run db:check
```

Os testes atuais cobrem health check, 404, validação, ausência de token e CORS. `db:check` separa o diagnóstico em DNS, TCP/5432 e PostgreSQL/TLS. Falha na etapa TCP indica bloqueio de rede/firewall, não erro da API.

## Publicação

1. Aplicar a migration.
2. Configurar variáveis na hospedagem.
3. Usar `NODE_ENV=production`.
4. Definir o domínio real em `CORS_ORIGINS`.
5. Usar segredo JWT exclusivo.
6. Rodar lint, testes e auditoria.
7. Rodar `db:check` no servidor.
8. Iniciar com `npm start`.
9. Configurar logs, monitoramento e backups.

## Limitações atuais

- Upload real de foto/PDF não implementado.
- Recuperação de senha e confirmação de e-mail não implementadas.
- Listagens administrativas sem paginação no servidor.
- Sem trilha de auditoria administrativa.
- Testes ainda não utilizam PostgreSQL real.
- Sem OpenAPI/Swagger automático.
