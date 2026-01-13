# 📚 Cómo Agregar Nuevos Niveles

Este documento explica cómo agregar nuevos niveles al sistema de circuitos.

## 🎯 Sistema de IDs Únicos

Cada nivel tiene un **ID único** que se usa en la URL para cargarlo.

**Ejemplo de URL:**
```
/game/nivel?id=circuito-serie-1
```

## ➕ Cómo Agregar un Nuevo Nivel

### Paso 1: Crear el archivo de configuración

1. Ve al configurador: `/game/nivel/configurador`
2. Diseña tu circuito (elementos, cables, textos, acciones)
3. En la pestaña "Exportar", establece el título del circuito
4. Descarga el archivo `circuitConfig.ts`

### Paso 2: Guardar el archivo

Guarda el archivo en la carpeta de niveles con un nombre descriptivo:
```
app/game/nivel/niveles/[estructura-que-prefieras]/nombre-descriptivo.ts
```

**Ejemplos de rutas:**
```
app/game/nivel/niveles/nivel-1/modulo-1/seccion-1/circuito-serie.ts
app/game/nivel/niveles/nivel-2/modulo-3/seccion-2/circuito-paralelo.ts
app/game/nivel/niveles/basicos/serie-simple.ts
app/game/nivel/niveles/avanzados/mixto-complejo.ts
```

### Paso 3: Registrar el nivel

Abre el archivo `niveles-registry.ts` y agrega una entrada en el objeto `NIVELES_REGISTRY`:

```typescript
export const NIVELES_REGISTRY: Record<string, NivelLoader> = {
  // Niveles existentes...
  "circuito-serie-1": () => import("./niveles/nivel-1/modulo-1/seccion-1/one").then(...),

  // TU NUEVO NIVEL
  "mi-nuevo-circuito": () =>
    import("./niveles/ruta/a/tu/archivo").then((m) => ({
      title: m.title,
      circuitElements: m.circuitElements,
      wires: m.wires,
      ballAnimations: m.ballAnimations,
      textElements: m.textElements,
    })),
};
```

### Paso 4: Usar el nivel

Accede a tu nuevo nivel con la URL:
```
/game/nivel?id=mi-nuevo-circuito
```

## 📋 Convenciones de Nombres de IDs

### Recomendaciones:
- Usa minúsculas
- Separa palabras con guiones (kebab-case)
- Sé descriptivo pero conciso
- Incluye el número si hay variaciones

### Buenos ejemplos:
```
circuito-serie-1
circuito-paralelo-basico
led-simple
motor-switch-complejo
nivel-1-seccion-2
```

### Malos ejemplos:
```
Circuit1              ❌ (usa español)
circuito_serie        ❌ (usa guiones bajos)
cs1                   ❌ (muy poco descriptivo)
circuitoSerieNumero1  ❌ (usa camelCase)
```

## 🗂️ Estructura de Archivos Recomendada

```
app/game/nivel/niveles/
├── basicos/
│   ├── serie-simple.ts
│   ├── paralelo-simple.ts
│   └── led-bateria.ts
├── intermedios/
│   ├── serie-switch.ts
│   ├── paralelo-leds.ts
│   └── mixto-basico.ts
└── avanzados/
    ├── circuito-complejo-1.ts
    ├── motor-control.ts
    └── sistema-iluminacion.ts
```

O por niveles educativos:

```
app/game/nivel/niveles/
├── nivel-1/
│   ├── modulo-1/
│   │   ├── seccion-1/
│   │   │   └── introduccion.ts
│   │   └── seccion-2/
│   │       └── serie-basico.ts
│   └── modulo-2/
│       └── ...
└── nivel-2/
    └── ...
```

## 🔍 Ver Todos los Niveles Disponibles

Para ver la lista completa de niveles registrados:

1. Abre la consola del navegador
2. Escribe:
   ```javascript
   import { getNivelesDisponibles } from './niveles-registry'
   console.log(getNivelesDisponibles())
   ```

O revisa directamente el archivo `niveles-registry.ts`

## ⚠️ Solución de Problemas

### Error: "El nivel no existe en el registro"
- Verifica que agregaste el nivel en `niveles-registry.ts`
- Revisa que el ID en la URL coincida exactamente (incluyendo mayúsculas/minúsculas)

### Error: "No se pudo cargar la configuración"
- Verifica que la ruta del import sea correcta
- Asegúrate que el archivo exporta: `title`, `circuitElements`, `wires`, `ballAnimations`, `textElements`

### El circuito se ve vacío
- Revisa que el archivo de configuración tenga elementos en los arrays
- Verifica en la consola si hay errores de importación

## 💡 Consejos

1. **Prueba tu nivel:** Siempre prueba el nivel después de agregarlo para verificar que funciona correctamente

2. **Usa nombres descriptivos:** Los IDs deben ser fáciles de recordar y entender

3. **Organiza tus archivos:** Mantén una estructura de carpetas coherente

4. **Documenta:** Si creas muchos niveles, considera hacer una lista en un archivo README

5. **Reutiliza:** Puedes copiar archivos de configuración existentes y modificarlos para crear nuevos niveles rápidamente
