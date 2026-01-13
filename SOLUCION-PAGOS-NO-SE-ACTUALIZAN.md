# 🔧 Solución: Los Pagos No Se Actualizan

## El Problema

Cuando un alumno hace un pago único (mensual $1680 o plan completo $9000), el pago se procesa en Stripe pero NO se registra automáticamente en la base de datos.

## ✅ Solución Aplicada

He actualizado el webhook para manejar pagos únicos. Ahora necesitas agregar un evento nuevo en Stripe.

---

## 📋 Pasos para Solucionarlo

### 1. Ve a tu Webhook en Stripe Dashboard

1. Abre: https://dashboard.stripe.com/webhooks
2. Busca tu webhook existente (debe apuntar a `/api/webhooks/stripe`)
3. Haz clic en él para editarlo

### 2. Agregar el Nuevo Evento

En la sección **"Events to send"**, agrega:

```
✅ checkout.session.completed
```

**Eventos que debes tener seleccionados:**
- ✅ `checkout.session.completed` ← **NUEVO** (para pagos únicos)
- ✅ `customer.subscription.created` (para suscripciones)
- ✅ `customer.subscription.updated` (para suscripciones)
- ✅ `customer.subscription.deleted` (para cancelaciones)
- ✅ `invoice.payment_succeeded` (para pagos recurrentes)

### 3. Guardar Cambios

Haz clic en **"Update endpoint"** o **"Save"**

### 4. Reiniciar el Servidor

```bash
# Detén el servidor (Ctrl+C)
# Reinicia:
npm run dev
```

---

## 🧪 Probar que Funciona

1. Ve a `/alumnos/pagos` en tu navegador
2. Haz clic en **"Pago Único"** (el plan de $1680)
3. Completa el pago con tarjeta de prueba:
   - Número: `4242 4242 4242 4242`
   - Fecha: `12/34`
   - CVC: `123`
4. Después del pago, deberías ver inmediatamente "¡Pago Completado!"

---

## 🔍 Cómo Verificar que el Webhook Funcionó

### Opción 1: Revisar Logs de Stripe
1. Ve a: https://dashboard.stripe.com/webhooks
2. Haz clic en tu webhook
3. Ve a la pestaña **"Attempts"**
4. Deberías ver el evento `checkout.session.completed` con estado `succeeded`

### Opción 2: Revisar Logs del Servidor
En tu terminal donde corre `npm run dev`, deberías ver:

```
✅ Pago registrado exitosamente para alumno xxx - Monto: $1680 MXN
```

---

## 🆘 Si Sigue Sin Funcionar

### Verifica el .env.local

Asegúrate de tener:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

Si no tienes este valor:
1. Ve a tu webhook en Stripe Dashboard
2. Copia el **Signing secret** (empieza con `whsec_`)
3. Agrégalo a tu `.env.local`
4. Reinicia el servidor

### Para Desarrollo Local

Si estás probando en localhost, necesitas usar Stripe CLI:

```bash
# Instalar Stripe CLI
# https://stripe.com/docs/stripe-cli

# Reenviar webhooks a localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# El CLI te dará un webhook secret temporal (whsec_...)
# Cópialo a tu .env.local como STRIPE_WEBHOOK_SECRET
```

---

## ✅ Resumen de Cambios Realizados

1. **Webhook actualizado** ([app/api/webhooks/stripe/route.ts](app/api/webhooks/stripe/route.ts))
   - Agregado evento `checkout.session.completed`
   - Nueva función `handleCheckoutSessionCompleted()` para pagos únicos

2. **Documentación actualizada** ([CONFIGURACION-STRIPE-WEBHOOKS.md](CONFIGURACION-STRIPE-WEBHOOKS.md))
   - Agregado evento nuevo a la lista

---

## 🎯 Diferencia Entre los Tipos de Pago

| Tipo | Mode en Stripe | Evento que dispara | Webhook handler |
|------|---------------|-------------------|-----------------|
| Pago Mensual Único ($1680) | `payment` | `checkout.session.completed` | `handleCheckoutSessionCompleted` |
| Suscripción Mensual ($1600) | `subscription` | `invoice.payment_succeeded` | `handlePaymentSucceeded` |
| Plan Completo ($9000) | `payment` | `checkout.session.completed` | `handleCheckoutSessionCompleted` |

---

¡Listo! Una vez que agregues el evento `checkout.session.completed` en Stripe Dashboard, los pagos únicos se registrarán automáticamente. 🎉
