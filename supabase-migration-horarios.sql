-- ============================================
-- MIGRACIÓN: Agregar Sucursales y Horarios
-- ============================================

-- 1. Crear tabla de horarios
CREATE TABLE IF NOT EXISTS horarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dia_semana TEXT NOT NULL CHECK (dia_semana IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  sucursal TEXT NOT NULL CHECK (sucursal IN ('Plaza Coacalco', 'Cofradia', 'Plaza Periferico')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Agregar índices para mejorar el rendimiento
CREATE INDEX idx_horarios_sucursal ON horarios(sucursal);
CREATE INDEX idx_horarios_dia_semana ON horarios(dia_semana);

-- 3. Modificar tabla alumnos para agregar sucursal y horario
ALTER TABLE alumnos
ADD COLUMN IF NOT EXISTS sucursal TEXT CHECK (sucursal IN ('Plaza Coacalco', 'Cofradia', 'Plaza Periferico')),
ADD COLUMN IF NOT EXISTS horario_id UUID REFERENCES horarios(id) ON DELETE SET NULL;

-- 4. Crear índice para horario_id en alumnos
CREATE INDEX IF NOT EXISTS idx_alumnos_horario_id ON alumnos(horario_id);
CREATE INDEX IF NOT EXISTS idx_alumnos_sucursal ON alumnos(sucursal);

-- 5. Habilitar RLS (Row Level Security) en la tabla horarios
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas de acceso para horarios
-- Política para que todos los usuarios autenticados puedan leer horarios
CREATE POLICY "Usuarios autenticados pueden ver horarios"
  ON horarios
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para que usuarios autenticados puedan crear horarios
CREATE POLICY "Usuarios autenticados pueden crear horarios"
  ON horarios
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para que usuarios autenticados puedan actualizar horarios
CREATE POLICY "Usuarios autenticados pueden actualizar horarios"
  ON horarios
  FOR UPDATE
  TO authenticated
  USING (true);

-- Política para que usuarios autenticados puedan eliminar horarios
CREATE POLICY "Usuarios autenticados pueden eliminar horarios"
  ON horarios
  FOR DELETE
  TO authenticated
  USING (true);

-- 7. Crear función para calcular hora_fin automáticamente (2 horas después de hora_inicio)
CREATE OR REPLACE FUNCTION set_hora_fin()
RETURNS TRIGGER AS $$
BEGIN
  NEW.hora_fin := NEW.hora_inicio + INTERVAL '2 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear trigger para calcular hora_fin antes de insertar o actualizar
CREATE TRIGGER trigger_set_hora_fin
  BEFORE INSERT OR UPDATE ON horarios
  FOR EACH ROW
  EXECUTE FUNCTION set_hora_fin();

-- 9. Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Crear trigger para actualizar updated_at en horarios
CREATE TRIGGER trigger_update_horarios_updated_at
  BEFORE UPDATE ON horarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Insertar algunos horarios de ejemplo (opcional)
INSERT INTO horarios (dia_semana, hora_inicio, sucursal) VALUES
  ('Lunes', '09:00', 'Plaza Coacalco'),
  ('Lunes', '11:00', 'Plaza Coacalco'),
  ('Lunes', '15:00', 'Plaza Coacalco'),
  ('Martes', '09:00', 'Cofradia'),
  ('Martes', '11:00', 'Cofradia'),
  ('Miércoles', '09:00', 'Plaza Periferico'),
  ('Miércoles', '15:00', 'Plaza Periferico'),
  ('Jueves', '10:00', 'Plaza Coacalco'),
  ('Viernes', '09:00', 'Cofradia'),
  ('Sábado', '10:00', 'Plaza Periferico')
ON CONFLICT DO NOTHING;

-- ============================================
-- CONSULTAS ÚTILES
-- ============================================

-- Ver todos los horarios por sucursal
-- SELECT * FROM horarios WHERE sucursal = 'Plaza Coacalco' ORDER BY dia_semana, hora_inicio;

-- Ver alumnos con sus horarios
-- SELECT
--   a.nombre,
--   a.sucursal,
--   h.dia_semana,
--   h.hora_inicio,
--   h.hora_fin
-- FROM alumnos a
-- LEFT JOIN horarios h ON a.horario_id = h.id
-- ORDER BY a.nombre;

-- Ver cuántos alumnos hay por horario
-- SELECT
--   h.sucursal,
--   h.dia_semana,
--   h.hora_inicio,
--   h.hora_fin,
--   COUNT(a.id) as total_alumnos
-- FROM horarios h
-- LEFT JOIN alumnos a ON h.id = a.horario_id
-- GROUP BY h.id, h.sucursal, h.dia_semana, h.hora_inicio, h.hora_fin
-- ORDER BY h.sucursal, h.dia_semana, h.hora_inicio;
