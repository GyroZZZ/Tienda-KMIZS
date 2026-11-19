# Retrospectiva · Sprint 4

**Sprint:** 4 (17 – 23 de noviembre de 2026) · **Equipo:** KMIZS
**Cierre:** 19 de noviembre de 2026

---

## 1. Qué salió bien

- **La base dejó de ser el correo.** Catálogo, stock, cupones, cuentas y pedidos viven en Postgres.
  `place_order` calcula totales con precios de la base y descuenta inventario en la misma transacción.
- **La compra se probó de verdad en producción.** Contraentrega con cupón, pago aprobado, rechazado
  y pendiente de Mercado Pago, con verificación de filas, stock y correos.
- **El pago sandbox quedó reproducible.** Con la cuenta de comprador de prueba y las tarjetas
  sembradas, cualquier compañero puede repetir la compra sin modificar variables.
- **Los errores se arreglaron con PR pequeño.** El redirect de `/cuenta` salió en el PR #29 y se
  verificó con un `curl` antes de tocar nada más.
- **La documentación distingue plan de realidad.** `docs/sprint-4.md` conserva el plan original y
  dice explícitamente qué se decidió distinto.

## 2. Qué se desvió del plan

| Plan | Realidad | Motivo |
| ---- | -------- | ------ |
| Supabase Auth con enlace mágico | Tabla `public.users`, scrypt y cookie HMAC | La consigna pedía nombre, correo y contraseña; evitamos depender de SMTP |
| `anon` + `service_role` | Solo `postgres` por `DATABASE_URL` | No se usa PostgREST; menos claves que administrar |
| Solo `PRIMERA10` | Cuatro cupones aprobados por el PO | El PO aprobó las cuatro campañas propuestas |
| `migrate-catalog.ts` | `seed-catalog.ts` | El seed es idempotente y hace upsert por slug |
| `begin_checkout` | `initiate_checkout` | Nombre alineado con el evento de Meta |

## 3. Qué quedó pendiente y por qué

| Pendiente | Motivo |
| --------- | ------ |
| ID del pixel de Meta | No lo entrega el equipo; el componente ya está listo y no carga nada sin él |
| Search Console | Falta acceso a la cuenta de la organización |
| WhatsApp Business, Instagram y TikTok | Requieren cuentas y contenido externo al repositorio |
| Lighthouse y QA en dos celulares | No se dispuso de los dispositivos dentro del sprint |
| Revisión cruzada del DoD | El mismo integrante cerró las tarjetas; se deja constancia, como en E4 |

## 4. Lecciones para el Sprint 5

1. Probar el checkout de Mercado Pago con navegador visible desde el primer día: en modo headless
   muestra un error genérico que no dice nada del problema real.
2. Cuando el entorno es de prueba permanente, documentar la cuenta de comprador y las tarjetas
   sembradas es parte del entregable, no un apunte suelto.
3. Las decisiones de arquitectura que cambian durante el sprint deben quedar escritas el mismo día;
   si no, el plan original se vuelve engañoso.
4. Cada compra de prueba descuenta stock real de la base. Conviene cancelar los pedidos de prueba o
   dejar una consulta lista para devolver inventario antes de la demostración final.
