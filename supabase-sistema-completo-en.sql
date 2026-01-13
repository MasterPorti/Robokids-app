-- =====================================================
-- COMPLETE EDUCATIONAL GAME SYSTEM FOR KIDS
-- Database from scratch
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TEACHERS
-- =====================================================

CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,  -- Username for login (e.g., "teacher_maria")
  password TEXT NOT NULL,          -- Password hash
  email TEXT,                      -- Optional email
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX idx_teachers_username ON teachers(username);

-- =====================================================
-- 2. STUDENTS (SIMPLE SYSTEM FOR KIDS)
-- =====================================================

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT,
  username TEXT UNIQUE NOT NULL,   -- Simple username (e.g., "johnny2024")
  pin TEXT NOT NULL,               -- 4-6 digit PIN (e.g., "1234")
  avatar TEXT,                     -- URL or avatar name
  age INTEGER,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,  -- Teacher who created it
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_students_username ON students(username);
CREATE INDEX idx_students_teacher ON students(teacher_id);

-- =====================================================
-- 3. MODULES (GROUPS OF LEVELS)
-- =====================================================

CREATE TABLE modules (
  id TEXT PRIMARY KEY,            -- e.g., "module-1"
  title TEXT NOT NULL,            -- e.g., "Series Circuits"
  description TEXT,
  icon TEXT,                      -- Emoji or icon URL
  order_num INTEGER NOT NULL,
  color TEXT DEFAULT '#3b82f6',  -- Color for UI
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. LEVELS (INSIDE MODULES)
-- =====================================================

CREATE TABLE levels (
  id TEXT PRIMARY KEY,            -- e.g., "mod1-lv1"
  module_id TEXT REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_num INTEGER NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_levels_module ON levels(module_id);

-- =====================================================
-- 5. CHALLENGES (CIRCUIT OR QUESTION)
-- =====================================================

CREATE TABLE challenges (
  id TEXT PRIMARY KEY,            -- e.g., "mod1-lv1-ch1"
  level_id TEXT REFERENCES levels(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('circuit', 'question')),
  order_num INTEGER NOT NULL,
  title TEXT,
  config JSONB NOT NULL,          -- Challenge configuration
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_challenges_level ON challenges(level_id);

-- =====================================================
-- 6. STUDENT PROGRESS
-- =====================================================

CREATE TABLE student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  challenge_id TEXT REFERENCES challenges(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,         -- 0-3 stars
  time_seconds INTEGER,            -- Time taken
  completed_at TIMESTAMP,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, challenge_id)
);

CREATE INDEX idx_progress_student ON student_progress(student_id);
CREATE INDEX idx_progress_challenge ON student_progress(challenge_id);

-- =====================================================
-- 7. UNLOCKED MODULES (BY TEACHER)
-- =====================================================

CREATE TABLE unlocked_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  module_id TEXT REFERENCES modules(id) ON DELETE CASCADE,
  unlocked_by UUID REFERENCES teachers(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, module_id)
);

CREATE INDEX idx_unlocked_modules_student ON unlocked_modules(student_id);

-- =====================================================
-- 8. ACHIEVEMENTS/BADGES (OPTIONAL)
-- =====================================================

CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  type TEXT CHECK (type IN ('complete_module', 'streak', 'perfect', 'fast')),
  condition JSONB,                 -- Condition to obtain it
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE student_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id) ON DELETE CASCADE,
  obtained_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, achievement_id)
);

CREATE INDEX idx_student_achievements ON student_achievements(student_id);

-- =====================================================
-- 9. SAMPLE DATA
-- =====================================================

-- SAMPLE TEACHERS
INSERT INTO teachers (first_name, last_name, username, password, email) VALUES
('Maria', 'Garcia', 'teacher_maria', 'hash_password_here', 'maria@school.com'),
('John', 'Smith', 'teacher_john', 'hash_password_here', 'john@school.com');

-- SAMPLE STUDENTS (create after having teachers)
INSERT INTO students (first_name, last_name, username, pin, avatar, age, teacher_id) VALUES
('Johnny', 'Lopez', 'johnny', '1234', '🦖', 7, (SELECT id FROM teachers WHERE username = 'teacher_maria')),
('Sofia', 'Martinez', 'sofia', '5678', '🦄', 8, (SELECT id FROM teachers WHERE username = 'teacher_maria')),
('Peter', 'Ramirez', 'peter', '9999', '🚀', 6, (SELECT id FROM teachers WHERE username = 'teacher_john'));

-- MODULES
INSERT INTO modules (id, title, description, icon, order_num, color) VALUES
('module-1', 'Basic Circuits', 'Learn the fundamentals of electricity', '⚡', 1, '#3b82f6'),
('module-2', 'Series Circuits', 'Connect components in series', '🔌', 2, '#8b5cf6'),
('module-3', 'Parallel Circuits', 'Discover parallel circuits', '🔋', 3, '#10b981');

-- LEVELS MODULE 1
INSERT INTO levels (id, module_id, title, description, order_num) VALUES
('mod1-lv1', 'module-1', 'Introduction', 'First steps with electricity', 1),
('mod1-lv2', 'module-1', 'Basic Components', 'Learn about LEDs and batteries', 2),
('mod1-lv3', 'module-1', 'First Circuit', 'Build your first circuit', 3);

-- LEVELS MODULE 2
INSERT INTO levels (id, module_id, title, description, order_num) VALUES
('mod2-lv1', 'module-2', 'Basic Series', 'Simple series circuits', 1),
('mod2-lv2', 'module-2', 'Series with Switch', 'Add switches', 2);

-- CHALLENGES LEVEL 1 MODULE 1 (Introduction)
INSERT INTO challenges (id, level_id, type, order_num, title, config) VALUES
('mod1-lv1-ch1', 'mod1-lv1', 'circuit', 1, 'What is electricity?', '{}'),
('mod1-lv1-ch2', 'mod1-lv1', 'question', 2, 'Question about electricity', '{}'),
('mod1-lv1-ch3', 'mod1-lv1', 'circuit', 3, 'Electron flow', '{}');

-- CHALLENGES LEVEL 2 MODULE 1 (Components)
INSERT INTO challenges (id, level_id, type, order_num, title, config) VALUES
('mod1-lv2-ch1', 'mod1-lv2', 'circuit', 1, 'The battery', '{}'),
('mod1-lv2-ch2', 'mod1-lv2', 'question', 2, 'What does a battery do?', '{}'),
('mod1-lv2-ch3', 'mod1-lv2', 'circuit', 3, 'The LED', '{}');

-- UNLOCK MODULE 1 FOR ALL STUDENTS
INSERT INTO unlocked_modules (student_id, module_id, unlocked_by)
SELECT
  s.id,
  'module-1',
  (SELECT id FROM teachers LIMIT 1)
FROM students s;

-- SAMPLE ACHIEVEMENTS
INSERT INTO achievements (id, title, description, icon, type) VALUES
('first-victory', 'First Victory', 'Complete your first challenge', '🎉', 'complete_module'),
('streak-7', '7 Day Streak', 'Play 7 days in a row', '🔥', 'streak'),
('perfectionist', 'Perfectionist', 'Complete a level without errors', '⭐', 'perfect'),
('speedster', 'Speedster', 'Complete a challenge in less than 30 seconds', '⚡', 'fast');

-- =====================================================
-- 10. USEFUL VIEWS
-- =====================================================

-- View: Progress by student and module
CREATE VIEW view_module_progress AS
SELECT
  s.id as student_id,
  s.first_name as student_name,
  m.id as module_id,
  m.title as module_title,
  COUNT(DISTINCT c.id) as total_challenges,
  COUNT(DISTINCT CASE WHEN sp.completed THEN c.id END) as challenges_completed,
  ROUND(
    (COUNT(DISTINCT CASE WHEN sp.completed THEN c.id END)::NUMERIC /
     NULLIF(COUNT(DISTINCT c.id), 0) * 100)
  , 0) as progress_percentage
FROM students s
CROSS JOIN modules m
LEFT JOIN levels l ON l.module_id = m.id
LEFT JOIN challenges c ON c.level_id = l.id AND c.active = TRUE
LEFT JOIN student_progress sp ON sp.student_id = s.id AND sp.challenge_id = c.id
WHERE s.active = TRUE AND m.active = TRUE
GROUP BY s.id, s.first_name, m.id, m.title;

-- View: Students by teacher with stats
CREATE VIEW view_teacher_students AS
SELECT
  t.id as teacher_id,
  t.first_name as teacher_name,
  s.id as student_id,
  s.first_name as student_name,
  s.username as student_username,
  s.avatar,
  s.age,
  COUNT(DISTINCT sp.challenge_id) FILTER (WHERE sp.completed) as challenges_completed,
  COUNT(DISTINCT sa.achievement_id) as achievements_obtained,
  s.created_at
FROM teachers t
LEFT JOIN students s ON s.teacher_id = t.id AND s.active = TRUE
LEFT JOIN student_progress sp ON sp.student_id = s.id
LEFT JOIN student_achievements sa ON sa.student_id = s.id
WHERE t.active = TRUE
GROUP BY t.id, t.first_name, s.id, s.first_name, s.username, s.avatar, s.age, s.created_at;

-- =====================================================
-- 11. USEFUL FUNCTIONS
-- =====================================================

-- Function: Get next available challenge for a student
CREATE OR REPLACE FUNCTION get_next_challenge(p_student_id UUID, p_module_id TEXT)
RETURNS TABLE(challenge_id TEXT, level_id TEXT, type TEXT, title TEXT, order_num INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.level_id,
    c.type,
    c.title,
    c.order_num
  FROM challenges c
  INNER JOIN levels l ON c.level_id = l.id
  LEFT JOIN student_progress sp ON sp.challenge_id = c.id AND sp.student_id = p_student_id
  WHERE l.module_id = p_module_id
    AND c.active = TRUE
    AND (sp.completed IS NULL OR sp.completed = FALSE)
  ORDER BY l.order_num, c.order_num
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate stars based on attempts
CREATE OR REPLACE FUNCTION calculate_stars(p_attempts INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    WHEN p_attempts = 1 THEN 3
    WHEN p_attempts <= 2 THEN 2
    WHEN p_attempts <= 4 THEN 1
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql;

-- Function: Check if module is unlocked
CREATE OR REPLACE FUNCTION is_module_unlocked(p_student_id UUID, p_module_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM unlocked_modules
    WHERE student_id = p_student_id AND module_id = p_module_id
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. TRIGGERS
-- =====================================================

-- Trigger: Update completed date
CREATE OR REPLACE FUNCTION update_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_completed
  BEFORE UPDATE ON student_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_completed_at();

-- =====================================================
-- 13. TABLE COMMENTS
-- =====================================================

COMMENT ON TABLE teachers IS 'Teachers who manage students and unlock modules';
COMMENT ON TABLE students IS 'Students (kids 6-10 years) with simple login system';
COMMENT ON TABLE modules IS 'Main grouping of educational content';
COMMENT ON TABLE levels IS 'Levels within each module';
COMMENT ON TABLE challenges IS 'Individual challenges (circuit or question)';
COMMENT ON TABLE student_progress IS 'Student progress tracking';
COMMENT ON TABLE unlocked_modules IS 'Modules that the student can access';
COMMENT ON TABLE achievements IS 'Available badges and achievements';
COMMENT ON TABLE student_achievements IS 'Achievements obtained by each student';

-- =====================================================
-- END OF MIGRATION
-- =====================================================

-- To verify everything was created correctly:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
