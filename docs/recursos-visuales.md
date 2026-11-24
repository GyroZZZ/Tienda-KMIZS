# Recursos visuales

**Fecha:** 24 de noviembre de 2026 · **Uso:** portada (`app/page.tsx`)

La portada usa cinco imágenes de personas con camisetas para acompañar el texto: hero, tres tarjetas
de colección y el banner de equipos. Se generaron con **Agnes Image 2.1 Flash** a través de su MCP,
no son fotografías de clientes ni del producto real.

> Son ilustraciones generadas con IA. Las prendas, las personas y los escenarios son ficticios;
> el aspecto real de cada referencia es el de las fotos de `public/products/`. La nota se documenta
> aquí y no se muestra en la interfaz, por decisión del PO.

## Archivos

| Archivo                            | Dónde se usa          | Dimensiones | Peso  |
| ---------------------------------- | --------------------- | ----------- | ----- |
| `public/lifestyle/hero.webp`       | Hero (primera pantalla) | 900 × 1125  | 21 KB |
| `public/lifestyle/basicas.webp`    | Colección Básicas     | 800 × 800   | 19 KB |
| `public/lifestyle/graficas.webp`   | Colección Gráficas    | 800 × 800   | 15 KB |
| `public/lifestyle/personalizadas.webp` | Colección Personalizadas | 800 × 800 | 39 KB |
| `public/lifestyle/equipos.webp`    | Banner de equipos     | 1280 × 720  | 37 KB |

Todas se exportaron a WebP (calidad 76) con `sharp`. El hero lleva `priority` porque es el elemento
más grande de la primera pantalla; el resto carga con `loading="lazy"`. Ninguna imagen lleva texto
incrustado. La paleta de la página (`ink`, `bone`, `accent`) no cambió.

## Prompts utilizados

1. **Hero** — retrato editorial de mujer joven colombiana de medio cuerpo, camiseta de algodón
   pesado color tinta, sin logos ni texto, luz natural lateral, pared lisa color hueso, actitud
   relajada, fotografía realista, formato vertical 4:5.
2. **Básicas** — retrato documental de hombre joven con camiseta lisa hueso, sin logos ni texto, luz
   de tarde, fondo de concreto neutro, encuadre cuadrado.
3. **Gráficas** — retrato editorial con camiseta tinta y estampado de líneas abstractas, sin letras
   ni marcas, luz suave, pared hueso, encuadre cuadrado.
4. **Personalizadas** — tres amigos con camisetas hueso a juego, sin logos ni texto, patio urbano
   neutro, luz de tarde, fotografía documental, encuadre cuadrado.
5. **Equipos** — grupo de cinco personas colombianas con camisetas tinta a juego, sin logos ni
   texto, calle urbana neutra, luz nublada, sonrisas naturales, encuadre horizontal 16:9.

El primer intento del grupo mostró rostros que no correspondían al contexto colombiano; se generó de
nuevo con esa indicación explícita.

## Verificación

- `npm run typecheck`, `npm run lint` y `npm run build` (segunda pasada, por el aviso de seguridad de
  Next 16.4.3) terminan sin errores.
- En el build de producción local (`npm run start`), las ocho imágenes de la portada cargan
  (`complete === true`, `naturalWidth > 0`) a 1440 px y a 390 px; las cinco lifestyle son las nuevas.
- `01-portada-escritorio.png` y `02-portada-movil.png` en `docs/evidencias/inicio/`: portada completa
  en escritorio y en móvil, con la misma paleta `ink`/`bone`/`accent` y sin desbordamiento.

## Cómo regenerarlas

Llamar a la herramienta de generación de imágenes con los prompts anteriores, guardar los PNG
temporales en `public/lifestyle/`, convertirlos con `sharp` a los tamaños de la tabla y borrar los
PNG. No hace falta tocar `app/page.tsx` si se conservan los mismos nombres de archivo.
