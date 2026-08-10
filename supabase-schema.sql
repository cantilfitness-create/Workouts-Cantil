-- =========================================================
-- CANTIL FITNESS — schema do Supabase
-- Rode este arquivo inteiro em: Supabase > SQL Editor > New query
-- =========================================================

create extension if not exists pg_trgm;

-- ---------- EXERCÍCIOS (biblioteca) ----------
create table if not exists exercicios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  grupo_grande text,
  grupo_menor text,
  equipamento text,
  descricao text,
  link text,
  criado_em timestamptz not null default now()
);
-- se a tabela já existia de uma versão anterior, isso adiciona a coluna nova sem apagar nada
alter table exercicios add column if not exists link text;

-- ---------- WORKOUTS ----------
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  codigo text unique,
  nome text,
  data date not null default current_date,
  categoria text,
  tags text default '',
  warmup_geral text,
  warmup_especifico text,
  skill text,
  blocos jsonb not null default '[]',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- índices para a busca ficar rápida mesmo com muitos workouts
create index if not exists idx_workouts_data on workouts (data desc);
create index if not exists idx_workouts_codigo on workouts (codigo);
create index if not exists idx_workouts_nome_trgm on workouts using gin (nome gin_trgm_ops);
create index if not exists idx_workouts_tags_trgm on workouts using gin (tags gin_trgm_ops);
create index if not exists idx_workouts_categoria_trgm on workouts using gin (categoria gin_trgm_ops);

-- ---------- LEGENDA DOS NÍVEIS ----------
create table if not exists legendas (
  nivel text primary key,
  texto text default ''
);

-- ---------- LOG PESSOAL (legado — a versão atual do app não usa mais esta tabela,
-- a aba "Meu log" virou "Protocolos". Deixei a tabela aqui só pra não apagar
-- nenhum dado antigo; pode ignorar ou remover manualmente se quiser.) ----------
create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  atleta text not null,
  data date not null default current_date,
  workout_id uuid references workouts (id) on delete set null,
  workout_nome text,
  bloco_nome text,
  nivel text,
  resultado text,
  ajuste text,
  notas text,
  criado_em timestamptz not null default now()
);

create index if not exists idx_logs_atleta on logs (atleta);
create index if not exists idx_logs_data on logs (data desc);

-- ---------- CONFIG (senha central do app) ----------
create table if not exists config (
  id int primary key default 1,
  senha text not null default 'cantil123',
  constraint config_singleton check (id = 1)
);
insert into config (id, senha) values (1, 'cantil123') on conflict (id) do nothing;

-- ---------- BANNER (destaque da página inicial: treino do dia / treino destaque / aviso) ----------
create table if not exists banner (
  id int primary key default 1,
  tipo text,
  workout_id uuid references workouts (id) on delete set null,
  titulo text,
  descricao text,
  observacao text,
  atualizado_em timestamptz default now(),
  constraint banner_singleton check (id = 1)
);

-- ---------- PROTOCOLOS DE TREINO (aba "Protocolos") ----------
create table if not exists protocolos (
  id uuid primary key default gen_random_uuid(),
  titulo text,
  resumo text,
  descricao text,
  duracao text,
  objetivo text,
  tags text default '',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_protocolos_criado on protocolos (criado_em desc);
create index if not exists idx_protocolos_titulo_trgm on protocolos using gin (titulo gin_trgm_ops);
create index if not exists idx_protocolos_tags_trgm on protocolos using gin (tags gin_trgm_ops);

-- ---------- APRESENTAÇÃO DO MÉTODO (legado — formato antigo, um bloco só.
-- A versão atual do app usa a tabela "apresentacoes" (no plural) logo abaixo,
-- que permite vários blocos. Deixei essa aqui só pra permitir a migração
-- automática do conteúdo antigo; pode ignorar.) ----------
create table if not exists apresentacao (
  id int primary key default 1,
  tag text,
  titulo text,
  descricao text,
  atualizado_em timestamptz default now(),
  constraint apresentacao_singleton check (id = 1)
);

-- ---------- APRESENTAÇÕES DO MÉTODO (vários blocos hero, estilo "sobre") ----------
create table if not exists apresentacoes (
  id uuid primary key default gen_random_uuid(),
  tag text,
  titulo text,
  descricao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists idx_apresentacoes_criado on apresentacoes (criado_em asc);

-- =========================================================
-- ROW LEVEL SECURITY
-- Como o app ainda não tem login de usuário, liberamos acesso
-- de leitura/escrita para a chave "anon" (a chave pública que o
-- site usa). Ou seja: qualquer pessoa com o link do site pode
-- ler e escrever nessas tabelas — é um "quadro compartilhado",
-- não uma conta privada. As telas de senha (novo treino, editar
-- legenda, editar banner, trocar senha) são travas de conveniência
-- na interface, não segurança de verdade: como a tabela "config"
-- também está com leitura liberada para "anon", tecnicamente dá
-- pra ler a senha atual direto pela API do Supabase, sem passar
-- pela tela do app. Para virar segurança de verdade, o próximo
-- passo seria usar Supabase Auth (login de email/senha) e trocar
-- essas políticas por regras baseadas em auth.uid().
-- =========================================================

alter table exercicios enable row level security;
alter table workouts enable row level security;
alter table legendas enable row level security;
alter table logs enable row level security;
alter table config enable row level security;
alter table banner enable row level security;
alter table protocolos enable row level security;
alter table apresentacao enable row level security;
alter table apresentacoes enable row level security;

drop policy if exists "anon full access exercicios" on exercicios;
create policy "anon full access exercicios" on exercicios
  for all using (true) with check (true);

drop policy if exists "anon full access workouts" on workouts;
create policy "anon full access workouts" on workouts
  for all using (true) with check (true);

drop policy if exists "anon full access legendas" on legendas;
create policy "anon full access legendas" on legendas
  for all using (true) with check (true);

drop policy if exists "anon full access logs" on logs;
create policy "anon full access logs" on logs
  for all using (true) with check (true);

drop policy if exists "anon full access config" on config;
create policy "anon full access config" on config
  for all using (true) with check (true);

drop policy if exists "anon full access banner" on banner;
create policy "anon full access banner" on banner
  for all using (true) with check (true);

drop policy if exists "anon full access protocolos" on protocolos;
create policy "anon full access protocolos" on protocolos
  for all using (true) with check (true);

drop policy if exists "anon full access apresentacao" on apresentacao;
create policy "anon full access apresentacao" on apresentacao
  for all using (true) with check (true);

drop policy if exists "anon full access apresentacoes" on apresentacoes;
create policy "anon full access apresentacoes" on apresentacoes
  for all using (true) with check (true);

-- Linhas iniciais da legenda (pode editar depois pelo app)
insert into legendas (nivel, texto) values
  ('Verde', ''), ('Amarelo', ''), ('Laranja', ''),
  ('Vermelho', ''), ('Azul', ''), ('Roxo', ''), ('Preto', '')
on conflict (nivel) do nothing;
