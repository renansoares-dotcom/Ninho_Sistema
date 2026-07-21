-- ============================================================
-- Ninho Consultoria — Migration 031: Notificação de mensagem nos dois sentidos
-- Rodar no SQL Editor do Supabase (depois de 027 em diante)
--
-- A migration 027 só notificava a equipe quando o CLIENTE mandava
-- mensagem. Essa migration substitui o gatilho por uma versão que também
-- notifica o cliente quando a EQUIPE responde — o Portal ganhou um sino
-- próprio (ver app), então agora faz sentido nos dois sentidos.
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

  select id, tenant_id, responsavel_id, coalesce(nome_fantasia, razao_social) as nome
  into v_cliente
  from public.clientes
  where id = new.entidade_id;

  if v_cliente.id is null then
    return new;
  end if;

  if v_autor_role = 'cliente' then
    -- Cliente escreveu: notifica o consultor responsável + Admin/Diretor
    for v_destinatario in
      select id from public.profiles
      where tenant_id = v_cliente.tenant_id
        and ativo
        and (role in ('admin', 'diretor') or id = v_cliente.responsavel_id)
    loop
      insert into public.notificacoes (tenant_id, profile_id, tipo, titulo, link)
      values (v_cliente.tenant_id, v_destinatario, 'mensagem', 'Nova mensagem de ' || v_cliente.nome, '/clientes/' || v_cliente.id);
    end loop;
  else
    -- Equipe escreveu: notifica quem tem acesso ao Portal daquela empresa
    for v_destinatario in
      select id from public.profiles
      where tenant_id = v_cliente.tenant_id
        and ativo
        and role = 'cliente'
        and cliente_id = v_cliente.id
    loop
      insert into public.notificacoes (tenant_id, profile_id, tipo, titulo, link)
      values (v_cliente.tenant_id, v_destinatario, 'mensagem', 'Nova mensagem da sua consultoria', '/portal/mensagens');
    end loop;
  end if;

  return new;
end;
$$;

-- O trigger em si (criado na migration 027) não precisa ser recriado —
-- ele já aponta pra essa função, e a gente só trocou o corpo dela.

-- ============================================================
-- Fim da migration 031
-- ============================================================
