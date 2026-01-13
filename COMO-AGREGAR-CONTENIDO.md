# 📚 CÓMO AGREGAR CONTENIDO AL SISTEMA

## 🎯 3 PASOS PARA AGREGAR UN NUEVO RETO

### PASO 1: Crear el Archivo de Configuración

#### Para Reto de PREGUNTAS:

Crea el archivo en: `app/game/data/contenido/modulo-X/nivel-Y/reto-Z-question.ts`

```typescript
import { Reto, QuestionRetoConfig } from '../../../../types/reto.types';

const config: QuestionRetoConfig = {
  titulo: "Mi Pregunta",
  pregunta: "Completa la frase",

  // Texto con espacios para completar
  textSegments: [
    { type: "text", content: "La " },
    { type: "dots", correctAnswer: "batería" },
    { type: "text", content: " da energía." },
  ],

  // Opciones disponibles
  opciones: [
    "batería",
    "LED",
    "motor",
  ],

  // Animación de fondo (OPCIONAL)
  ballsConfig: [{
    path: [
      { x: 300, y: 300 },
      { x: 100, y: 100 },
    ],
    color: "#58cc02",
    delay: 0,
    animationType: "restart",
    duration: 3,
  }],

  // Mensaje al responder correctamente (OPCIONAL)
  explicacion: "¡Correcto! La batería proporciona energía.",
};

export const reto: Reto = {
  id: "mod1-lv1-ch4",           // ID único
  nivelId: "mod1-lv1",           // A qué nivel pertenece
  tipo: "question",               // Tipo: "question" o "circuit"
  orden: 4,                       // Orden dentro del nivel
  titulo: "Mi Reto",
  config,
  siguienteRetoId: "mod1-lv2-ch1",  // ID del siguiente reto
  anteriorRetoId: "mod1-lv1-ch3",   // ID del reto anterior
};
```

---

#### Para Reto de CIRCUITO:

Crea el archivo en: `app/game/data/contenido/modulo-X/nivel-Y/reto-Z-circuit.ts`

```typescript
import { Reto, CircuitRetoConfig } from '../../../../types/reto.types';

const config: CircuitRetoConfig = {
  titulo: "MI CIRCUITO",

  // Componentes del circuito
  circuitElements: [
    { id: "battery-1", type: "battery", x: 200, y: 240, width: 50 },
    { id: "led-1", type: "led", x: 400, y: 240, width: 50, isOn: false },
  ],

  // Cables que conectan componentes
  wires: [{
    points: [
      { x: 250, y: 240 },  // Punto inicial
      { x: 400, y: 240 },  // Punto final
    ],
    color: "#ec2222",       // Color del cable
    strokeWidth: 5,
    duration: 2,            // Duración de la animación (segundos)
    delay: 0,               // Delay antes de empezar
    showParticles: true,    // ¿Mostrar partículas?
    particleSpeed: 2,

    // Acciones al terminar la animación
    onComplete: [
      { elementId: "led-1", changes: { isOn: true } }  // Enciende el LED
    ],
  }],

  // Textos explicativos (OPCIONAL)
  textElements: [{
    id: "texto-1",
    x: 300,
    y: 50,
    text: "¡Observa cómo fluye la corriente!",
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
    textAnchor: "middle",
    delay: 2,
    duration: 1,
  }],

  viewBox: "0 0 800 500",
  backgroundColor: "#131f24",
};

export const reto: Reto = {
  id: "mod1-lv1-ch5",
  nivelId: "mod1-lv1",
  tipo: "circuit",
  orden: 5,
  titulo: "Mi Circuito",
  config,
  siguienteRetoId: "mod1-lv2-ch1",
  anteriorRetoId: "mod1-lv1-ch4",
};
```

---

### PASO 2: Registrar en retos-registry.ts

Abre: `app/game/data/retos-registry.ts`

Agrega tu reto:

```typescript
export const RETOS_REGISTRY: Record<string, RetoLoader> = {
  // ... retos existentes

  // TU NUEVO RETO
  "mod1-lv1-ch4": () =>
    import("./contenido/modulo-1/nivel-1/reto-4-question").then((m) => m.reto),

  // ... más retos
};
```

---

### PASO 3: Agregar a la Base de Datos

Abre Supabase SQL Editor y ejecuta:

```sql
-- Insertar el reto en la base de datos
INSERT INTO challenges (id, level_id, type, order_num, title, config) VALUES
('mod1-lv1-ch4', 'mod1-lv1', 'question', 4, 'Componentes Básicos', '{}');
```

**NOTA:** El campo `config` puede ser `'{}'` vacío porque la configuración real viene del archivo TypeScript.

---

## 🎨 COMPONENTES DISPONIBLES PARA CIRCUITOS

### Batería
```typescript
{ id: "battery-1", type: "battery", x: 200, y: 240, width: 50 }
```

### LED
```typescript
{
  id: "led-1",
  type: "led",
  x: 400,
  y: 240,
  width: 50,
  isOn: false  // false = apagado, true = encendido
}
```

### Motor
```typescript
{
  id: "motor-1",
  type: "motor",
  x: 300,
  y: 200,
  width: 60,
  direction: "stop"  // "stop", "left", "right"
}
```

### Interruptor Simple
```typescript
{
  id: "switch-1",
  type: "switchSimple",
  x: 250,
  y: 220,
  width: 80,
  position: "left"  // "left" o "right"
}
```

### Bombilla
```typescript
{
  id: "bulb-1",
  type: "lightBulb",
  x: 350,
  y: 180,
  width: 50,
  isOn: false
}
```

---

## 🔄 ANIMACIONES Y ESTADOS

### Cambiar Estado al Completar Cable

```typescript
wires: [{
  // ... configuración del cable
  onComplete: [
    { elementId: "led-1", changes: { isOn: true } },        // Enciende LED
    { elementId: "motor-1", changes: { direction: "right" } }, // Gira motor
    { elementId: "switch-1", changes: { position: "right" } }, // Cambia switch
  ],
}]
```

### Partículas en Cables

```typescript
wires: [{
  points: [{ x: 100, y: 100 }, { x: 200, y: 100 }],
  color: "#ec2222",
  showParticles: true,           // Activar partículas
  particleColor: "#ffff00",      // Color de partículas (opcional)
  particleLaunchInterval: 200,   // Frecuencia de lanzamiento (ms)
  particleSpeed: 2,              // Velocidad
}]
```

---

## 📋 ESTRUCTURA DE IDs

### Convención de Nombres:

```
modX-lvY-chZ

mod  = module  (módulo)
lv   = level   (nivel)
ch   = challenge (reto)

Ejemplos:
mod1-lv1-ch1  → Módulo 1, Nivel 1, Reto 1
mod2-lv3-ch5  → Módulo 2, Nivel 3, Reto 5
```

---

## 🗺️ CÓMO ORGANIZAR MÓDULOS Y NIVELES

### Crear Nuevo Módulo en SQL:

```sql
-- 1. Crear módulo
INSERT INTO modules (id, title, description, icon, order_num, color) VALUES
('module-4', 'Mi Nuevo Módulo', 'Descripción aquí', '🎯', 4, '#ff6b6b');

-- 2. Crear nivel
INSERT INTO levels (id, module_id, title, description, order_num) VALUES
('mod4-lv1', 'module-4', 'Primer Nivel', 'Introducción', 1);

-- 3. Crear retos
INSERT INTO challenges (id, level_id, type, order_num, title, config) VALUES
('mod4-lv1-ch1', 'mod4-lv1', 'circuit', 1, 'Mi Primer Reto', '{}'),
('mod4-lv1-ch2', 'mod4-lv1', 'question', 2, 'Pregunta 1', '{}');

-- 4. Desbloquear para un alumno (opcional)
INSERT INTO unlocked_modules (student_id, module_id, unlocked_by)
VALUES ('uuid-del-alumno', 'module-4', 'uuid-del-maestro');
```

---

## 🎯 FLUJO COMPLETO DE NAVEGACIÓN

```
Login → /game (Mapa de módulos)
         ↓
      Click en módulo desbloqueado
         ↓
      /game/reto/mod1-lv1-ch1 (Primer reto)
         ↓
      Completa reto → Guarda progreso
         ↓
      /game/reto/mod1-lv1-ch2 (Siguiente reto)
         ↓
      ... continúa con siguienteRetoId ...
         ↓
      Último reto sin siguienteRetoId
         ↓
      Vuelve a /game (Mapa de módulos)
```

---

## ✅ CHECKLIST PARA AGREGAR CONTENIDO

**Al crear un nuevo reto:**

- [ ] Crear archivo `.ts` en `/contenido/modulo-X/nivel-Y/`
- [ ] Configurar `config` (circuit o question)
- [ ] Definir `siguienteRetoId` y `anteriorRetoId`
- [ ] Registrar en `retos-registry.ts`
- [ ] Insertar en base de datos (SQL)
- [ ] Probar navegando a `/game/reto/tu-reto-id`

**Al crear un nuevo módulo:**

- [ ] INSERT en tabla `modules`
- [ ] INSERT en tabla `levels` (al menos un nivel)
- [ ] Crear carpeta `/contenido/modulo-X/`
- [ ] Crear retos para el nivel
- [ ] Desbloquear para alumnos de prueba

---

## 🚀 EJEMPLO RÁPIDO

**Quiero agregar 3 retos al Módulo 2, Nivel 1:**

### 1. SQL:
```sql
INSERT INTO challenges (id, level_id, type, order_num, title, config) VALUES
('mod2-lv1-ch1', 'mod2-lv1', 'circuit', 1, 'Serie Simple', '{}'),
('mod2-lv1-ch2', 'mod2-lv1', 'question', 2, 'Pregunta Serie', '{}'),
('mod2-lv1-ch3', 'mod2-lv1', 'circuit', 3, 'Serie Complejo', '{}');
```

### 2. Crear archivos:
```
app/game/data/contenido/modulo-2/nivel-1/
  ├─ reto-1-circuit.ts
  ├─ reto-2-question.ts
  └─ reto-3-circuit.ts
```

### 3. Registrar en `retos-registry.ts`:
```typescript
"mod2-lv1-ch1": () => import("./contenido/modulo-2/nivel-1/reto-1-circuit").then(m => m.reto),
"mod2-lv1-ch2": () => import("./contenido/modulo-2/nivel-1/reto-2-question").then(m => m.reto),
"mod2-lv1-ch3": () => import("./contenido/modulo-2/nivel-1/reto-3-circuit").then(m => m.reto),
```

### 4. Probar:
```
http://localhost:3000/game/reto/mod2-lv1-ch1
```

---

## 💡 TIPS

1. **Usa el configurador visual:**
   ```
   http://localhost:3000/game/nivel/configurador
   ```
   Para diseñar circuitos visualmente.

2. **Copia retos existentes** como plantilla y modifícalos.

3. **Mantén consistencia** en IDs: `modX-lvY-chZ`

4. **Prueba cada reto** antes de agregarlo a producción.

5. **El orden importa:** `order_num` en SQL define el orden de los retos.

---

¡Ahora puedes crear todo el contenido que quieras! 🎉
