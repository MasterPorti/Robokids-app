# ✅ Instrucciones Finales - Sistema de Planes de Pago

## 🎯 Último Paso: Agregar Price IDs al .env.local

Para activar el sistema de 3 planes, agrega las siguientes líneas al final de tu archivo `.env.local`:

## 🚀 Cómo Activar el Sistema

### 1. Agregar las variables al .env.local

Copia y pega las 3 líneas de arriba en tu archivo `.env.local`

### 2. Reiniciar el servidor

```bash
# Detén el servidor si está corriendo (Ctrl+C)
# Luego ejecuta:
npm run dev
```

### 3. Probar el sistema

Ve a: `http://localhost:3000/alumnos/pagos`

Deberías ver los 3 planes:

- ✅ **Pago Mensual** - $1680 MXN (pago único)
- ⭐ **Pago Recurrente Automático** - $1600 MXN/mes (suscripción)
- 💎 **Plan Completo por Niveles** - $9000 MXN (6 meses, pago único)

---

## 📋 Resumen de Precios Configurados

| Plan                    | Precio        | Tipo       | Price ID                         |
| ----------------------- | ------------- | ---------- | -------------------------------- |
| Mensual Único           | $1680 MXN     | Pago único | `price_1SlM6LCxKT4dA2MXrYosMt4Y` |
| Suscripción Mensual     | $1600 MXN/mes | Recurrente | `price_1SlMAQCxKT4dA2MX0P6hCvV8` |
| Plan Completo (6 meses) | $9000 MXN     | Pago único | `price_1SlMBMCxKT4dA2MX7fmmqOdV` |

---

## 🧪 Pruebas con Tarjetas de Test de Stripe

Para probar los pagos en modo test, usa estas tarjetas:

**Tarjeta que siempre funciona:**

```
Número: 4242 4242 4242 4242
Fecha: Cualquier fecha futura (ej: 12/34)
CVC: Cualquier 3 dígitos (ej: 123)
ZIP: Cualquier código postal
```

**Tarjeta que falla:**

```
Número: 4000 0000 0000 0002
Fecha: Cualquier fecha futura
CVC: Cualquier 3 dígitos
```

Más tarjetas de prueba: https://stripe.com/docs/testing#cards

---

## ✅ Todo Listo!

Una vez que agregues las variables y reinicies el servidor, el sistema estará funcionando completamente. Los alumnos podrán:

1. Ver los 3 planes de pago
2. Seleccionar el plan que prefieran
3. Pagar con Stripe de forma segura
4. Ver su estado de pago actualizado automáticamente

¡Listo para usar! 🎉
