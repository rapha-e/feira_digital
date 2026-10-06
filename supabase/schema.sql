-- ============================================================
-- PRD: Feira Digital (Versão Completa & Evoluída) - Schema do Supabase
-- ============================================================

-- 1. Habilitar extensão para UUIDs se necessário
create extension if not exists "uuid-ossp";

-- 2. Tabela: categories
create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    icon text
);

-- 3. Tabela: businesses (Perfil do MEI / Pequeno Negócio)
create table if not exists public.businesses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    slug text not null unique,
    category_id uuid references public.categories(id) on delete set null,
    neighborhood text not null,
    city text not null,
    whatsapp text not null,
    avatar_url text,
    bio text,
    -- Status Operacional & Tags (Pilar 2)
    is_open boolean not null default true,
    free_delivery boolean not null default false,
    store_pickup boolean not null default true,
    accepts_pix boolean not null default true,
    accepts_card boolean not null default false,
    -- Métricas de Sucesso (Pilar 3)
    views_count integer not null default 0,
    whatsapp_clicks_count integer not null default 0,
    -- Teto Flexível de Produtos (Pilar 3)
    product_limit integer not null default 5,
    created_at timestamp with time zone default now()
);

-- 4. Tabela: products (Catálogo)
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    title text not null,
    description text,
    price numeric(10,2) not null default 0.00,
    image_url text,
    -- Mensagem personalizada por produto no WhatsApp (Pilar 3)
    custom_whatsapp_message text,
    created_at timestamp with time zone default now()
);

-- 5. Trigger / Função de validação: Limite dinâmico de produtos por MEI
create or replace function public.check_products_limit()
returns trigger as $$
declare
    current_count integer;
    max_limit integer;
begin
    select coalesce(product_limit, 5) into max_limit
    from public.businesses
    where id = new.business_id;

    select count(*) into current_count
    from public.products
    where business_id = new.business_id;

    if current_count >= coalesce(max_limit, 5) then
        raise exception 'Limite de produtos atingido (% itens).', coalesce(max_limit, 5);
    end if;

    return new;
end;
$$ language plpgsql;

drop trigger if exists enforce_products_limit on public.products;
create trigger enforce_products_limit
before insert on public.products
for each row execute function public.check_products_limit();

-- 6. Funções RPC para incremento atômico de métricas (Pilar 3)
create or replace function public.increment_views(business_id uuid)
returns void as $$
begin
    update public.businesses
    set views_count = coalesce(views_count, 0) + 1
    where id = business_id;
end;
$$ language plpgsql security definer;

create or replace function public.increment_clicks(business_id uuid)
returns void as $$
begin
    update public.businesses
    set whatsapp_clicks_count = coalesce(whatsapp_clicks_count, 0) + 1
    where id = business_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- SEGURANÇA: Row Level Security (RLS)
-- ============================================================

alter table public.categories enable row level security;
alter table public.businesses enable row level security;
alter table public.products enable row level security;

-- Categorias: Leitura pública
create policy "Categorias são públicas para leitura"
on public.categories for select
to public
using (true);

-- Negócios: Leitura pública
create policy "Negócios são públicos para leitura"
on public.businesses for select
to public
using (true);

-- Negócios: Dono autenticado pode criar
create policy "Usuário autenticado pode criar seu próprio negócio"
on public.businesses for insert
to authenticated
with check (auth.uid() = user_id);

-- Negócios: Dono pode atualizar
create policy "Usuário pode atualizar seu próprio negócio"
on public.businesses for update
to authenticated
using (auth.uid() = user_id);

-- Negócios: Dono pode deletar
create policy "Usuário pode deletar seu próprio negócio"
on public.businesses for delete
to authenticated
using (auth.uid() = user_id);

-- Produtos: Leitura pública
create policy "Produtos são públicos para leitura"
on public.products for select
to public
using (true);

-- Produtos: Dono pode inserir
create policy "Dono do negócio pode cadastrar produtos"
on public.products for insert
to authenticated
with check (
    exists (
        select 1 from public.businesses
        where id = products.business_id
        and user_id = auth.uid()
    )
);

-- Produtos: Dono pode atualizar
create policy "Dono do negócio pode atualizar produtos"
on public.products for update
to authenticated
using (
    exists (
        select 1 from public.businesses
        where id = products.business_id
        and user_id = auth.uid()
    )
);

-- Produtos: Dono pode excluir
create policy "Dono do negócio pode excluir produtos"
on public.products for delete
to authenticated
using (
    exists (
        select 1 from public.businesses
        where id = products.business_id
        and user_id = auth.uid()
    )
);

-- ============================================================
-- STORAGE: Bucket para Fotos de Produtos e Avatares
-- ============================================================

insert into storage.buckets (id, name, public)
values ('vitrine', 'vitrine', true)
on conflict (id) do nothing;

create policy "Imagens da vitrine são públicas para visualização"
on storage.objects for select
to public
using (bucket_id = 'vitrine');

create policy "Usuários autenticados podem fazer upload de imagens"
on storage.objects for insert
to authenticated
with check (bucket_id = 'vitrine');

create policy "Usuários autenticados podem atualizar suas imagens"
on storage.objects for update
to authenticated
using (bucket_id = 'vitrine');

create policy "Usuários autenticados podem deletar imagens"
on storage.objects for delete
to authenticated
using (bucket_id = 'vitrine');

-- ============================================================
-- DADOS INICIAIS (SEED)
-- ============================================================

insert into public.categories (name, slug, icon) values
('Alimentação & Bebidas', 'alimentacao-bebidas', 'Utensils'),
('Beleza & Estética', 'beleza-estetica', 'Sparkles'),
('Artesanato & Presentes', 'artesanato-presentes', 'Gift'),
('Serviços Gerais', 'servicos-gerais', 'Wrench'),
('Moda & Acessórios', 'moda-acessorios', 'Shirt'),
('Pet & Cuidados', 'pet-cuidados', 'Heart')
on conflict (slug) do nothing;
