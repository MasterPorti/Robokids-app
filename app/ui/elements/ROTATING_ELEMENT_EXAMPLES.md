# RotatingElement - Componente Genérico de Rotación

Este componente permite rotar cualquier elemento SVG de forma reutilizable.

## Características

- ✅ Control de dirección: `stop`, `left` (antihorario), `right` (horario)
- ✅ Velocidad configurable
- ✅ Reutilizable para cualquier SVG
- ✅ Múltiples instancias en la misma página

## Props

```typescript
interface RotatingElementProps {
  children: React.ReactNode;        // Contenido SVG a renderizar
  direction: "stop" | "left" | "right"; // Dirección de rotación
  targetId: string;                 // ID del elemento SVG que debe girar
  speed?: number;                   // Velocidad en segundos (default: 10)
}
```

## Ejemplos de Uso

### 1. Componente Motor (ya implementado)

```tsx
import RotatingElement from "./RotatingElement";

export default function Motor({
  width,
  direction,
  speed = 10,
}: {
  width: number;
  direction: "stop" | "left" | "right";
  speed?: number;
}) {
  return (
    <RotatingElement direction={direction} targetId="estogira" speed={speed}>
      <svg width={width} viewBox="0 0 372 321">
        {/* ... contenido del SVG ... */}
        <path id="estogira" /* este es el elemento que gira */ />
        {/* ... más contenido ... */}
      </svg>
    </RotatingElement>
  );
}
```

### 2. Ejemplo: Engranaje Personalizado

```tsx
import RotatingElement from "./RotatingElement";

export default function Gear({
  size,
  direction,
  speed = 5,
}: {
  size: number;
  direction: "stop" | "left" | "right";
  speed?: number;
}) {
  return (
    <RotatingElement direction={direction} targetId="gear-teeth" speed={speed}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" fill="#888" />
        <g id="gear-teeth">
          {/* Este grupo completo girará */}
          <rect x="48" y="10" width="4" height="15" fill="#666" />
          <rect x="48" y="75" width="4" height="15" fill="#666" />
          <rect x="10" y="48" width="15" height="4" fill="#666" />
          <rect x="75" y="48" width="15" height="4" fill="#666" />
        </g>
      </svg>
    </RotatingElement>
  );
}
```

### 3. Ejemplo: Ventilador con Múltiples Velocidades

```tsx
import RotatingElement from "./RotatingElement";

export default function Fan({
  isOn,
  speed = "medium",
}: {
  isOn: boolean;
  speed?: "slow" | "medium" | "fast";
}) {
  const direction = isOn ? "right" : "stop";
  const speedMap = {
    slow: 3,
    medium: 1.5,
    fast: 0.5,
  };

  return (
    <RotatingElement
      direction={direction}
      targetId="fan-blades"
      speed={speedMap[speed]}
    >
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="5" fill="#333" />
        <g id="fan-blades">
          <ellipse cx="50" cy="25" rx="8" ry="20" fill="#4a90e2" />
          <ellipse cx="75" cy="50" rx="20" ry="8" fill="#4a90e2" />
          <ellipse cx="50" cy="75" rx="8" ry="20" fill="#4a90e2" />
          <ellipse cx="25" cy="50" rx="20" ry="8" fill="#4a90e2" />
        </g>
      </svg>
    </RotatingElement>
  );
}
```

### 4. Ejemplo: Reloj con Múltiples Elementos Rotando

```tsx
import RotatingElement from "./RotatingElement";

export default function Clock() {
  return (
    <div style={{ position: "relative", width: 200, height: 200 }}>
      {/* Manecilla de horas - gira lento */}
      <RotatingElement direction="right" targetId="hour-hand" speed={43200}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: "absolute" }}>
          <line id="hour-hand" x1="100" y1="100" x2="100" y2="60" stroke="black" strokeWidth="4" />
        </svg>
      </RotatingElement>

      {/* Manecilla de minutos - gira más rápido */}
      <RotatingElement direction="right" targetId="minute-hand" speed={3600}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: "absolute" }}>
          <line id="minute-hand" x1="100" y1="100" x2="100" y2="40" stroke="blue" strokeWidth="3" />
        </svg>
      </RotatingElement>

      {/* Manecilla de segundos - gira rápido */}
      <RotatingElement direction="right" targetId="second-hand" speed={60}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: "absolute" }}>
          <line id="second-hand" x1="100" y1="100" x2="100" y2="30" stroke="red" strokeWidth="2" />
        </svg>
      </RotatingElement>
    </div>
  );
}
```

## Notas Importantes

1. **ID único**: Cada elemento que quieras rotar debe tener un `id` único en el SVG
2. **targetId**: El prop `targetId` debe coincidir con el `id` del elemento SVG
3. **Múltiples instancias**: Puedes usar varios `RotatingElement` en la misma página, cada uno con su propio `targetId`
4. **Transform origin**: El componente automáticamente centra el punto de rotación

## Integración con el Sistema de Circuitos

En `circuitConfig.ts`:

```typescript
{
  id: "motor-1",
  type: "motor",
  x: 435,
  y: 136,
  width: 150,
  rotation: 0,
  direction: "left", // o "right" o "stop"
}
```

En los cables, puedes cambiar la dirección:

```typescript
onComplete: [
  { elementId: "motor-1", changes: { direction: "right" } },
  { elementId: "motor-2", changes: { direction: "stop" } },
]
```
