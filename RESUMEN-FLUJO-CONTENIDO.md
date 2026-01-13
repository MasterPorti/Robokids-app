# 🎮 RESUMEN: CÓMO FUNCIONA EL CONTENIDO

## 🗺️ MAPA MENTAL DEL SISTEMA

```
BASE DE DATOS (Supabase)
     ↓
Define ESTRUCTURA (módulos, niveles, orden)
     ↓
ARCHIVOS TYPESCRIPT
     ↓
Define CONTENIDO (circuitos, preguntas, animaciones)
     ↓
REGISTRY
     ↓
Conecta base de datos con archivos TypeScript
     ↓
SISTEMA CARGA Y MUESTRA
```

---

## 📦 LOS 3 LUGARES DEL CONTENIDO

### 1️⃣ BASE DE DATOS (Supabase) - LA ESTRUCTURA

```sql
-- Define QUÉ módulos, niveles y retos existen
-- Define el ORDEN
-- Define QUIÉN tiene acceso

modules → levels → challenges
```

**Ejemplo:**
```sql
module-1: Basic Circuits
  ├─ mod1-lv1: Introduction
  │   ├─ mod1-lv1-ch1 (circuit)
  │   ├─ mod1-lv1-ch2 (question)
  │   └─ mod1-lv1-ch3 (circuit)
  └─ mod1-lv2: Components
      └─ mod1-lv2-ch1 (circuit)
```

---

### 2️⃣ ARCHIVOS TYPESCRIPT - EL CONTENIDO

```
app/game/data/contenido/
  └─ modulo-1/
      └─ nivel-1/
          ├─ reto-1-circuit.ts    ← CÓMO SE VE el circuito
          ├─ reto-2-question.ts   ← CUÁLES son las preguntas
          └─ reto-3-circuit.ts
```

**Contiene:**
- Componentes (LED, batería, motor)
- Cables y animaciones
- Preguntas y respuestas
- Textos explicativos

---

### 3️⃣ REGISTRY - LA CONEXIÓN

```typescript
// app/game/data/retos-registry.ts

RETOS_REGISTRY = {
  "mod1-lv1-ch1": () => import("./contenido/.../reto-1-circuit"),
  "mod1-lv1-ch2": () => import("./contenido/.../reto-2-question"),
  //         ↑                              ↑
  //      ID en BD                    Archivo TypeScript
}
```

**Conecta:** ID de la base de datos → Archivo TypeScript

---

## 🔄 FLUJO CUANDO EL ALUMNO JUEGA

```
1. Alumno hace login
   └→ localStorage: { id, first_name, avatar }

2. Va a /game
   └→ API GET /api/game/modulos?studentId=xxx
       └→ Obtiene módulos de Supabase
           └→ Verifica cuáles están desbloqueados
               └→ Calcula progreso por módulo

3. Click en módulo
   └→ Si bloqueado: Alert "🔒"
   └→ Si desbloqueado: navega a /game/reto/mod1-lv1-ch1

4. En /game/reto/[id]
   └→ Lee ID de la URL
       └→ Busca en RETOS_REGISTRY
           └→ Carga archivo TypeScript dinámicamente
               └→ Renderiza CircuitReto o QuestionReto

5. Completa el reto
   └→ POST /api/game/progreso
       └→ Guarda en tabla student_progress
           └→ Calcula estrellas (1 intento = ⭐⭐⭐)

6. Navega al siguiente reto
   └→ Usa reto.siguienteRetoId
       └→ Si no existe: vuelve a /game
```

---

## ✅ CHECKLIST PARA AGREGAR UN RETO

### Paso 1: Crear el archivo
```bash
# Ubicación:
app/game/data/contenido/modulo-X/nivel-Y/reto-Z-{tipo}.ts

# Tipos:
- reto-Z-circuit.ts   (para circuitos)
- reto-Z-question.ts  (para preguntas)
```

### Paso 2: Configurar el contenido
```typescript
export const reto: Reto = {
  id: "modX-lvY-chZ",          // ← IMPORTANTE: debe coincidir con BD
  nivelId: "modX-lvY",
  tipo: "circuit" o "question",
  orden: Z,
  config: { ... },              // ← Aquí va TODO el contenido
  siguienteRetoId: "...",       // ← Navegación
}
```

### Paso 3: Registrar
```typescript
// En retos-registry.ts
"modX-lvY-chZ": () => import("./contenido/modulo-X/.../reto-Z-tipo").then(m => m.reto)
```

### Paso 4: Insertar en BD
```sql
INSERT INTO challenges (id, level_id, type, order_num, title, config)
VALUES ('modX-lvY-chZ', 'modX-lvY', 'circuit', Z, 'Título', '{}');
```

### Paso 5: Probar
```
http://localhost:3000/game/reto/modX-lvY-chZ
```

---

## 🎯 EJEMPLO PRÁCTICO COMPLETO

Vamos a agregar: **"Circuito con Motor"**

### 1. Crear archivo:
`app/game/data/contenido/modulo-1/nivel-2/reto-2-circuit.ts`

```typescript
import { Reto, CircuitRetoConfig } from '../../../../types/reto.types';

const config: CircuitRetoConfig = {
  titulo: "CIRCUITO CON MOTOR",
  circuitElements: [
    { id: "battery", type: "battery", x: 100, y: 200, width: 50 },
    { id: "motor", type: "motor", x: 300, y: 200, width: 60, direction: "stop" },
  ],
  wires: [{
    points: [{ x: 150, y: 200 }, { x: 300, y: 200 }],
    color: "#ec2222",
    duration: 2,
    showParticles: true,
    onComplete: [
      { elementId: "motor", changes: { direction: "right" } }
    ],
  }],
};

export const reto: Reto = {
  id: "mod1-lv2-ch2",
  nivelId: "mod1-lv2",
  tipo: "circuit",
  orden: 2,
  config,
  siguienteRetoId: "mod1-lv2-ch3",
  anteriorRetoId: "mod1-lv2-ch1",
};
```

### 2. Registrar:
En `retos-registry.ts`:
```typescript
"mod1-lv2-ch2": () => import("./contenido/modulo-1/nivel-2/reto-2-circuit").then(m => m.reto),
```

### 3. SQL:
```sql
INSERT INTO challenges (id, level_id, type, order_num, title, config)
VALUES ('mod1-lv2-ch2', 'mod1-lv2', 'circuit', 2, 'Circuito con Motor', '{}');
```

### 4. Probar:
```
http://localhost:3000/game/reto/mod1-lv2-ch2
```

---

## 🚨 ERRORES COMUNES

### ❌ "El reto no existe"
**Problema:** No está registrado en `retos-registry.ts`
**Solución:** Agrégalo al registry

### ❌ "Module not found"
**Problema:** La ruta del import está mal
**Solución:** Verifica que el path sea correcto

### ❌ No aparece en el mapa
**Problema:** No está en la base de datos O módulo bloqueado
**Solución:** Ejecuta el INSERT en Supabase

### ❌ Progreso no se guarda
**Problema:** No ejecutaste el SQL de la base de datos
**Solución:** Ejecuta `supabase-sistema-completo-en.sql`

---

## 📊 ARCHIVOS CLAVE

| Archivo | Qué hace |
|---------|----------|
| `supabase-sistema-completo-en.sql` | Crea toda la estructura de BD |
| `retos-registry.ts` | Conecta IDs con archivos TypeScript |
| `app/game/page.tsx` | Mapa de módulos (Duolingo style) |
| `app/game/reto/[id]/page.tsx` | Renderiza el reto dinámicamente |
| `RetoRenderer.tsx` | Decide si mostrar Circuit o Question |

---

## 💡 RESUMEN EN 1 MINUTO

1. **Creas archivo TypeScript** con el contenido (circuito/pregunta)
2. **Lo registras** en `retos-registry.ts`
3. **Lo insertas en BD** con SQL
4. **Listo!** El sistema lo carga automáticamente

---

## 🎓 PRÓXIMOS PASOS

1. ✅ Ejecuta el SQL del nuevo reto:
   ```sql
   -- Abre: ejemplo-agregar-reto.sql
   -- Copia y ejecuta en Supabase
   ```

2. ✅ Prueba el nuevo reto:
   ```
   http://localhost:3000/game/reto/mod1-lv1-ch4
   ```

3. ✅ Crea tus propios retos siguiendo la guía:
   ```
   COMO-AGREGAR-CONTENIDO.md
   ```

---

**¡Ya sabes cómo funciona todo!** 🎉

Tienes:
- ✅ Sistema de login
- ✅ Mapa de módulos con bloqueo
- ✅ Retos de circuitos y preguntas
- ✅ Progreso guardado automáticamente
- ✅ Guías para agregar más contenido

**Ahora solo necesitas:**
- Ejecutar el SQL del nuevo reto
- Crear más contenido educativo
- ¡Disfrutar! 🚀
