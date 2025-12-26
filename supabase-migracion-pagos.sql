-- ============================================
-- MIGRACIÓN: SISTEMA DE PAGOS
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. AGREGAR CAMPOS A TABLA ALUMNOS
-- ============================================

ALTER TABLE public.alumnos
ADD COLUMN IF NOT EXISTS mensualidad DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true;

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_alumnos_activo ON public.alumnos(activo);
CREATE INDEX IF NOT EXISTS idx_alumnos_profesor_activo ON public.alumnos(profesor_id, activo);

-- 2. CREAR TABLA PAGOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.pagos (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Referencias (Foreign Keys)
    alumno_id UUID NOT NULL REFERENCES public.alumnos(id) ON DELETE CASCADE,
    profesor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Período de pago (mes/año que se está pagando)
    periodo_mes INTEGER NOT NULL CHECK (periodo_mes >= 1 AND periodo_mes <= 12),
    periodo_anio INTEGER NOT NULL CHECK (periodo_anio >= 2020 AND periodo_anio <= 2100),

    -- Detalles del pago
    fecha_pago DATE NOT NULL DEFAULT CURRENT_DATE,
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    metodo_pago VARCHAR(50) NOT NULL DEFAULT 'efectivo'
        CHECK (metodo_pago IN ('efectivo', 'transferencia', 'otro')),

    -- Notas opcionales
    notas TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraint: Un alumno no puede tener dos pagos para el mismo mes/año
    CONSTRAINT unique_pago_periodo UNIQUE (alumno_id, periodo_mes, periodo_anio)
);

-- 3. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_pagos_alumno_id ON public.pagos(alumno_id);
CREATE INDEX IF NOT EXISTS idx_pagos_profesor_id ON public.pagos(profesor_id);
CREATE INDEX IF NOT EXISTS idx_pagos_periodo ON public.pagos(periodo_anio DESC, periodo_mes DESC);
CREATE INDEX IF NOT EXISTS idx_pagos_alumno_periodo ON public.pagos(alumno_id, periodo_anio DESC, periodo_mes DESC);

-- 4. HABILITAR ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

-- 5. CREAR POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Política para INSERT (Crear pagos)
-- Solo puedes crear pagos si eres el profesor del alumno
CREATE POLICY "Profesores pueden insertar pagos"
ON public.pagos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profesor_id);

-- Política para SELECT (Ver pagos)
-- Solo puedes ver los pagos que tú creaste
CREATE POLICY "Profesores pueden ver sus pagos"
ON public.pagos
FOR SELECT
TO authenticated
USING (auth.uid() = profesor_id);

-- Política para UPDATE (Actualizar pagos)
-- Solo puedes actualizar los pagos que tú creaste
CREATE POLICY "Profesores pueden actualizar sus pagos"
ON public.pagos
FOR UPDATE
TO authenticated
USING (auth.uid() = profesor_id)
WITH CHECK (auth.uid() = profesor_id);

-- Política para DELETE (Eliminar pagos)
-- Solo puedes eliminar los pagos que tú creaste
CREATE POLICY "Profesores pueden eliminar sus pagos"
ON public.pagos
FOR DELETE
TO authenticated
USING (auth.uid() = profesor_id);

-- 6. CREAR TRIGGER PARA updated_at
-- ============================================

CREATE TRIGGER update_pagos_updated_at
    BEFORE UPDATE ON public.pagos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. VERIFICAR LA CONFIGURACIÓN
-- ============================================

-- Ver la estructura de la tabla pagos
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pagos'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver las políticas RLS de pagos
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'pagos';

-- Verificar que RLS esté habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'pagos';

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================

SELECT '✅ Migración completada exitosamente!' as status;
