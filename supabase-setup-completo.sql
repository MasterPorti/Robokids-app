-- ============================================
-- CONFIGURACIÓN COMPLETA DE LA TABLA ALUMNOS
-- ============================================
-- Ejecuta este script completo en el SQL Editor de Supabase

-- 1. ELIMINAR TODO LO ANTERIOR (si existe)
-- ============================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Permitir Insertar Auth" ON public.alumnos;
DROP POLICY IF EXISTS "Permitir Ver Propios" ON public.alumnos;
DROP POLICY IF EXISTS "Permitir Actualizar Propios" ON public.alumnos;
DROP POLICY IF EXISTS "Permitir Eliminar Propios" ON public.alumnos;
DROP POLICY IF EXISTS "Profesores insertar" ON public.alumnos;
DROP POLICY IF EXISTS "Profesores ver" ON public.alumnos;
DROP POLICY IF EXISTS "Profesores pueden insertar alumnos" ON public.alumnos;
DROP POLICY IF EXISTS "Profesores pueden ver sus alumnos" ON public.alumnos;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.alumnos;

-- Eliminar tabla si existe
DROP TABLE IF EXISTS public.alumnos CASCADE;

-- 2. CREAR LA TABLA ALUMNOS
-- ============================================

CREATE TABLE public.alumnos (
    -- ID del usuario en auth.users (clave primaria)
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- ID del profesor que creó este alumno
    profesor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Información del alumno
    nombre_completo TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,

    -- Información del tutor/padre
    nombre_tutor TEXT NOT NULL,
    telefono_tutor TEXT NOT NULL,

    -- Información administrativa
    fecha_inscripcion DATE NOT NULL DEFAULT CURRENT_DATE,
    dia_pago INTEGER NOT NULL CHECK (dia_pago >= 1 AND dia_pago <= 31),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- ============================================

CREATE INDEX idx_alumnos_profesor_id ON public.alumnos(profesor_id);
CREATE INDEX idx_alumnos_username ON public.alumnos(username);
CREATE INDEX idx_alumnos_created_at ON public.alumnos(created_at DESC);

-- 4. HABILITAR ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.alumnos ENABLE ROW LEVEL SECURITY;

-- 5. CREAR POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Política para INSERT (Crear alumnos)
-- Cualquier usuario autenticado puede insertar
CREATE POLICY "Permitir Insertar Autenticados"
ON public.alumnos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para SELECT (Ver alumnos)
-- Solo puedes ver los alumnos que tú creaste
CREATE POLICY "Permitir Ver Propios"
ON public.alumnos
FOR SELECT
TO authenticated
USING (auth.uid() = profesor_id);

-- Política para UPDATE (Actualizar alumnos)
-- Solo puedes actualizar los alumnos que tú creaste
CREATE POLICY "Permitir Actualizar Propios"
ON public.alumnos
FOR UPDATE
TO authenticated
USING (auth.uid() = profesor_id)
WITH CHECK (auth.uid() = profesor_id);

-- Política para DELETE (Eliminar alumnos)
-- Solo puedes eliminar los alumnos que tú creaste
CREATE POLICY "Permitir Eliminar Propios"
ON public.alumnos
FOR DELETE
TO authenticated
USING (auth.uid() = profesor_id);

-- 6. CREAR FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. CREAR TRIGGER PARA updated_at
-- ============================================

CREATE TRIGGER update_alumnos_updated_at
    BEFORE UPDATE ON public.alumnos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. VERIFICAR LA CONFIGURACIÓN
-- ============================================

-- Ver la estructura de la tabla
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'alumnos'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver las políticas RLS
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'alumnos';

-- Verificar que RLS esté habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'alumnos';

-- ============================================
-- FIN DE LA CONFIGURACIÓN
-- ============================================

-- Si todo salió bien, deberías ver:
-- ✅ Tabla creada con todas las columnas
-- ✅ 4 políticas RLS activas (INSERT, SELECT, UPDATE, DELETE)
-- ✅ rowsecurity = true

SELECT '✅ Configuración completada exitosamente!' as status;
