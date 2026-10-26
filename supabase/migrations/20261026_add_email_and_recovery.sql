-- ============================================================
-- MIGRAÇÃO: Suporte Completo a E-mail e Recuperação de Acesso
-- ============================================================

-- 1. Adiciona a coluna email na tabela businesses se não existir
alter table public.businesses add column if not exists email text;

-- 2. Atualiza retroativamente o email de todas as lojas existentes
-- vinculando com o email do auth.users correspondente
update public.businesses b
set email = u.email
from auth.users u
where b.user_id = u.id and (b.email is null or b.email = '');

-- 3. Criação de índices para busca rápida (por email, whatsapp e link da vitrine)
create index if not exists idx_businesses_email on public.businesses(email);
create index if not exists idx_businesses_whatsapp on public.businesses(whatsapp);
create index if not exists idx_businesses_slug on public.businesses(slug);

-- 4. Função e Trigger para Sincronização Automática
-- Sempre que uma loja for cadastrada ou alterada, se o campo email estiver vazio,
-- o PostgreSQL busca automaticamente o email do usuário em auth.users
create or replace function public.fn_sync_business_email()
returns trigger as $$
begin
  if new.email is null or new.email = '' then
    select email into new.email from auth.users where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_sync_business_email on public.businesses;
create trigger trg_sync_business_email
before insert or update on public.businesses
for each row
execute function public.fn_sync_business_email();
