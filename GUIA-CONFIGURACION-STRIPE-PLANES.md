# Guía de Configuración de Planes en Stripe

## Productos y Precios a Crear

Necesitas crear 3 productos en Stripe con sus respectivos precios:

### 1. Pago Mensual Único (Payment Intent)
- **Nombre del Producto**: "RoboKids - Pago Mensual"
- **Descripción**: "Pago único mensual de clases de robótica"
- **Tipo**: One-time payment
- **Precio**: $1600 MXN
- **Moneda**: MXN

### 2. Suscripción Recurrente Mensual
- **Nombre del Producto**: "RoboKids - Suscripción Mensual"
- **Descripción**: "Suscripción mensual automática de clases de robótica"
- **Tipo**: Recurring
- **Precio**: $1600 MXN
- **Frecuencia**: Mensual (cada mes)
- **Moneda**: MXN

### 3. Plan por Niveles (6 meses - Pago Único)
- **Nombre del Producto**: "RoboKids - Plan Completo por Niveles"
- **Descripción**: "Pago único por 6 meses de clases de robótica"
- **Tipo**: One-time payment
- **Precio**: $9000 MXN
- **Moneda**: MXN

---

## Instrucciones para Crear los Productos

### Opción 1: Desde Stripe Dashboard (Interfaz Web)

1. **Ir a Stripe Dashboard**
   - Ve a: https://dashboard.stripe.com
   - Inicia sesión con tu cuenta

2. **Crear Producto 1: Pago Mensual Único**
   - Ve a: **Products** → **Add product**
   - **Name**: `RoboKids - Pago Mensual`
   - **Description**: `Pago único mensual de clases de robótica`
   - En la sección de **Pricing**:
     - **Price**: `1600`
     - **Currency**: `MXN - Mexican Peso`
     - **Billing period**: Selecciona `One time`
   - Click en **Save product**
   - ✅ **IMPORTANTE**: Copia el **Price ID** (empieza con `price_...`)
   - Guárdalo como: `PRECIO_MENSUAL_UNICO`

3. **Crear Producto 2: Suscripción Recurrente Mensual**
   - Ve a: **Products** → **Add product**
   - **Name**: `RoboKids - Suscripción Mensual`
   - **Description**: `Suscripción mensual automática de clases de robótica`
   - En la sección de **Pricing**:
     - **Price**: `1600`
     - **Currency**: `MXN - Mexican Peso`
     - **Billing period**: Selecciona `Recurring`
     - **Billing interval**: `Monthly` (cada 1 mes)
   - Click en **Save product**
   - ✅ **IMPORTANTE**: Copia el **Price ID** (empieza con `price_...`)
   - Guárdalo como: `PRECIO_SUSCRIPCION_MENSUAL`

4. **Crear Producto 3: Plan Completo por Niveles**
   - Ve a: **Products** → **Add product**
   - **Name**: `RoboKids - Plan Completo por Niveles`
   - **Description**: `Pago único por 6 meses de clases de robótica`
   - En la sección de **Pricing**:
     - **Price**: `9000`
     - **Currency**: `MXN - Mexican Peso`
     - **Billing period**: Selecciona `One time`
   - Click en **Save product**
   - ✅ **IMPORTANTE**: Copia el **Price ID** (empieza con `price_...`)
   - Guárdalo como: `PRECIO_NIVEL_COMPLETO`

---

### Opción 2: Crear con la CLI de Stripe (Rápido)

Si tienes instalada la CLI de Stripe, puedes ejecutar estos comandos:

```bash
# 1. Pago Mensual Único
stripe products create \
  --name "RoboKids - Pago Mensual" \
  --description "Pago único mensual de clases de robótica"

# Copia el Product ID (prod_...) y úsalo aquí:
stripe prices create \
  --product prod_XXXXX \
  --currency mxn \
  --unit-amount 160000

# 2. Suscripción Recurrente Mensual
stripe products create \
  --name "RoboKids - Suscripción Mensual" \
  --description "Suscripción mensual automática de clases de robótica"

stripe prices create \
  --product prod_XXXXX \
  --currency mxn \
  --unit-amount 160000 \
  --recurring[interval]=month

# 3. Plan Completo por Niveles
stripe products create \
  --name "RoboKids - Plan Completo por Niveles" \
  --description "Pago único por 6 meses de clases de robótica"

stripe prices create \
  --product prod_XXXXX \
  --currency mxn \
  --unit-amount 900000
```

**Nota**: El `unit-amount` está en centavos, por eso 1600 MXN = 160000 centavos.

---

## Variables de Entorno

Una vez que tengas los 3 Price IDs, agrégalos a tu archivo `.env.local`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Price IDs de los planes
STRIPE_PRICE_MENSUAL_UNICO=price_1xxxxxxxxxxxxx
STRIPE_PRICE_SUSCRIPCION_MENSUAL=price_1xxxxxxxxxxxxx
STRIPE_PRICE_NIVEL_COMPLETO=price_1xxxxxxxxxxxxx
```

---

## Tipos de Checkout en Stripe

- **`mode: "payment"`**: Para pagos únicos (usado en Plan Mensual Único y Plan por Niveles)
- **`mode: "subscription"`**: Para suscripciones recurrentes (usado en Suscripción Mensual)

---

## Próximos Pasos

1. ✅ Crear los 3 productos en Stripe Dashboard
2. ✅ Copiar los 3 Price IDs
3. ✅ Agregar los Price IDs al archivo `.env.local`
4. ⏳ Actualizar el código del API de checkout
5. ⏳ Actualizar la página de pagos para mostrar los 3 planes

---

## Notas Importantes

- **Modo de Prueba vs Producción**: Asegúrate de crear los productos tanto en modo TEST como en PRODUCCIÓN
- **Webhooks**: Ya tienes configurado el webhook para manejar eventos de Stripe
- **Metadata**: Cada checkout incluirá `userId` y `userName` para identificar al alumno
