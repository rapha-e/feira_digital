-- ============================================================
-- MIGRAÇÃO DE COLUNAS DE MONETIZAÇÃO, DESTAQUE E GEOLOCALIZAÇÃO
-- Execute este script no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/zmuorzgrpwaaebskqwxb/sql
-- ============================================================

-- 1. Adicionar colunas faltantes na tabela businesses
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS featured_until timestamp with time zone;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS plan_tier text DEFAULT 'free';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS cnpj text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS cep text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS street_address text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS address_number text;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS state text DEFAULT 'DF';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS longitude double precision;

-- 2. Criar índices para acelerar busca e destaques no topo
CREATE INDEX IF NOT EXISTS idx_businesses_featured ON public.businesses (is_featured, featured_until desc);
CREATE INDEX IF NOT EXISTS idx_businesses_coords ON public.businesses (latitude, longitude);

-- 3. Garantir permissões de atualização e exclusão para o Painel Administrativo
DROP POLICY IF EXISTS "Permitir update em businesses" ON public.businesses;
CREATE POLICY "Permitir update em businesses" ON public.businesses 
FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir delete em businesses" ON public.businesses;
CREATE POLICY "Permitir delete em businesses" ON public.businesses 
FOR DELETE USING (true);

-- 4. Tabela de promoções e impulsionamentos (se ainda não criada)
CREATE TABLE IF NOT EXISTS public.promotions (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    type text not null,
    amount numeric(10,2) not null,
    status text not null default 'pending',
    starts_at timestamp with time zone default now(),
    expires_at timestamp with time zone not null,
    payment_method text default 'pix',
    created_at timestamp with time zone default now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Visualização pública de promoções" ON public.promotions;
CREATE POLICY "Visualização pública de promoções" ON public.promotions FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Criação de promoções" ON public.promotions;
CREATE POLICY "Criação de promoções" ON public.promotions FOR INSERT TO anon, authenticated WITH CHECK (true);
