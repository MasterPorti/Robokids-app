-- =====================================================
-- SISTEMA DE JUEGO TIPO DUOLINGO
-- Migración de Base de Datos para Supabase
-- =====================================================

-- Tabla: modulos
CREATE TABLE IF NOT EXISTS modulos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  icono TEXT,
  orden INTEGER NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla: niveles
CREATE TABLE IF NOT EXISTS niveles (
  id TEXT PRIMARY KEY,
  modulo_id TEXT REFERENCES modulos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  orden INTEGER NOT NULL,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla: retos (challenges)
CREATE TABLE IF NOT EXISTS retos (
  id TEXT PRIMARY KEY,
  nivel_id TEXT REFERENCES niveles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('circuit', 'question')),
  orden INTEGER NOT NULL,
  titulo TEXT,
  config JSONB NOT NULL,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla: progreso del alumno
CREATE TABLE IF NOT EXISTS progreso_alumno (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  reto_id TEXT REFERENCES retos(id) ON DELETE CASCADE,
  completado BOOLEAN DEFAULT FALSE,
  intentos INTEGER DEFAULT 0,
  ultima_actualizacion TIMESTAMP DEFAULT NOW(),
  UNIQUE(alumno_id, reto_id)
);

-- Tabla: desbloqueos de módulos (por maestro)
CREATE TABLE IF NOT EXISTS modulos_desbloqueados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  modulo_id TEXT REFERENCES modulos(id) ON DELETE CASCADE,
  desbloqueado_por UUID REFERENCES profesores(id),
  desbloqueado_en TIMESTAMP DEFAULT NOW(),
  UNIQUE(alumno_id, modulo_id)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_progreso_alumno ON progreso_alumno(alumno_id);
CREATE INDEX IF NOT EXISTS idx_niveles_modulo ON niveles(modulo_id);
CREATE INDEX IF NOT EXISTS idx_retos_nivel ON retos(nivel_id);
CREATE INDEX IF NOT EXISTS idx_modulos_desbloqueados ON modulos_desbloqueados(alumno_id);

-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================

-- Insertar módulo 1
INSERT INTO modulos (id, titulo, descripcion, orden, color, icono) VALUES
('modulo-1', 'Circuitos en Serie', 'Aprende los fundamentos de los circuitos en serie', 1, '#3b82f6', '⚡');

-- Insertar niveles del módulo 1
INSERT INTO niveles (id, modulo_id, titulo, descripcion, orden) VALUES
('mod1-niv1', 'modulo-1', 'Introducción a Circuitos en Serie', 'Conceptos básicos de circuitos en serie', 1),
('mod1-niv2', 'modulo-1', 'Circuitos con Interruptores', 'Aprende sobre interruptores en circuitos', 2);

-- Insertar retos del nivel 1
INSERT INTO retos (id, nivel_id, tipo, orden, titulo, config) VALUES
('mod1-niv1-reto-1', 'mod1-niv1', 'circuit', 1, 'Circuito en Serie - Parte 1', '{}'),
('mod1-niv1-reto-2', 'mod1-niv1', 'question', 2, 'Pregunta sobre Circuito en Serie', '{}'),
('mod1-niv1-reto-3', 'mod1-niv1', 'circuit', 3, 'Circuito con Interruptor', '{}');

-- Insertar retos del nivel 2
INSERT INTO retos (id, nivel_id, tipo, orden, titulo, config) VALUES
('mod1-niv2-reto-1', 'mod1-niv2', 'question', 1, 'Pregunta sobre Interruptores', '{}');

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE niveles ENABLE ROW LEVEL SECURITY;
ALTER TABLE retos ENABLE ROW LEVEL SECURITY;
ALTER TABLE progreso_alumno ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos_desbloqueados ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer módulos, niveles y retos
CREATE POLICY "Todos pueden leer modulos" ON modulos FOR SELECT USING (true);
CREATE POLICY "Todos pueden leer niveles" ON niveles FOR SELECT USING (true);
CREATE POLICY "Todos pueden leer retos" ON retos FOR SELECT USING (true);

-- Política: Los alumnos solo pueden ver y actualizar su propio progreso
CREATE POLICY "Alumnos pueden ver su progreso" ON progreso_alumno
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM alumnos
      WHERE alumnos.id = progreso_alumno.alumno_id
      AND alumnos.user_id = auth.uid()
    )
  );

CREATE POLICY "Alumnos pueden insertar su progreso" ON progreso_alumno
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM alumnos
      WHERE alumnos.id = progreso_alumno.alumno_id
      AND alumnos.user_id = auth.uid()
    )
  );

CREATE POLICY "Alumnos pueden actualizar su progreso" ON progreso_alumno
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM alumnos
      WHERE alumnos.id = progreso_alumno.alumno_id
      AND alumnos.user_id = auth.uid()
    )
  );

-- Política: Alumnos pueden ver sus módulos desbloqueados
CREATE POLICY "Alumnos pueden ver sus modulos desbloqueados" ON modulos_desbloqueados
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM alumnos
      WHERE alumnos.id = modulos_desbloqueados.alumno_id
      AND alumnos.user_id = auth.uid()
    )
  );

-- Política: Profesores pueden desbloquear módulos
CREATE POLICY "Profesores pueden desbloquear modulos" ON modulos_desbloqueados
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profesores
      WHERE profesores.user_id = auth.uid()
    )
  );

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================
