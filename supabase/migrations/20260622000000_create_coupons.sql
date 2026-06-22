-- Migration: Create coupons table and configure Row Level Security (RLS)

-- 1. Criar a tabela de cupons se ela não existir
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('value', 'percentage')),
    value NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar segurança em nível de linha (RLS)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 3. Habilitar leitura pública para permitir consultas do checkout
CREATE POLICY "Allow public read access on coupons" 
    ON public.coupons FOR SELECT 
    USING (true);

-- 4. Habilitar todos os acessos para usuários autenticados (Admin/CRM)
CREATE POLICY "Allow all operations for authenticated users" 
    ON public.coupons FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);
