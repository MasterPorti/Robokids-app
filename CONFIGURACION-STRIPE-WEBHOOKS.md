# Configuración de Stripe Webhooks para Pagos Automáticos

Este documento explica cómo configurar los webhooks de Stripe para que los pagos se registren automáticamente en la base de datos.

## 📋 Pasos para la Configuración

### 1. Ejecutar la Migración SQL

Primero, ejecuta el script de migración en Supabase:

1. Ve a tu proyecto de Supabase
2. Abre el **SQL Editor**
3. Copia y pega el contenido del archivo `supabase-migracion-stripe.sql`
4. Ejecuta el script

Esto agregará:
- Campo `stripe_customer_id` a la tabla `alumnos`
- Campos `stripe_payment_id` y `stripe_invoice_id` a la tabla `pagos`
- Actualización del constraint para incluir "stripe" como método de pago

### 2. Agregar Variable de Entorno

Agrega la siguiente variable a tu archivo `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui
```

⚠️ **Nota**: Obtendrás este valor en el siguiente paso.

### 3. Configurar Webhook en Stripe Dashboard

1. Ve a [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Haz clic en **"Add endpoint"**
3. Configura los siguientes valores:

   **Endpoint URL:**
   ```
   https://tu-dominio.com/api/webhooks/stripe
   ```

   O para desarrollo local con Stripe CLI:
   ```
   http://localhost:3000/api/webhooks/stripe
   ```

   **Events to send:**
   Selecciona los siguientes eventos:
   - ✅ `checkout.session.completed` **← NUEVO: Para pagos únicos**
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`

4. Haz clic en **"Add endpoint"**
5. En la página del webhook, encontrarás el **Signing secret** (comienza con `whsec_`)
6. Copia este valor y actualiza tu `.env.local` con él

### 4. Probar el Webhook (Desarrollo Local)

Para probar webhooks en desarrollo local, usa Stripe CLI:

```bash
# Instalar Stripe CLI (si no lo tienes)
# https://stripe.com/docs/stripe-cli

# Iniciar sesión
stripe login

# Reenviar webhooks a tu servidor local
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

El CLI te dará un webhook secret temporal que puedes usar en desarrollo.

### 5. Verificar la Configuración

Realiza una prueba:

1. Inicia sesión como un alumno
2. Ve a la página de pagos (`/alumnos/pagos`)
3. Haz clic en "Pagar con Stripe"
4. Completa el pago usando una tarjeta de prueba:
   - Número: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos
   - ZIP: Cualquier código postal

5. Verifica que:
   - El webhook recibió el evento (revisa los logs en Stripe Dashboard)
   - El pago se registró automáticamente en la tabla `pagos`
   - El campo `stripe_customer_id` se agregó al alumno
   - En la vista del profesor, el alumno aparece como "Pagado" con badge de Stripe
   - El botón "Adelantar" NO aparece para este alumno

## 🔄 ¿Cómo Funciona?

### Flujo de Pago

1. **Alumno inicia suscripción:**
   - Hace clic en "Pagar con Stripe"
   - Se crea una sesión de checkout con metadata (`userId`)
   - Se redirige a Stripe para completar el pago

2. **Stripe procesa el pago:**
   - Stripe crea/actualiza la suscripción
   - Genera el primer cargo (invoice)
   - Envía webhooks a tu servidor

3. **Webhook recibe eventos:**
   - `customer.subscription.created/updated`: Asocia `stripe_customer_id` al alumno
   - `invoice.payment_succeeded`: Registra el pago automáticamente en la base de datos

4. **Registro automático:**
   - Se busca el alumno por `stripe_customer_id`
   - Se verifica si ya existe un pago para ese período
   - Si no existe, se crea el registro con:
     - `metodo_pago: "stripe"`
     - `monto`: Monto del invoice
     - `periodo_mes/anio`: Basado en la fecha del pago
     - `notas`: Referencia al invoice de Stripe

### Diferencias para Alumnos con Stripe

**En la vista del profesor (`/profesores/home/pagos`):**

- ✅ Muestra badge "💳 Stripe" junto a pagos de Stripe
- ❌ NO muestra botón "Adelantar" (porque los pagos son recurrentes automáticos)
- ℹ️ El método de pago aparece como "stripe"

**En la vista del alumno (`/alumnos/pagos`):**

- ✅ Muestra "Suscripción Activa" en lugar de "Pago Completado"
- ✅ Muestra fecha de próxima facturación
- ✅ Se renueva automáticamente cada mes

## 🛠️ Troubleshooting

### El webhook no recibe eventos

1. Verifica que la URL del webhook sea correcta
2. Verifica que los eventos estén seleccionados correctamente
3. Revisa los logs en Stripe Dashboard > Webhooks > [tu webhook] > Attempts

### El pago no se registra automáticamente

1. Revisa los logs del servidor (`console.log` en el webhook)
2. Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
3. Verifica que la migración SQL se haya ejecutado correctamente
4. Revisa que el `userId` esté en los metadata de la suscripción

### Error: "No se encontró alumno con customer_id"

Esto puede ocurrir si:
- El evento `customer.subscription.created` no se procesó primero
- El `userId` en metadata no coincide con el ID del alumno en la BD
- El alumno fue eliminado de la base de datos

## 🔒 Seguridad

- ✅ El webhook verifica la firma de Stripe usando `STRIPE_WEBHOOK_SECRET`
- ✅ Solo eventos firmados por Stripe son procesados
- ✅ Se usa `SUPABASE_SERVICE_ROLE_KEY` para bypass RLS de forma segura
- ✅ Los pagos duplicados son prevenidos (constraint único por período)

## 📊 Base de Datos

### Tabla `alumnos`
```sql
-- Nuevo campo agregado
stripe_customer_id TEXT UNIQUE -- ID del customer en Stripe
```

### Tabla `pagos`
```sql
-- Nuevos campos agregados
stripe_payment_id TEXT  -- ID del PaymentIntent
stripe_invoice_id TEXT  -- ID del Invoice

-- Método de pago actualizado
metodo_pago CHECK IN ('efectivo', 'transferencia', 'tarjeta', 'stripe', 'otro')
```

## 📝 Notas Adicionales

- Los pagos de Stripe se registran automáticamente con el método `"stripe"`
- La fecha de pago se toma de la fecha del invoice
- El período (mes/año) se calcula basado en la fecha del pago
- Las cancelaciones de suscripción marcan al alumno como inactivo automáticamente
- No se pueden registrar pagos manuales para alumnos con suscripción de Stripe activa

## ✅ Checklist de Configuración

- [ ] Ejecuté `supabase-migracion-stripe.sql` en Supabase
- [ ] Agregué `STRIPE_WEBHOOK_SECRET` a `.env.local`
- [ ] Configuré el endpoint de webhook en Stripe Dashboard
- [ ] Seleccioné los eventos correctos en Stripe
- [ ] Probé un pago de prueba y se registró correctamente
- [ ] Verifiqué que el botón "Adelantar" NO aparece para alumnos con Stripe
- [ ] Verifiqué que aparece el badge "💳 Stripe" en pagos de Stripe
