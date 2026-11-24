-- ---------------------------------------------------------------------------
-- Sprint 4 · Estado `confirmed`
--
-- Contraentrega no tiene pago en línea: el pedido se acepta al registrarse y
-- queda confirmado desde el inicio. El valor se agrega en un archivo aparte
-- porque Postgres no permite usar un valor nuevo del enum en la misma
-- transacción que lo crea.
-- ---------------------------------------------------------------------------

alter type public.order_status add value if not exists 'confirmed';
