-- ============================================
-- MIGRACIÓN: INTEGRACIÓN CON STRIPE
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. AGREGAR CAMPO STRIPE_CUSTOMER_ID A TABLA ALUMNOS
-- ============================================

ALTER TABLE public.alumnos
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Índice para búsqueda rápida por stripe_customer_id
CREATE INDEX IF NOT EXISTS idx_alumnos_stripe_customer
ON public.alumnos(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

-- 2. ACTUALIZAR CONSTRAINT DE METODO_PAGO EN TABLA PAGOS
-- ============================================

-- Primero eliminamos el constraint anterior
ALTER TABLE public.pagos
DROP CONSTRAINT IF EXISTS pagos_metodo_pago_check;

-- Agregamos el nuevo constraint que incluye 'stripe'
ALTER TABLE public.pagos
ADD CONSTRAINT pagos_metodo_pago_check
CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta', 'stripe', 'otro'));

-- 3. AGREGAR CAMPO PARA REFERENCIA DE STRIPE EN PAGOS
-- ============================================

ALTER TABLE public.pagos
ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;

-- Índices para referencias de Stripe
CREATE INDEX IF NOT EXISTS idx_pagos_stripe_payment
ON public.pagos(stripe_payment_id)
WHERE stripe_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pagos_stripe_invoice
ON public.pagos(stripe_invoice_id)
WHERE stripe_invoice_id IS NOT NULL;

-- 4. VERIFICAR LA CONFIGURACIÓN
-- ============================================

-- Verificar los nuevos campos en alumnos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'alumnos'
  AND table_schema = 'public'
  AND column_name IN ('stripe_customer_id')
ORDER BY column_name;

-- Verificar los nuevos campos en pagos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pagos'
  AND table_schema = 'public'
  AND column_name IN ('stripe_payment_id', 'stripe_invoice_id')
ORDER BY column_name;

-- Verificar el nuevo constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.pagos'::regclass
  AND conname = 'pagos_metodo_pago_check';

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================

SELECT '✅ Migración de Stripe completada exitosamente!' as status;
