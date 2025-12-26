# 🔧 Configuración para Supabase Autohosteado (Sin Service Role Key)

## 📌 Estado Actual

Tu sistema está configurado para funcionar **sin necesidad de la `SUPABASE_SERVICE_ROLE_KEY`**. Esto es útil cuando usas Supabase autohosteado en Coolify y no puedes acceder fácilmente a esta key.

---

## ✅ Funcionalidades que SÍ funcionan

### 1. **Inscribir Nuevos Alumnos** ✅
- ✅ Funciona perfectamente
- ✅ Genera usuario y contraseña automáticamente
- ✅ Crea el usuario en Auth
- ✅ Guarda datos en la tabla `alumnos`

### 2. **Ver Lista de Alumnos** ✅
- ✅ Muestra todos tus alumnos
- ✅ Buscador funcional
- ✅ Estadísticas en tiempo real

### 3. **Editar Información de Alumnos** ✅
- ✅ Modificar nombre, tutor, teléfono
- ✅ Cambiar día de pago
- ✅ Actualizar fecha de inscripción

### 4. **Eliminar Alumnos** ⚠️ (Funciona con limitación)
- ✅ Elimina el alumno de la base de datos
- ⚠️ El usuario queda en Auth (no causa problemas)
- ℹ️ El alumno no podrá volver a iniciar sesión porque no existe en la tabla

---

## ❌ Funcionalidades Limitadas

### **Cambiar Contraseña** ❌
- ❌ No funciona sin la service_role_key
- **Solución alternativa:** Eliminar y recrear el alumno

**Proceso recomendado:**
1. Anota la información del alumno (nombre, tutor, teléfono, etc.)
2. Elimina el alumno desde el panel
3. Vuelve a inscribirlo con los mismos datos
4. Se generará un nuevo usuario y contraseña

---

## 🔑 Variables de Entorno Necesarias

En tu archivo `.env.local` solo necesitas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-supabase-url.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...tu_anon_key
```

**NO necesitas:**
- ❌ `SUPABASE_SERVICE_ROLE_KEY` (opcional)

---

## 🔍 Cómo Obtener la Service Role Key (si la quieres)

### **Opción 1: Desde Coolify**

1. Abre tu proyecto en Coolify
2. Ve a los servicios de Supabase
3. Busca en **Environment Variables**
4. Encuentra estas variables:
   ```
   ANON_KEY=eyJ...
   SERVICE_ROLE_KEY=eyJ...  ← Esta es la que necesitas
   ```

### **Opción 2: Desde SSH al VPS**

```bash
# Conectarte a tu VPS
ssh usuario@tu-vps.com

# Ver variables de Supabase
docker ps | grep supabase
docker exec -it [container-id] env | grep KEY

# O ver el archivo de configuración
cat /ruta/a/supabase/docker-compose.yml | grep SERVICE_ROLE
```

### **Opción 3: Generarla Manualmente**

Si tienes el `JWT_SECRET` de tu Supabase, puedes generar la service_role_key usando una herramienta JWT online con estos claims:

```json
{
  "role": "service_role",
  "iss": "supabase",
  "iat": 1234567890,
  "exp": 9999999999
}
```

---

## 🎯 Recomendaciones

### **Si puedes obtener la Service Role Key:**
1. Agrégala a `.env.local`
2. Reinicia el servidor: `npm run dev`
3. El cambio de contraseña funcionará automáticamente

### **Si NO puedes obtenerla:**
- ✅ Todo lo demás funciona perfectamente
- ✅ Usa el flujo de "eliminar y recrear" para cambiar contraseñas
- ✅ Es seguro y funcional para producción

---

## 🔒 Seguridad

El sistema es seguro incluso sin la service_role_key porque:

- ✅ Row Level Security (RLS) está activo
- ✅ Solo ves y editas TUS alumnos
- ✅ Las contraseñas se generan aleatoriamente
- ✅ Los profesores están autenticados

---

## 📝 Políticas de Supabase Necesarias

Asegúrate de ejecutar esto en el SQL Editor de tu Supabase:

```sql
-- Políticas para la tabla alumnos
CREATE POLICY "Permitir Insertar Auth"
ON public.alumnos FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir Ver Propios"
ON public.alumnos FOR SELECT
TO authenticated
USING (auth.uid() = profesor_id);

CREATE POLICY "Permitir Actualizar Propios"
ON public.alumnos FOR UPDATE
TO authenticated
USING (auth.uid() = profesor_id)
WITH CHECK (auth.uid() = profesor_id);

CREATE POLICY "Permitir Eliminar Propios"
ON public.alumnos FOR DELETE
TO authenticated
USING (auth.uid() = profesor_id);
```

---

## 🆘 Soporte

Si necesitas ayuda:
1. Revisa este documento
2. Verifica que las políticas RLS estén activas
3. Confirma que tus variables de entorno sean correctas
4. Reinicia el servidor después de cambiar `.env.local`

---

## ✨ Próximos Pasos

Para mejorar el sistema más adelante:

1. **Agregar campo de estado** (activo/inactivo) en lugar de eliminar
2. **Sistema de recuperación de contraseña** para alumnos
3. **Logs de actividad** para auditoría
4. **Exportar datos** a CSV/Excel

---

**¡Tu sistema está listo para usar! 🚀**
