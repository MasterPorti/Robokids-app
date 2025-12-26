-- Políticas adicionales para UPDATE y DELETE en la tabla alumnos
-- Ejecuta esto en el SQL Editor de Supabase

-- 5. REGLA PARA ACTUALIZAR (Update)
-- Los profesores pueden actualizar solo sus propios alumnos
CREATE POLICY "Permitir Actualizar Propios"
ON public.alumnos
FOR UPDATE
TO authenticated
USING (auth.uid() = profesor_id)
WITH CHECK (auth.uid() = profesor_id);

-- 6. REGLA PARA ELIMINAR (Delete)
-- Los profesores pueden eliminar solo sus propios alumnos
CREATE POLICY "Permitir Eliminar Propios"
ON public.alumnos
FOR DELETE
TO authenticated
USING (auth.uid() = profesor_id);
