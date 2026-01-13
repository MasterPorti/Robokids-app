# 🚀 GUÍA DE INICIO RÁPIDO

## ✅ PASO 1: EJECUTAR EL SQL

1. Abre Supabase (tu proyecto)
2. Ve a SQL Editor
3. Abre el archivo: `supabase-sistema-completo.sql`
4. Copia TODO el contenido
5. Pégalo en el SQL Editor
6. Click en "Run" / "Ejecutar"

**Resultado:** Se crearán todas las tablas, datos de ejemplo, vistas y funciones.

---

## 🎓 SISTEMA DE USUARIOS

### MAESTROS (Profesores)

Los maestros pueden:
- ✅ Crear alumnos
- ✅ Desbloquear módulos para alumnos
- ✅ Ver progreso de sus alumnos

**Login:**
- Usuario: `profe_maria` o `profe_juan`
- Contraseña: `hash_password_aqui`

### ALUMNOS (Niños 6-10 años)

Los alumnos tienen:
- ✅ Usuario simple (ej: `juanito`)
- ✅ PIN de 4-6 dígitos (ej: `1234`)
- ✅ Avatar emoji (ej: 🦖)
- ✅ Sin correo requerido

**Login de ejemplo:**
- Usuario: `juanito` / PIN: `1234`
- Usuario: `sofia` / PIN: `5678`
- Usuario: `pedrito` / PIN: `9999`

---

## 🔑 APIs DE AUTENTICACIÓN

### 1. Login Alumno (Niños)

```javascript
// POST /api/auth/login-alumno
const response = await fetch('/api/auth/login-alumno', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    usuario: 'juanito',
    pin: '1234'
  })
});

const data = await response.json();
// {
//   success: true,
//   alumno: { id, nombre, apellido, usuario, avatar, edad, ... },
//   message: "¡Hola Juanito! 🦖"
// }
```

### 2. Login Maestro

```javascript
// POST /api/auth/login-maestro
const response = await fetch('/api/auth/login-maestro', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    usuario: 'profe_maria',
    password: 'tu_password'
  })
});

const data = await response.json();
// {
//   success: true,
//   maestro: { id, nombre, apellido, usuario, email },
//   message: "Bienvenido/a María"
// }
```

---

## 👶 CREAR ALUMNO

El maestro crea un nuevo alumno:

```javascript
// POST /api/maestro/crear-alumno
const response = await fetch('/api/maestro/crear-alumno', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    maestroId: 'uuid-del-maestro',
    nombre: 'Carlos',
    apellido: 'Ruiz',
    usuario: 'carlitos',
    pin: '4567',
    avatar: '🐶',
    edad: 7
  })
});

const data = await response.json();
// {
//   success: true,
//   alumno: { ... },
//   message: "Alumno Carlos creado exitosamente"
// }
```

**Nota:** El módulo 1 se desbloquea automáticamente para nuevos alumnos.

---

## 🎮 SISTEMA DE JUEGO

### URLs Principales

```
/game/reto/mod1-niv1-reto-1  → Primer reto (Circuit)
/game/reto/mod1-niv1-reto-2  → Segundo reto (Question)
/game/reto/mod1-niv1-reto-3  → Tercer reto (Circuit)
```

### Guardar Progreso

```javascript
// POST /api/game/progreso
const response = await fetch('/api/game/progreso', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    alumnoId: 'uuid-del-alumno',
    retoId: 'mod1-niv1-reto-1',
    completado: true,
    intentos: 1,
    tiempoSegundos: 45
  })
});

// Respuesta:
// {
//   success: true,
//   progreso: {
//     id, alumno_id, reto_id,
//     completado: true,
//     intentos: 1,
//     estrellas: 3,  // ⭐⭐⭐ (1 intento = 3 estrellas)
//     tiempo_segundos: 45
//   }
// }
```

### Ver Progreso

```javascript
// GET /api/game/progreso?alumnoId=uuid
const response = await fetch('/api/game/progreso?alumnoId=uuid-del-alumno');
const data = await response.json();
// {
//   alumno: "Juanito",
//   progreso: [
//     { reto_id: "mod1-niv1-reto-1", completado: true, estrellas: 3 },
//     { reto_id: "mod1-niv1-reto-2", completado: true, estrellas: 2 },
//   ]
// }
```

### Desbloquear Módulo

```javascript
// POST /api/game/desbloquear
const response = await fetch('/api/game/desbloquear', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    maestroId: 'uuid-del-maestro',
    alumnoId: 'uuid-del-alumno',
    moduloId: 'modulo-2'
  })
});

// Respuesta:
// { success: true, desbloqueo: { ... } }
```

---

## ⭐ SISTEMA DE ESTRELLAS

Las estrellas se calculan automáticamente según los intentos:

- **1 intento** = ⭐⭐⭐ (3 estrellas)
- **2 intentos** = ⭐⭐ (2 estrellas)
- **3-4 intentos** = ⭐ (1 estrella)
- **5+ intentos** = Sin estrellas

---

## 📊 DATOS DE EJEMPLO

### Módulos Creados:

| ID | Título | Emoji |
|----|--------|-------|
| modulo-1 | Circuitos Básicos | ⚡ |
| modulo-2 | Circuitos en Serie | 🔌 |
| modulo-3 | Circuitos en Paralelo | 🔋 |

### Niveles del Módulo 1:

1. **Introducción** (mod1-niv1)
   - Reto 1: Circuit - ¿Qué es la electricidad?
   - Reto 2: Question - Pregunta sobre electricidad
   - Reto 3: Circuit - Flujo de electrones

2. **Componentes Básicos** (mod1-niv2)
   - Reto 1: Circuit - La batería
   - Reto 2: Question - ¿Qué hace una batería?
   - Reto 3: Circuit - El LED

3. **Primer Circuito** (mod1-niv3)
   - (Agregar retos aquí)

---

## 🔧 FUNCIONES ÚTILES EN SQL

### Obtener siguiente reto disponible

```sql
SELECT * FROM obtener_siguiente_reto(
  'uuid-del-alumno',
  'modulo-1'
);
```

### Verificar si módulo está desbloqueado

```sql
SELECT modulo_desbloqueado(
  'uuid-del-alumno',
  'modulo-1'
);
```

### Ver progreso por módulo (Vista)

```sql
SELECT * FROM vista_progreso_modulos
WHERE alumno_id = 'uuid-del-alumno';
```

### Ver alumnos de un maestro (Vista)

```sql
SELECT * FROM vista_alumnos_maestro
WHERE maestro_id = 'uuid-del-maestro';
```

---

## 🎨 AVATARES DISPONIBLES

Puedes usar emojis como avatares:

```
🦖 🦄 🚀 🐶 🐱 🐼 🦁 🐯 🦊 🐻
🐨 🐸 🐵 🦉 🦋 🐝 🐙 🦀 🐢 🐠
⚡ 🔥 🌟 💎 🎮 🎯 🏆 👾 🤖 🦸
```

---

## 🚀 FLUJO COMPLETO DE USO

### Para el Maestro:

1. Login como maestro
2. Crear alumnos (con usuario + PIN simple)
3. Desbloquear módulos para alumnos
4. Ver progreso de alumnos

### Para el Alumno:

1. Login con usuario + PIN (ej: `juanito` + `1234`)
2. Ver módulos desbloqueados
3. Jugar retos secuencialmente
4. El progreso se guarda automáticamente
5. Ganar estrellas según desempeño

---

## 🎯 PRÓXIMOS PASOS

### 1. Probar el Sistema (5 minutos)

```javascript
// 1. Login como alumno
const login = await fetch('/api/auth/login-alumno', {
  method: 'POST',
  body: JSON.stringify({ usuario: 'juanito', pin: '1234' })
});

// 2. Ir al primer reto
window.location.href = '/game/reto/mod1-niv1-reto-1';

// 3. Completar el reto (se guarda automáticamente)
```

### 2. Personalizar (Continuo)

- Agrega más retos en `app/game/data/contenido/`
- Crea nuevos módulos en SQL
- Personaliza avatares y recompensas
- Agrega logros personalizados

### 3. Producción

**IMPORTANTE:** Para producción, debes:
- ✅ Usar bcrypt para hashear passwords de maestros
- ✅ Encriptar PINs de alumnos
- ✅ Implementar rate limiting en login
- ✅ Usar variables de entorno para secretos

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **supabase-sistema-completo.sql** - Script SQL completo
- **GUIA-SISTEMA-JUEGO.md** - Guía detallada del sistema de juego
- **RESUMEN-ARQUITECTURA.md** - Arquitectura completa

---

## ✨ CARACTERÍSTICAS

✅ **Sistema de login simple para niños** (usuario + PIN)
✅ **Maestros pueden crear y gestionar alumnos**
✅ **Sistema de estrellas automático**
✅ **Progreso guardado en tiempo real**
✅ **Módulos bloqueables por maestro**
✅ **Vistas SQL para estadísticas**
✅ **Funciones útiles ya creadas**
✅ **Logros e insignias**
✅ **Datos de ejemplo incluidos**

---

¡Tu sistema educativo está listo para usar! 🎉
