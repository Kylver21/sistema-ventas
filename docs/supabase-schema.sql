-- =============================================
-- SISTEMA DE VENTAS - Schema Supabase
-- Ejecutar en: Supabase → SQL Editor → New Query
-- =============================================

-- 1. TABLA PROFILES (extiende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre     TEXT NOT NULL,
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categorias (
  id          SERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA PRODUCTOS
CREATE TABLE IF NOT EXISTS public.productos (
  id             SERIAL PRIMARY KEY,
  nombre         TEXT NOT NULL,
  categoria_id   INT REFERENCES public.categorias(id) ON DELETE SET NULL,
  precio         DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
  precio_compra  DECIMAL(10,2) CHECK (precio_compra >= 0),
  stock          INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  codigo_barras  TEXT UNIQUE,
  activo         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA VENTAS (cabecera)
CREATE TABLE IF NOT EXISTS public.ventas (
  id             SERIAL PRIMARY KEY,
  cliente_nombre TEXT,
  total          DECIMAL(10,2) NOT NULL DEFAULT 0,
  fecha          DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA VENTA_DETALLE (líneas de venta)
CREATE TABLE IF NOT EXISTS public.venta_detalle (
  id              SERIAL PRIMARY KEY,
  venta_id        INT REFERENCES public.ventas(id) ON DELETE CASCADE,
  producto_id     INT REFERENCES public.productos(id) ON DELETE SET NULL,
  cantidad        INT NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
  subtotal        DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venta_detalle ENABLE ROW LEVEL SECURITY;

-- Profiles: el usuario solo gestiona su propio perfil
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Categorias, Productos, Ventas, Detalle: cualquier usuario autenticado
CREATE POLICY "categorias_select" ON public.categorias
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "categorias_insert" ON public.categorias
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "categorias_update" ON public.categorias
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "categorias_delete" ON public.categorias
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "productos_select" ON public.productos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "productos_insert" ON public.productos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "productos_update" ON public.productos
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "productos_delete" ON public.productos
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "ventas_select" ON public.ventas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "ventas_insert" ON public.ventas
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "ventas_update" ON public.ventas
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "ventas_delete" ON public.ventas
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "venta_detalle_select" ON public.venta_detalle
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "venta_detalle_insert" ON public.venta_detalle
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "venta_detalle_delete" ON public.venta_detalle
  FOR DELETE TO authenticated USING (true);

-- =============================================
-- TRIGGER: crear profile al registrar usuario
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Migraciones si ya existía el schema anterior:
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS rol;
-- ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;
-- ALTER TABLE public.ventas DROP COLUMN IF EXISTS producto_id, DROP COLUMN IF EXISTS cantidad,
--   DROP COLUMN IF EXISTS precio_unitario, DROP COLUMN IF EXISTS estado, DROP COLUMN IF EXISTS vendedor_id;

-- =============================================
-- DATOS DE EJEMPLO - Bodega Peruana
-- =============================================
INSERT INTO public.categorias (nombre, descripcion) VALUES
  ('Abarrotes',        'Arroz, azúcar, aceite, fideos y básicos'),
  ('Lácteos y huevos', 'Leche, yogurt, huevos, mantequilla'),
  ('Bebidas',          'Gaseosas, agua, jugos, cerveza'),
  ('Conservas',        'Atún, sardinas, leche evaporada en lata'),
  ('Panadería',        'Pan, galletas y pastelería'),
  ('Snacks',           'Papas, chifles, galletas, caramelos'),
  ('Limpieza',         'Detergente, papel higiénico, lavavajilla'),
  ('Aseo personal',    'Jabón, champú, pasta dental')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO public.productos (nombre, categoria_id, precio, precio_compra, stock, codigo_barras) VALUES
  -- Abarrotes (cat 1)
  ('Arroz extra 1 kg',          1,  2.80, 2.20, 200, '7750408012345'),
  ('Azúcar rubia 1 kg',         1,  3.20, 2.60, 180, '7750408023456'),
  ('Aceite vegetal 1 litro',    1,  8.50, 6.80,  90, '7750408034567'),
  ('Fideos tallarin 500g',      1,  2.50, 1.90, 150, '7750408045678'),
  ('Sal yodada 1 kg',           1,  1.00, 0.70, 120, '7750408056789'),
  ('Harina sin preparar 1 kg',  1,  3.00, 2.30, 100, '7750408057890'),
  ('Lenteja serrana 500g',      1,  3.50, 2.80,  80, '7750408067890'),
  ('Frijol canario 500g',       1,  3.80, 3.00,  70, '7750408068901'),
  ('Avena precocida 180g',      1,  2.50, 1.80,  90, '7750408069012'),
  -- Lácteos y huevos (cat 2)
  ('Leche Gloria evap. 400g',   2,  4.50, 3.60, 120, '7750408089012'),
  ('Huevo rosado unidad',        2,  0.50, 0.38, 300,  NULL),
  ('Yogurt bebible 1 litro',    2,  6.50, 5.00,  60, '7750408090123'),
  ('Mantequilla con sal 100g',  2,  4.00, 3.20,  50, '7750408101234'),
  ('Queso fresco 250g',         2,  7.00, 5.50,  40, '7750408102345'),
  -- Bebidas (cat 3)
  ('Gaseosa Inca Kola 500ml',   3,  2.50, 1.90, 150, '7750408123456'),
  ('Gaseosa Coca-Cola 500ml',   3,  2.50, 1.90, 150, '7750408124567'),
  ('Agua mineral 625ml',        3,  1.50, 1.10, 200, '7750408134567'),
  ('Cerveza Pilsen 630ml',      3,  7.00, 5.50,  80, '7750408145678'),
  ('Jugo Pulp naranja 300ml',   3,  3.00, 2.20, 100, '7750408146789'),
  ('Café instantáneo sachet',   3,  0.50, 0.35, 200,  NULL),
  -- Conservas (cat 4)
  ('Atún en trozos 170g',       4,  4.00, 3.10, 100, '7750408078901'),
  ('Sardinas en salsa 425g',    4,  5.50, 4.20,  80, '7750408079012'),
  ('Leche evap. Nestlé 400g',   4,  4.80, 3.80,  90, '7750408080123'),
  -- Panadería (cat 5)
  ('Pan francés unidad',         5,  0.20, 0.15,  50,  NULL),
  ('Galletas de soda paquete',  5,  1.50, 1.10, 100, '7750408156789'),
  ('Galletas rellenas 6 und',   5,  1.00, 0.70, 120, '7750408157890'),
  -- Snacks (cat 6)
  ('Papas fritas bolsa chica',  6,  2.00, 1.50,  80, '7750408167890'),
  ('Chifles de plátano 50g',    6,  1.50, 1.10,  70, '7750408168901'),
  ('Caramelos surtidos bolsa',  6,  2.50, 1.80,  60, '7750408169012'),
  -- Limpieza (cat 7)
  ('Detergente Ariel sachet',   7,  1.50, 1.10, 150, '7750408178901'),
  ('Papel higiénico rollo',     7,  1.00, 0.75, 200, '7750408189012'),
  ('Lavavajilla Ayudín pote',   7,  2.50, 1.90,  90, '7750408190123'),
  ('Lejía 500ml',               7,  3.50, 2.60,  80, '7750408191234'),
  -- Aseo personal (cat 8)
  ('Jabón de tocador Dove',     8,  2.50, 1.80, 120, '7750408201234'),
  ('Champú sachet',             8,  0.50, 0.35, 180,  NULL),
  ('Pasta dental 75ml',         8,  3.50, 2.60,  90, '7750408202345'),
  ('Papel toalla rollo',        8,  2.00, 1.50, 100, '7750408203456')
ON CONFLICT DO NOTHING;

-- =============================================
-- CREAR USUARIO (ejecutar DESPUÉS del schema)
-- En Supabase: Authentication → Users → Add user
-- Email: admin@tienda.com  Password: dueñotienda1
-- =============================================
