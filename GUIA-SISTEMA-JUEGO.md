# 🎮 SISTEMA DE JUEGO TIPO DUOLINGO - GUÍA COMPLETA

## 📋 ÍNDICE
1. [Estructura del Sistema](#estructura-del-sistema)
2. [Instalación y Configuración](#instalación-y-configuración)
3. [Cómo Funciona](#cómo-funciona)
4. [Crear Nuevos Retos](#crear-nuevos-retos)
5. [Gestión de Progreso](#gestión-de-progreso)
6. [APIs Disponibles](#apis-disponibles)

---

## 🏗️ ESTRUCTURA DEL SISTEMA

### Jerarquía
```
Módulos
  └── Niveles
       └── Retos (Circuit o Question)
```

### Tipos de Retos

#### 1. **Circuit Reto** (Visualización de Circuitos)
- Usa CircuitCanvas con animaciones GSAP
- Cables que se dibujan
- Partículas que fluyen
- Componentes interactivos (LED, Motor, Switch, etc.)

#### 2. **Question Reto** (Preguntas Interactivas)
- Texto con espacios para completar
- Opciones de respuesta
- Animación de fondo opcional
- Validación de respuestas

---

## ⚙️ INSTALACIÓN Y CONFIGURACIÓN

### Paso 1: Crear las Tablas en Supabase

Ejecuta el archivo SQL en tu proyecto de Supabase:

```bash
# Copia el contenido de supabase-game-system.sql
# Pégalo en el SQL Editor de Supabase y ejecuta
```

Esto creará:
- ✅ Tabla `modulos`
- ✅ Tabla `niveles`
- ✅ Tabla `retos`
- ✅ Tabla `progreso_alumno`
- ✅ Tabla `modulos_desbloqueados`
- ✅ Políticas de seguridad (RLS)
- ✅ Datos de ejemplo

### Paso 2: Verificar la Instalación

Verifica que las tablas se crearon correctamente:

```sql
SELECT * FROM modulos;
SELECT * FROM niveles;
SELECT * FROM retos;
```

---

## 🎯 CÓMO FUNCIONA

### Flujo del Jugador (Alumno)

```
1. Alumno inicia sesión
2. Ve el mapa de módulos en /game
3. Solo puede entrar a módulos desbloqueados
4. Selecciona un nivel dentro del módulo
5. Completa retos secuenciales (Circuit → Question → Circuit...)
6. Cada reto completado se guarda en Supabase
7. Al terminar todos los retos, avanza al siguiente nivel
8. El progreso se muestra en tiempo real
```

### Flujo del Maestro

```
1. Maestro inicia sesión
2. Ve lista de alumnos
3. Puede desbloquear módulos específicos para alumnos
4. Ve progreso de cada alumno en tiempo real
```

---

## 🎨 CREAR NUEVOS RETOS

### Método 1: Crear Reto de Circuit

#### 1. Crea el archivo de configuración

`app/game/data/contenido/modulo-X/nivel-Y/reto-Z-circuit.ts`

```typescript
import { Reto, CircuitRetoConfig } from '../../../../types/reto.types';

const config: CircuitRetoConfig = {
  titulo: "MI CIRCUITO PERSONALIZADO",
  circuitElements: [
    { id: "battery-1", type: "battery", x: 200, y: 240, width: 50 },
    { id: "led-1", type: "led", x: 400, y: 240, width: 50, isOn: false },
  ],
  wires: [
    {
      points: [{ x: 250, y: 240 }, { x: 400, y: 240 }],
      color: "#ec2222",
      strokeWidth: 5,
      duration: 2,
      delay: 0,
      showParticles: true,
      onComplete: [
        { elementId: "led-1", changes: { isOn: true } }
      ],
    },
  ],
  textElements: [
    {
      id: "texto-1",
      x: 500,
      y: 50,
      text: "¡Observa cómo fluye la corriente!",
      fontSize: 24,
      color: "#ffffff",
      fontWeight: "bold",
      textAnchor: "middle",
      delay: 2,
      duration: 1,
    },
  ],
};

export const reto: Reto = {
  id: "modX-nivY-reto-Z",
  nivelId: "modX-nivY",
  tipo: "circuit",
  orden: Z,
  titulo: "Mi Reto de Circuito",
  config,
  siguienteRetoId: "modX-nivY-reto-Z+1", // Opcional
  anteriorRetoId: "modX-nivY-reto-Z-1",   // Opcional
};
```

#### 2. Registra el reto

En `app/game/data/retos-registry.ts`:

```typescript
export const RETOS_REGISTRY: Record<string, RetoLoader> = {
  // ... retos existentes

  "modX-nivY-reto-Z": () =>
    import("./contenido/modulo-X/nivel-Y/reto-Z-circuit").then((m) => m.reto),
};
```

#### 3. Inserta en Supabase

```sql
INSERT INTO retos (id, nivel_id, tipo, orden, titulo, config) VALUES
('modX-nivY-reto-Z', 'modX-nivY', 'circuit', Z, 'Mi Reto de Circuito', '{}');
```

---

### Método 2: Crear Reto de Question

#### 1. Crea el archivo de configuración

`app/game/data/contenido/modulo-X/nivel-Y/reto-Z-question.ts`

```typescript
import { Reto, QuestionRetoConfig } from '../../../../types/reto.types';

const config: QuestionRetoConfig = {
  titulo: "¿Entendiste el concepto?",
  pregunta: "Completa la frase correctamente",
  textSegments: [
    { type: "text", content: "Los electrones van del polo " },
    { type: "dots", correctAnswer: "negativo" },
    { type: "text", content: " al polo " },
    { type: "dots", correctAnswer: "positivo" },
  ],
  opciones: [
    "negativo",
    "positivo",
    "neutro",
    "central",
  ],
  explicacion: "¡Correcto! Los electrones van del polo negativo al positivo.",
};

export const reto: Reto = {
  id: "modX-nivY-reto-Z",
  nivelId: "modX-nivY",
  tipo: "question",
  orden: Z,
  config,
  siguienteRetoId: "modX-nivY-reto-Z+1",
  anteriorRetoId: "modX-nivY-reto-Z-1",
};
```

#### 2. Registra y agrega a Supabase (igual que Circuit)

---

### Método 3: Usar el Configurador Visual

Puedes usar el configurador visual para crear retos de Circuit:

```bash
# Ve a la URL:
http://localhost:3000/game/nivel/configurador
```

1. Arrastra y posiciona componentes
2. Dibuja cables
3. Configura animaciones
4. Exporta la configuración
5. Cópiala a tu archivo de reto

---

## 📊 GESTIÓN DE PROGRESO

### Ver Progreso de un Alumno

```typescript
// En tu componente
const response = await fetch('/api/game/progreso');
const { progreso } = await response.json();

// progreso = [
//   { retoId: 'mod1-niv1-reto-1', completado: true, intentos: 1 },
//   { retoId: 'mod1-niv1-reto-2', completado: true, intentos: 2 },
// ]
```

### Guardar Progreso (Automático)

Se guarda automáticamente cuando un alumno completa un reto.
No necesitas hacer nada adicional.

### Desbloquear Módulo (Maestro)

```typescript
const response = await fetch('/api/game/desbloquear', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    alumnoId: 'uuid-del-alumno',
    moduloId: 'modulo-1'
  })
});
```

---

## 🔌 APIs DISPONIBLES

### 1. **GET /api/game/progreso**

Obtiene el progreso del alumno actual.

**Respuesta:**
```json
{
  "progreso": [
    {
      "id": "uuid",
      "alumno_id": "uuid",
      "reto_id": "mod1-niv1-reto-1",
      "completado": true,
      "intentos": 1,
      "ultima_actualizacion": "2025-01-12T..."
    }
  ]
}
```

---

### 2. **POST /api/game/progreso**

Guarda el progreso de un reto completado.

**Body:**
```json
{
  "retoId": "mod1-niv1-reto-1",
  "completado": true
}
```

**Respuesta:**
```json
{
  "success": true,
  "progreso": { ... }
}
```

---

### 3. **GET /api/game/modulos**

Obtiene todos los módulos con progreso y estado de desbloqueo.

**Respuesta:**
```json
{
  "modulos": [
    {
      "id": "modulo-1",
      "titulo": "Circuitos en Serie",
      "orden": 1,
      "color": "#3b82f6",
      "desbloqueado": true,
      "progreso": 33
    }
  ]
}
```

---

### 4. **POST /api/game/desbloquear**

Desbloquea un módulo para un alumno (solo maestros).

**Body:**
```json
{
  "alumnoId": "uuid-del-alumno",
  "moduloId": "modulo-1"
}
```

**Respuesta:**
```json
{
  "success": true,
  "desbloqueo": { ... }
}
```

---

## 🎯 FLUJO DE NAVEGACIÓN

### URLs Principales

```
/game                       → Mapa principal (estilo Duolingo)
/game/reto/[id]            → Página de reto específico
/game/nivel/configurador   → Editor visual de circuitos
```

### Navegación entre Retos

El sistema navega automáticamente usando `siguienteRetoId`:

```
mod1-niv1-reto-1 → mod1-niv1-reto-2 → mod1-niv1-reto-3 → /game
```

Cuando un reto no tiene `siguienteRetoId`, vuelve al mapa.

---

## 🎨 COMPONENTES DISPONIBLES PARA CIRCUITOS

```typescript
// En circuitElements
{ type: "battery", x, y, width }
{ type: "led", x, y, width, isOn }
{ type: "motor", x, y, width, direction }
{ type: "switchSimple", x, y, width, position }
{ type: "switchTriple", x, y, width, position }
{ type: "lightBulb", x, y, width, isOn }
{ type: "robopuntos", x, y, width, rotation }
```

---

## 🚀 PRÓXIMOS PASOS

1. **Ejecuta el SQL** en Supabase
2. **Crea tu primer módulo** personalizado
3. **Agrega niveles** al módulo
4. **Crea retos** (Circuit y Question)
5. **Registra** los retos en `retos-registry.ts`
6. **Prueba** el flujo completo desde `/game/reto/mod1-niv1-reto-1`

---

## 📝 EJEMPLO COMPLETO

### Crear Módulo 2: Circuitos en Paralelo

#### 1. SQL
```sql
-- Módulo
INSERT INTO modulos (id, titulo, descripcion, orden, color) VALUES
('modulo-2', 'Circuitos en Paralelo', 'Aprende sobre circuitos en paralelo', 2, '#8b5cf6');

-- Nivel
INSERT INTO niveles (id, modulo_id, titulo, orden) VALUES
('mod2-niv1', 'modulo-2', 'Introducción a Paralelo', 1);

-- Retos
INSERT INTO retos (id, nivel_id, tipo, orden, titulo, config) VALUES
('mod2-niv1-reto-1', 'mod2-niv1', 'circuit', 1, 'Circuito en Paralelo', '{}');
```

#### 2. Crear archivos de configuración

`app/game/data/contenido/modulo-2/nivel-1/reto-1-circuit.ts`

#### 3. Registrar en retos-registry.ts

#### 4. Listo para usar

---

## 💡 TIPS

- Usa el configurador visual para diseñar circuitos rápidamente
- Los IDs deben seguir el patrón `modX-nivY-reto-Z`
- El primer reto de cada módulo se desbloquea automáticamente
- Mantén la cadena de `siguienteRetoId` correcta para navegación fluida
- Prueba cada reto antes de agregarlo a producción

---

¡Disfruta creando tu plataforma educativa! 🎓✨
