-- =====================================================
-- SISTEMA COMPLETO DE JUEGO EDUCATIVO PARA NIÑOS
-- Base de datos desde cero
-- =====================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. MAESTROS/PROFESORES
-- =====================================================

CREATE TABLE maestros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  usuario TEXT UNIQUE NOT NULL,  -- Usuario para login (ej: "profe_maria")
  password TEXT NOT NULL,         -- Hash de contraseña
  email TEXT,                     -- Email opcional
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Índice para búsqueda rápida
CREATE INDEX idx_maestros_usuario ON maestros(usuario);

-- =====================================================
-- 2. ALUMNOS (SISTEMA SIMPLE PARA NIÑOS)
-- =====================================================

CREATE TABLE alumnos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  apellido TEXT,
  usuario TEXT UNIQUE NOT NULL,   -- Usuario simple (ej: "juanito2024")
  pin TEXT NOT NULL,              -- PIN de 4-6 dígitos (ej: "1234")
  avatar TEXT,                    -- URL o nombre del avatar
  edad INTEGER,
  maestro_id UUID REFERENCES maestros(id) ON DELETE CASCADE,  -- Maestro que lo creó
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_alumnos_usuario ON alumnos(usuario);
CREATE INDEX idx_alumnos_maestro ON alumnos(maestro_id);

-- =====================================================
-- 3. MÓDULOS (GRUPOS DE NIVELES)
-- =====================================================

CREATE TABLE modulos (
  id TEXT PRIMARY KEY,            -- ej: "modulo-1"
  titulo TEXT NOT NULL,           -- ej: "Circuitos en Serie"
  descripcion TEXT,
  icono TEXT,                     -- Emoji o URL de icono
  orden INTEGER NOT NULL,
  color TEXT DEFAULT '#3b82f6',  -- Color para UI
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. NIVELES (DENTRO DE MÓDULOS)
-- =====================================================

CREATE TABLE niveles (
  id TEXT PRIMARY KEY,            -- ej: "mod1-niv1"
  modulo_id TEXT REFERENCES modulos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  orden INTEGER NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_niveles_modulo ON niveles(modulo_id);

-- =====================================================
-- 5. RETOS (CIRCUIT O QUESTION)
-- =====================================================

CREATE TABLE retos (
  id TEXT PRIMARY KEY,            -- ej: "mod1-niv1-reto-1"
  nivel_id TEXT REFERENCES niveles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('circuit', 'question')),
  orden INTEGER NOT NULL,
  titulo TEXT,
  config JSONB NOT NULL,          -- Configuración del reto
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_retos_nivel ON retos(nivel_id);

-- =====================================================
-- 6. PROGRESO DE ALUMNOS
-- =====================================================

CREATE TABLE progreso_alumno (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  reto_id TEXT REFERENCES retos(id) ON DELETE CASCADE,
  completado BOOLEAN DEFAULT FALSE,
  intentos INTEGER DEFAULT 0,
  estrellas INTEGER DEFAULT 0,    -- 0-3 estrellas
  tiempo_segundos INTEGER,        -- Tiempo que tardó
  completado_en TIMESTAMP,
  ultima_actualizacion TIMESTAMP DEFAULT NOW(),
  UNIQUE(alumno_id, reto_id)
);

CREATE INDEX idx_progreso_alumno ON progreso_alumno(alumno_id);
CREATE INDEX idx_progreso_reto ON progreso_alumno(reto_id);

-- =====================================================
-- 7. MÓDULOS DESBLOQUEADOS (POR MAESTRO)
-- =====================================================

CREATE TABLE modulos_desbloqueados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  modulo_id TEXT REFERENCES modulos(id) ON DELETE CASCADE,
  desbloqueado_por UUID REFERENCES maestros(id),
  desbloqueado_en TIMESTAMP DEFAULT NOW(),
  UNIQUE(alumno_id, modulo_id)
);

CREATE INDEX idx_modulos_desbloqueados_alumno ON modulos_desbloqueados(alumno_id);

-- =====================================================
-- 8. LOGROS/INSIGNIAS (OPCIONAL)
-- =====================================================

CREATE TABLE logros (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  icono TEXT,
  tipo TEXT CHECK (tipo IN ('completar_modulo', 'racha', 'perfecto', 'rapido')),
  condicion JSONB,                -- Condición para obtenerlo
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE logros_alumno (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id UUID REFERENCES alumnos(id) ON DELETE CASCADE,
  logro_id TEXT REFERENCES logros(id) ON DELETE CASCADE,
  obtenido_en TIMESTAMP DEFAULT NOW(),
  UNIQUE(alumno_id, logro_id)
);

CREATE INDEX idx_logros_alumno ON logros_alumno(alumno_id);

-- =====================================================
-- 9. DATOS DE EJEMPLO
-- =====================================================

-- MAESTRO DE EJEMPLO
INSERT INTO maestros (nombre, apellido, usuario, password, email) VALUES
('María', 'García', 'profe_maria', 'hash_password_aqui', 'maria@escuela.com'),
('Juan', 'Pérez', 'profe_juan', 'hash_password_aqui', 'juan@escuela.com');

-- ALUMNOS DE EJEMPLO (crear después de tener maestros)
INSERT INTO alumnos (nombre, apellido, usuario, pin, avatar, edad, maestro_id) VALUES
('Juanito', 'López', 'juanito', '1234', '🦖', 7, (SELECT id FROM maestros WHERE usuario = 'profe_maria')),
('Sofía', 'Martínez', 'sofia', '5678', '🦄', 8, (SELECT id FROM maestros WHERE usuario = 'profe_maria')),
('Pedro', 'Ramírez', 'pedrito', '9999', '🚀', 6, (SELECT id FROM maestros WHERE usuario = 'profe_juan'));

-- MÓDULOS
INSERT INTO modulos (id, titulo, descripcion, icono, orden, color) VALUES
('modulo-1', 'Circuitos Básicos', 'Aprende los fundamentos de electricidad', '⚡', 1, '#3b82f6'),
('modulo-2', 'Circuitos en Serie', 'Conecta componentes en serie', '🔌', 2, '#8b5cf6'),
('modulo-3', 'Circuitos en Paralelo', 'Descubre circuitos en paralelo', '🔋', 3, '#10b981');

-- NIVELES MÓDULO 1
INSERT INTO niveles (id, modulo_id, titulo, descripcion, orden) VALUES
('mod1-niv1', 'modulo-1', 'Introducción', 'Primeros pasos con electricidad', 1),
('mod1-niv2', 'modulo-1', 'Componentes Básicos', 'Conoce LEDs y baterías', 2),
('mod1-niv3', 'modulo-1', 'Primer Circuito', 'Construye tu primer circuito', 3);

-- NIVELES MÓDULO 2
INSERT INTO niveles (id, modulo_id, titulo, descripcion, orden) VALUES
('mod2-niv1', 'modulo-2', 'Serie Básico', 'Circuitos en serie simples', 1),
('mod2-niv2', 'modulo-2', 'Serie con Switch', 'Agrega interruptores', 2);

-- RETOS NIVEL 1 MÓDULO 1 (Introducción)
INSERT INTO retos (id, nivel_id, tipo, orden, titulo, config) VALUES
('mod1-niv1-reto-1', 'mod1-niv1', 'circuit', 1, '¿Qué es la electricidad?', '{}'),
('mod1-niv1-reto-2', 'mod1-niv1', 'question', 2, 'Pregunta sobre electricidad', '{}'),
('mod1-niv1-reto-3', 'mod1-niv1', 'circuit', 3, 'Flujo de electrones', '{}');

-- RETOS NIVEL 2 MÓDULO 1 (Componentes)
INSERT INTO retos (id, nivel_id, tipo, orden, titulo, config) VALUES
('mod1-niv2-reto-1', 'mod1-niv2', 'circuit', 1, 'La batería', '{}'),
('mod1-niv2-reto-2', 'mod1-niv2', 'question', 2, '¿Qué hace una batería?', '{}'),
('mod1-niv2-reto-3', 'mod1-niv2', 'circuit', 3, 'El LED', '{}');

-- DESBLOQUEAR MÓDULO 1 PARA TODOS LOS ALUMNOS
INSERT INTO modulos_desbloqueados (alumno_id, modulo_id, desbloqueado_por)
SELECT
  a.id,
  'modulo-1',
  (SELECT id FROM maestros LIMIT 1)
FROM alumnos a;

-- LOGROS DE EJEMPLO
INSERT INTO logros (id, titulo, descripcion, icono, tipo) VALUES
('primera-victoria', 'Primera Victoria', 'Completa tu primer reto', '🎉', 'completar_modulo'),
('racha-7', 'Racha de 7 días', 'Juega 7 días seguidos', '🔥', 'racha'),
('perfeccionista', 'Perfeccionista', 'Completa un nivel sin errores', '⭐', 'perfecto'),
('velocista', 'Velocista', 'Completa un reto en menos de 30 segundos', '⚡', 'rapido');

-- =====================================================
-- 10. VISTAS ÚTILES
-- =====================================================

-- Vista: Progreso por alumno y módulo
CREATE VIEW vista_progreso_modulos AS
SELECT
  a.id as alumno_id,
  a.nombre as alumno_nombre,
  m.id as modulo_id,
  m.titulo as modulo_titulo,
  COUNT(DISTINCT r.id) as total_retos,
  COUNT(DISTINCT CASE WHEN pa.completado THEN r.id END) as retos_completados,
  ROUND(
    (COUNT(DISTINCT CASE WHEN pa.completado THEN r.id END)::NUMERIC /
     NULLIF(COUNT(DISTINCT r.id), 0) * 100)
  , 0) as porcentaje_progreso
FROM alumnos a
CROSS JOIN modulos m
LEFT JOIN niveles n ON n.modulo_id = m.id
LEFT JOIN retos r ON r.nivel_id = n.id AND r.activo = TRUE
LEFT JOIN progreso_alumno pa ON pa.alumno_id = a.id AND pa.reto_id = r.id
WHERE a.activo = TRUE AND m.activo = TRUE
GROUP BY a.id, a.nombre, m.id, m.titulo;

-- Vista: Alumnos por maestro con stats
CREATE VIEW vista_alumnos_maestro AS
SELECT
  m.id as maestro_id,
  m.nombre as maestro_nombre,
  a.id as alumno_id,
  a.nombre as alumno_nombre,
  a.usuario as alumno_usuario,
  a.avatar,
  a.edad,
  COUNT(DISTINCT pa.reto_id) FILTER (WHERE pa.completado) as retos_completados,
  COUNT(DISTINCT la.logro_id) as logros_obtenidos,
  a.creado_en
FROM maestros m
LEFT JOIN alumnos a ON a.maestro_id = m.id AND a.activo = TRUE
LEFT JOIN progreso_alumno pa ON pa.alumno_id = a.id
LEFT JOIN logros_alumno la ON la.alumno_id = a.id
WHERE m.activo = TRUE
GROUP BY m.id, m.nombre, a.id, a.nombre, a.usuario, a.avatar, a.edad, a.creado_en;

-- =====================================================
-- 11. FUNCIONES ÚTILES
-- =====================================================

-- Función: Obtener siguiente reto disponible para un alumno
CREATE OR REPLACE FUNCTION obtener_siguiente_reto(p_alumno_id UUID, p_modulo_id TEXT)
RETURNS TABLE(reto_id TEXT, nivel_id TEXT, tipo TEXT, titulo TEXT, orden INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.nivel_id,
    r.tipo,
    r.titulo,
    r.orden
  FROM retos r
  INNER JOIN niveles n ON r.nivel_id = n.id
  LEFT JOIN progreso_alumno pa ON pa.reto_id = r.id AND pa.alumno_id = p_alumno_id
  WHERE n.modulo_id = p_modulo_id
    AND r.activo = TRUE
    AND (pa.completado IS NULL OR pa.completado = FALSE)
  ORDER BY n.orden, r.orden
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Función: Calcular estrellas basado en intentos
CREATE OR REPLACE FUNCTION calcular_estrellas(p_intentos INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    WHEN p_intentos = 1 THEN 3
    WHEN p_intentos <= 2 THEN 2
    WHEN p_intentos <= 4 THEN 1
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql;

-- Función: Verificar si módulo está desbloqueado
CREATE OR REPLACE FUNCTION modulo_desbloqueado(p_alumno_id UUID, p_modulo_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM modulos_desbloqueados
    WHERE alumno_id = p_alumno_id AND modulo_id = p_modulo_id
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. TRIGGERS
-- =====================================================

-- Trigger: Actualizar fecha de completado
CREATE OR REPLACE FUNCTION actualizar_completado_en()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completado = TRUE AND OLD.completado = FALSE THEN
    NEW.completado_en = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_completado
  BEFORE UPDATE ON progreso_alumno
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_completado_en();

-- =====================================================
-- 13. COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE maestros IS 'Profesores que gestionan alumnos y desbloquean módulos';
COMMENT ON TABLE alumnos IS 'Estudiantes (niños 6-10 años) con sistema de login simple';
COMMENT ON TABLE modulos IS 'Agrupación principal de contenido educativo';
COMMENT ON TABLE niveles IS 'Niveles dentro de cada módulo';
COMMENT ON TABLE retos IS 'Retos individuales (circuit o question)';
COMMENT ON TABLE progreso_alumno IS 'Seguimiento del progreso de cada alumno';
COMMENT ON TABLE modulos_desbloqueados IS 'Módulos que el alumno puede acceder';
COMMENT ON TABLE logros IS 'Insignias y logros disponibles';
COMMENT ON TABLE logros_alumno IS 'Logros obtenidos por cada alumno';

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================

-- Para verificar que todo se creó correctamente:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
