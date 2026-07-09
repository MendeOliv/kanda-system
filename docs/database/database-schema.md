# Kanda — Modelo de Dados (Postgres/Supabase)

```sql
-- Users (clientes)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  zone TEXT CHECK (zone IN ('kk5000', 'kilamba')),
  reference TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  active BOOLEAN DEFAULT true
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  unit_price DECIMAL(10,2) NOT NULL,
  unit_type TEXT CHECK (unit_type IN ('unidade','kg','litro','pacote')),
  stock_quantity INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  channel TEXT CHECK (channel IN ('site','whatsapp')),
  status TEXT CHECK (status IN ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled')),
  delivery_zone TEXT CHECK (delivery_zone IN ('kk5000','kilamba')),
  delivery_fee DECIMAL(10,2),
  total DECIMAL(10,2),
  payment_method TEXT CHECK (payment_method IN ('dinheiro','appypay')),
  payment_status TEXT CHECK (payment_status IN ('pending','paid','failed')),
  rider_name TEXT,
  rider_phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name_snapshot TEXT NOT NULL,
  unit_price_snapshot DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL
);

-- Payments (AppyPay logs)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  provider TEXT DEFAULT 'appypay',
  transaction_id TEXT,
  status TEXT CHECK (status IN ('pending','paid','failed')),
  raw_webhook_payload JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Context (memória do WhatsApp)
CREATE TABLE ai_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_phone TEXT UNIQUE NOT NULL,
  conversation_state JSONB,
  last_order_summary JSONB,
  last_interaction_at TIMESTAMP DEFAULT NOW()
);
Regra de Ouro: Atualizar products.stock_quantity e criar orders + order_items na mesma transação SQL.
```