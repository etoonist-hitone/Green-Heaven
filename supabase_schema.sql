-- Supabase SQL Schema for Green Heaven

-- 1. Enable UUID Extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Categories Table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Products Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_bn VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    care_instructions TEXT,
    images TEXT[] NOT NULL DEFAULT '{}',
    stock_status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (stock_status IN ('available', 'sold_out')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Inquiries Table
CREATE TABLE public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    message TEXT,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 6. Setup RLS Policies

-- Categories Policies
CREATE POLICY "Allow public read access to categories" 
ON public.categories FOR SELECT 
USING (true);

CREATE POLICY "Allow admin write access to categories" 
ON public.categories FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Products Policies
CREATE POLICY "Allow public read access to products" 
ON public.products FOR SELECT 
USING (true);

CREATE POLICY "Allow admin write access to products" 
ON public.products FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Inquiries Policies
CREATE POLICY "Allow public inserts to inquiries" 
ON public.inquiries FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow admin access to inquiries" 
ON public.inquiries FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Setup Indexes for Performance
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_stock ON public.products(stock_status);
CREATE INDEX idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- 8. Create Settings Table for App Config (e.g. Hero Banners)
CREATE TABLE public.settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access to settings" 
ON public.settings FOR SELECT 
USING (true);

CREATE POLICY "Allow admin write access to settings" 
ON public.settings FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert default banners
INSERT INTO public.settings (key, value) VALUES
('hero_banners', '["https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=1600&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1600&auto=format&fit=crop&q=80", "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1600&auto=format&fit=crop&q=80"]'::jsonb)
ON CONFLICT (key) DO NOTHING;

