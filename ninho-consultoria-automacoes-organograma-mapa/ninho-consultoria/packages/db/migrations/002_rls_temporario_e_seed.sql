-- ============================================================
-- Ninho Consultoria — Migration 002: RLS temporário + seed de dados
-- Rodar no SQL Editor do Supabase (Project > SQL Editor > New query)
-- ============================================================

-- ------------------------------------------------------------
-- RLS TEMPORÁRIO
-- Habilita RLS em todas as tabelas e libera acesso total por enquanto.
-- Isso será substituído por políticas reais (por perfil e tenant_id)
-- quando a autenticação (Supabase Auth) for implementada.
-- ------------------------------------------------------------
do $$
declare
  t text;
begin
  for t in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format(
      'create policy "temp_allow_all_%1$s" on public.%1$I for all using (true) with check (true);',
      t
    );
  end loop;
end $$;

-- ------------------------------------------------------------
-- SEED — dados de exemplo (os mesmos que estão no mock do frontend)
-- ------------------------------------------------------------
insert into tenants (id, nome, plano) values
  ('00000000-0000-0000-0000-000000000001', 'Ninho Consultoria', 'hobby');

insert into clientes (tenant_id, razao_social, nome_fantasia, segmento, status, faturamento, num_funcionarios, porte, endereco) values
  ('00000000-0000-0000-0000-000000000001', 'Ferro Sul Metalúrgica Ltda.', 'Metalúrgica Ferro Sul', 'Indústria', 'Ativo', 4200000, 84, 'Médio porte', '{"logradouro":"Av. das Indústrias, 1200","cidade":"Recife","uf":"PE"}'),
  ('00000000-0000-0000-0000-000000000001', 'TechFlow Sistemas de Gestão Ltda.', 'TechFlow Sistemas', 'Tecnologia', 'Ativo', 1800000, 22, 'Pequeno porte', '{"logradouro":"Rua da Inovação, 450","cidade":"São Paulo","uf":"SP"}'),
  ('00000000-0000-0000-0000-000000000001', 'Padaria Trigo Dourado Ltda.', 'Padaria Trigo Dourado', 'Alimentício', 'Ativo', 620000, 12, 'Microempresa', '{"cidade":"Caruaru","uf":"PE"}'),
  ('00000000-0000-0000-0000-000000000001', 'Construtora Horizonte S.A.', 'Construtora Horizonte', 'Construção Civil', 'Prospect', 9500000, 140, 'Grande porte', '{"cidade":"Recife","uf":"PE"}'),
  ('00000000-0000-0000-0000-000000000001', 'Doce Sabor Alimentos Ltda.', 'Doce Sabor Alimentos', 'Alimentício', 'Ativo', 1100000, 30, 'Pequeno porte', '{"cidade":"Caruaru","uf":"PE"}'),
  ('00000000-0000-0000-0000-000000000001', 'Nova Era Logística Ltda.', 'Nova Era Logística', 'Logística', 'Prospect', 2400000, 55, 'Médio porte', '{"cidade":"Jaboatão dos Guararapes","uf":"PE"}'),
  ('00000000-0000-0000-0000-000000000001', 'Grupo Alvorada Comércio Ltda.', 'Grupo Alvorada', 'Varejo', 'Ativo', 3100000, 68, 'Médio porte', '{"cidade":"Recife","uf":"PE"}'),
  ('00000000-0000-0000-0000-000000000001', 'Vale Verde Comércio Ltda.', 'Vale Verde Comércio', 'Varejo', 'Inativo', 480000, 8, 'Microempresa', '{"cidade":"Garanhuns","uf":"PE"}');

-- ============================================================
-- Fim da migration 002
-- ============================================================
