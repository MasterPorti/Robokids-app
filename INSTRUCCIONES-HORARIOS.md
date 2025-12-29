# Instrucciones para Agregar Sucursales y Horarios

## Resumen de Cambios

Esta migración agrega:
1. **Tabla `horarios`**: Para gestionar horarios de clases (2 horas cada una)
2. **Campos en `alumnos`**:
   - `sucursal`: Plaza Coacalco, Cofradia o Plaza Periferico
   - `horario_id`: Referencia al horario asignado

## Cómo Aplicar la Migración en Supabase

### Opción 1: Desde el Dashboard de Supabase (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, selecciona **SQL Editor**
3. Haz clic en **New Query**
4. Copia y pega todo el contenido del archivo `supabase-migration-horarios.sql`
5. Haz clic en **Run** para ejecutar la migración
6. Verifica que todo se ejecutó correctamente (deberías ver mensajes de éxito)

### Opción 2: Desde Supabase CLI

```bash
# Si tienes Supabase CLI instalado
supabase db push

# O ejecuta el archivo SQL directamente
psql -h [TU-HOST] -U postgres -d postgres -f supabase-migration-horarios.sql
```

## Estructura de la Nueva Tabla `horarios`

```sql
horarios:
  - id: UUID (primary key)
  - dia_semana: TEXT (Lunes-Domingo)
  - hora_inicio: TIME
  - hora_fin: TIME (calculado automáticamente: hora_inicio + 2 horas)
  - sucursal: TEXT (Plaza Coacalco | Cofradia | Plaza Periferico)
  - created_at: TIMESTAMP
  - updated_at: TIMESTAMP
```

## Cambios en la Tabla `alumnos`

```sql
alumnos:
  ... (campos existentes)
  + sucursal: TEXT (Plaza Coacalco | Cofradia | Plaza Periferico)
  + horario_id: UUID (foreign key -> horarios.id)
```

## Características Implementadas

### 1. Validación Automática
- Solo permite sucursales válidas (Plaza Coacalco, Cofradia, Plaza Periferico)
- Solo permite días válidos (Lunes-Domingo)

### 2. Cálculo Automático de Hora Fin
- Al crear un horario, solo defines `hora_inicio`
- La `hora_fin` se calcula automáticamente sumando 2 horas
- Ejemplo: hora_inicio = 09:00 → hora_fin = 11:00

### 3. Políticas de Seguridad (RLS)
- Todos los usuarios autenticados pueden:
  - Ver horarios
  - Crear horarios
  - Actualizar horarios
  - Eliminar horarios

### 4. Horarios de Ejemplo
Se insertan 10 horarios de ejemplo para empezar:
- Lunes: 09:00, 11:00, 15:00 en Plaza Coacalco
- Martes: 09:00, 11:00 en Cofradia
- Miércoles: 09:00, 15:00 en Plaza Periferico
- Jueves: 10:00 en Plaza Coacalco
- Viernes: 09:00 en Cofradia
- Sábado: 10:00 en Plaza Periferico

## Próximos Pasos

Después de aplicar la migración, necesitarás:

1. **Actualizar el formulario de registro de alumnos** para incluir:
   - Selector de sucursal
   - Selector de horario (filtrado por sucursal seleccionada)

2. **Crear interfaz para gestionar horarios**:
   - Página para que admin/profesores creen horarios
   - Lista de horarios existentes
   - Opción para editar/eliminar horarios

3. **Actualizar las consultas existentes** para incluir información de sucursal y horario

## Consultas SQL Útiles

### Ver todos los horarios por sucursal
```sql
SELECT * FROM horarios
WHERE sucursal = 'Plaza Coacalco'
ORDER BY dia_semana, hora_inicio;
```

### Ver alumnos con sus horarios
```sql
SELECT
  a.nombre,
  a.sucursal,
  h.dia_semana,
  h.hora_inicio,
  h.hora_fin
FROM alumnos a
LEFT JOIN horarios h ON a.horario_id = h.id
ORDER BY a.nombre;
```

### Ver cuántos alumnos hay por horario
```sql
SELECT
  h.sucursal,
  h.dia_semana,
  h.hora_inicio,
  h.hora_fin,
  COUNT(a.id) as total_alumnos
FROM horarios h
LEFT JOIN alumnos a ON h.id = a.horario_id
GROUP BY h.id, h.sucursal, h.dia_semana, h.hora_inicio, h.hora_fin
ORDER BY h.sucursal, h.dia_semana, h.hora_inicio;
```

## Verificación

Después de aplicar la migración, ejecuta esta consulta para verificar:

```sql
-- Verificar que la tabla horarios existe
SELECT COUNT(*) FROM horarios;

-- Verificar que los campos se agregaron a alumnos
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'alumnos'
  AND column_name IN ('sucursal', 'horario_id');
```

## Notas Importantes

- Los alumnos existentes tendrán `sucursal` y `horario_id` en NULL hasta que se actualicen
- La `hora_fin` siempre será 2 horas después de `hora_inicio` (no se puede modificar manualmente)
- Si eliminas un horario que está asignado a alumnos, el `horario_id` de esos alumnos se pondrá en NULL automáticamente
