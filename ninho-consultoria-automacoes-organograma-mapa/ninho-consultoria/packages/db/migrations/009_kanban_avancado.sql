-- ============================================================
-- Ninho Consultoria — Migration 009: Kanban avançado
-- Rodar no SQL Editor do Supabase
-- ============================================================

alter table tarefas add column if not exists descricao text;
alter table tarefas add column if not exists tempo_estimado numeric;
alter table tarefas add column if not exists tempo_realizado numeric;
alter table tarefas add column if not exists depende_de_id uuid references tarefas(id);

-- Comentários já usam a tabela genérica "comentarios" (entidade_tipo/entidade_id).
-- Como ainda não há login, adicionamos um campo temporário de nome do autor.
alter table comentarios add column if not exists autor_nome text;

create table if not exists tarefa_checklist_items (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid references tarefas(id) on delete cascade,
  titulo text not null,
  concluido boolean default false,
  ordem int default 0,
  created_at timestamptz default now()
);

create table if not exists tarefa_anexos (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid references tarefas(id) on delete cascade,
  nome text not null,
  url text not null,
  created_at timestamptz default now()
);

alter table tarefa_checklist_items enable row level security;
create policy "temp_allow_all_tarefa_checklist_items" on tarefa_checklist_items for all using (true) with check (true);

alter table tarefa_anexos enable row level security;
create policy "temp_allow_all_tarefa_anexos" on tarefa_anexos for all using (true) with check (true);

-- ============================================================
-- Fim da migration 009
-- ============================================================
