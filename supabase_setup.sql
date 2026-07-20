-- ============================================================
-- FJ GENERAL & ENGINEERING SERVICES - Supabase Setup SQL
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. QUOTES TABLE (FJ fields)
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_required TEXT,
  location TEXT,
  message TEXT,
  images TEXT[],
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INVOICES TABLE (FJ fields — service_type replaces car_model)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  document_type TEXT DEFAULT 'invoice',
  quote_id UUID,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  service_type TEXT,
  location TEXT,
  description TEXT,
  invoice_date DATE,
  total_amount NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'draft',
  original_invoice_id UUID,
  converted_from_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INVOICE ITEMS TABLE (service_type replaces repair_type)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  service_type TEXT,
  description TEXT,
  amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. GALLERY ITEMS TABLE (parent — cover image + metadata)
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GALLERY IMAGES TABLE (child — multiple images per project)
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_item_id UUID NOT NULL REFERENCES gallery_items(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  details TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED: Admin user (email: admin  password: admin123!)
-- ============================================================
INSERT INTO admins (email, password_hash)
VALUES (
  'admin',
  '$2a$10$NpXjGcUX78nR.x3D69bVq.YlXPDbk52lBxtkTXujWIN4HobqQrNSu'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- SEED: 8 FJ Services
-- ============================================================
INSERT INTO services (title, description, details, is_active, display_order) VALUES
  ('Tree Felling & Rubble Removal', 'Safe removal of hazardous trees, site clearing and responsible disposal of garden and building rubble.', 'Waste disposal certificates provided. All sizes of trees handled.', true, 1),
  ('Stump Removal & Grinding', 'Complete stump removal for landscaping and construction. Ground flush, no mess left behind.', 'Suitable for residential and commercial sites.', true, 2),
  ('Tar Resurfacing', 'Driveways, parking lots and private roads. Crack sealing, pothole patching and full hot asphalt resurfacing.', 'SABS compliant materials used on all projects.', true, 3),
  ('Road Line Marking', 'Professional thermoplastic and reflective paint marking for roads, parking bays and warehouses.', 'SABS compliant. Reflective and non-reflective options available.', true, 4),
  ('Tennis & Sports Court Marking', 'Accurate line marking for tennis, netball and basketball courts. Durable, weather-resistant paint.', 'All court types and sizes accommodated.', true, 5),
  ('Pothole Filling & Speed Hump Marking', 'Permanent cold mix and hot asphalt pothole repairs. New speed hump construction plus reflective marking.', 'Fast turnaround for commercial and residential clients.', true, 6),
  ('Wendy Houses', 'New and refurbished timber Wendy houses. Perfect for offices, guard houses or storage. Delivery and installation included.', 'Custom sizes available on request.', true, 7),
  ('Jacketed Pots & Boiler Making', 'Custom SS304 jacketed cooking pots and stainless fabrication, 50L–1000L. Food grade TIG welds, PID control and oil heating.', 'CE certified materials. Custom sizes and configurations available.', true, 8)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DISABLE RLS (backend uses service role key)
-- ============================================================
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
