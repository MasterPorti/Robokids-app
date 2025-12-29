-- Política para permitir que los alumnos vean su propia información
-- Esta política permite que un alumno autenticado pueda leer su propio registro

CREATE POLICY "Alumnos pueden ver su propia información"
ON public.alumnos
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Opcional: Si quieres que los alumnos puedan actualizar ciertos campos de su perfil
-- CREATE POLICY "Alumnos pueden actualizar su propia información"
-- ON public.alumnos
-- FOR UPDATE
-- TO authenticated
-- USING (auth.uid() = id)
-- WITH CHECK (auth.uid() = id);
