-- =====================================================
-- EJEMPLO: AGREGAR NUEVO RETO A LA BASE DE DATOS
-- =====================================================

-- Este es el reto que acabamos de crear:
-- Archivo: app/game/data/contenido/modulo-1/nivel-1/reto-4-question.ts
-- Registry: Ya registrado en retos-registry.ts

-- PASO 3: Insertar en la base de datos
INSERT INTO challenges (id, level_id, type, order_num, title, config) VALUES
('mod1-lv1-ch4', 'mod1-lv1', 'question', 4, 'Componentes Básicos', '{}');

-- =====================================================
-- CÓMO AGREGAR MÁS RETOS
-- =====================================================

-- EJEMPLO 1: Otro reto de preguntas en el mismo nivel
INSERT INTO challenges (id, level_id, type, order_num, title, config) VALUES
('mod1-lv1-ch5', 'mod1-lv1', 'question', 5, 'Mi Pregunta', '{}');

-- EJEMPLO 2: Reto de circuito en nivel 2
INSERT INTO challenges (id, level_id, type, order_num, title, config) VALUES
('mod1-lv2-ch2', 'mod1-lv2', 'circuit', 2, 'Circuito Serie', '{}');

-- EJEMPLO 3: Crear un nivel completamente nuevo
INSERT INTO levels (id, module_id, title, description, order_num) VALUES
('mod1-lv3', 'module-1', 'Nivel 3', 'Circuitos avanzados', 3);

-- Y luego agregar retos a ese nivel:
INSERT INTO challenges (id, level_id, type, order_num, title, config) VALUES
('mod1-lv3-ch1', 'mod1-lv3', 'circuit', 1, 'Primer reto del nivel 3', '{}'),
('mod1-lv3-ch2', 'mod1-lv3', 'question', 2, 'Pregunta del nivel 3', '{}');

-- =====================================================
-- VERIFICAR QUE SE INSERTÓ CORRECTAMENTE
-- =====================================================

-- Ver todos los retos del módulo 1:
SELECT
  c.id,
  c.title,
  c.type,
  c.order_num,
  l.title as level_title
FROM challenges c
JOIN levels l ON c.level_id = l.id
WHERE l.module_id = 'module-1'
ORDER BY l.order_num, c.order_num;

-- Ver estructura completa:
SELECT
  m.title as module,
  l.title as level,
  c.id as challenge_id,
  c.title as challenge,
  c.type,
  c.order_num
FROM modules m
JOIN levels l ON l.module_id = m.id
JOIN challenges c ON c.level_id = l.id
ORDER BY m.order_num, l.order_num, c.order_num;
