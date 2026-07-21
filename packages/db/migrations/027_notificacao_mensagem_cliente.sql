-- ============================================================
-- Ninho Consultoria — Migration 027: Notificação de nova mensagem do Portal
-- Rodar no SQL Editor do Supabase (depois das migrations 025 e 026)
--
-- Quando um cliente manda uma mensagem pelo Portal, cria automaticamente
-- uma notificação (tabela "notificacoes") para: o consultor responsável
-- pelo cliente (clientes.responsavel_id) + todo Admin/Diretor do tenant.
-- Roda como SECURITY DEFINER (mesmo padrão do gatilho de provisionamento
-- de usuário), porque o cliente não tem permissão de RLS pra ler perfis de
-- outras pessoas nem inserir notificação pra elas — o gatilho contorna
-- isso com segurança, sem abrir RLS nenhuma pro cliente.
-- ============================================================

create or replace function public.notificar_nova_mensagem_cliente()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_autor_role user_role;
  v_cliente record;
  v_destinatario uuid;
begin
  if new.entidade_tipo <> 'cliente_mensagem' then
    return new;
  end if;

  select role into v_autor_role from public.profiles where id = new.autor_id;

  -- Só notifica a equipe quando quem escreveu foi o cliente. Mensagem da
  -- equipe pro cliente não gera notificação por enquanto (o Portal ainda
  -- não tem um sino de notificações do lado do cliente).
  if v_autor_role is distinct from 'cliente' then
    return new;
  end if;

  select id, tenant_id, responsavel_id, coalesce(nome_fantasia, razao_social) as nome
  into v_cliente
  from public.clientes
  where id = new.entidade_id;

  if v_cliente.id is null then
    return new;
  end if;

  for v_destinatario in
    select id from public.profiles
    where tenant_id = v_cliente.tenant_id
      and ativo
      and (role in ('admin', 'diretor') or id = v_cliente.responsavel_id)
  loop
    insert into public.notificacoes (tenant_id, profile_id, tipo, titulo, link)
    values (v_cliente.tenant_id, v_destinatario, 'mensagem', 'Nova mensagem de ' || v_cliente.nome, '/clientes/' || v_cliente.id);
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_notificar_nova_mensagem_cliente on public.comentarios;
create trigger trg_notificar_nova_mensagem_cliente
  after insert on public.comentarios
  for each row execute function public.notificar_nova_mensagem_cliente();

-- ============================================================
-- Fim da migration 027
-- ============================================================
