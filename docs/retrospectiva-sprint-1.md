# Retrospectiva · Sprint 1

**Proyecto:** KMIZS — tienda de camisetas · **Curso:** Comercio Electrónico
**Sprint:** 1 · 27 de octubre – 2 de noviembre de 2026
**Sesión:** 2 de noviembre de 2026
**Facilita:** Horacio Campillo (Scrum Master)
**Participan:** Horacio Campillo, Ivan Arroyo
**Formato:** cuatro preguntas (qué funcionó, qué no, qué aprendimos, qué hacemos)

---

## 1. Datos del sprint

| Indicador                    | Resultado                                            |
| ---------------------------- | ---------------------------------------------------- |
| Tarjetas comprometidas       | 2 — `[E1]` (5 pts) y `[E1-E2]` (8 pts)               |
| Puntos comprometidos         | 13                                                   |
| Puntos completados           | 13                                                   |
| Commits publicados           | 7                                                    |
| Páginas estáticas publicadas | 26 (15 rutas en el primer despliegue)                |
| Referencias de catálogo      | 10                                                   |
| Tienda en producción         | https://tienda-kmizs.vercel.app                      |
| Cambios de alcance           | 1 (cápsula gráfica de anime, revertida el mismo día) |

El sprint se cumplió en alcance, pero **no en el DoD completo**: la revisión por otro integrante no se hizo y la evidencia quedó sin adjuntar. Está registrado abajo como acción pendiente, no como logro.

---

## 2. Qué funcionó — continuar

1. **El despliegue continuo.** Conectar el repositorio a Vercel tomó minutos y desde el primer commit hubo URL pública. Cada rama genera su propio preview, así que se puede mostrar avance sin tocar `main`.
2. **El flujo de ramas con Conventional Commits.** Siete commits con mensajes claros se leen como un historial del trabajo, no como una lista de `update`. Eso ya sirvió para reconstruir qué se hizo en la sustentación.
3. **Decidir el catálogo con datos.** La encuesta (86 respuestas) sostuvo la mezcla 4/4/2, el precio de entrada y el inventario concentrado en M y L. Ninguna decisión de precio quedó "porque sí".
4. **Documentar mientras se construye.** `docs/catalogo.md` y `docs/costos-camisetas.csv` se escribieron junto con el código, no después. Eso evitó tener que reconstruir el razonamiento al final.
5. **La revisión de accesibilidad antes de cerrar.** Se detectó que el botón del carrito quedaba sin nombre accesible en móvil y se corrigió en el mismo sprint (WCAG 2.5.8: objetivos táctiles de 44 px).

---

## 3. Qué no funcionó — dejar de hacer

1. **Marcar el DoD sin la evidencia.** Varias casillas se cerraron antes de tener el respaldo: la revisión por otro integrante no ocurrió y las capturas no se adjuntaron. Un DoD que se marca por optimismo deja de ser un criterio y se vuelve decoración.
2. **Cambiar el alcance sin el equipo.** La cápsula gráfica se pasó a franquicias de anime y se revirtió el mismo día. Costó un ciclo completo de trabajo (4 fichas, 4 imágenes, el documento de costos y la encuesta) que terminó en la basura. La decisión se tomó en una conversación de dos personas, no en el refinamiento.
3. **Trabajar sin revisión cruzada.** Todo el código lo escribió una sola persona. Nadie más lo leyó antes de publicarlo, así que el proyecto depende de que esa persona esté disponible.
4. **Dejar las pruebas en móvil para el final.** Se probó en 390 px casi al cerrar el sprint y ahí apareció el fallo de accesibilidad. Si se hubiera probado en cada entrega, se habría detectado tres días antes.
5. **No tener el acceso resuelto.** Solo una persona podía hacer push. Eso convirtió cada publicación en una espera y frenó el trabajo de los demás.

---

## 4. Qué aprendimos

- **Los costos de referencia no son cotizaciones.** Los números del catálogo cierran y los márgenes están entre 55,3% y 57,6%, pero ningún proveedor los ha confirmado por escrito. Antes de comprar inventario real hay que cotizar.
- **El envío gratis no es gratis.** Provisionar $1.590 por unidad (10% de los pedidos con envío gratuito, a $15.900) fue lo que evitó que el beneficio se comiera el margen.
- **Un mockup no es una foto.** Las 10 imágenes actuales son ilustraciones vectoriales. Sirven para validar el diseño del sitio, no para vender.
- **El acceso es infraestructura.** Invitar a los compañeros al repositorio y al tablero es tarea del día uno, no del día veinte.

---

## 5. Acciones para el Sprint 2

| #   | Acción                                                                                                        | Responsable     | Fecha límite |
| --- | ------------------------------------------------------------------------------------------------------------- | --------------- | ------------ |
| 1   | Invitar a Eduardo y Jesus como colaboradores del repositorio con permiso de escritura y al tablero de Trello. | Horacio         | 3 nov        |
| 2   | Cada integrante configura su propio acceso a GitHub y clona el repositorio en su equipo.                      | Todos           | 4 nov        |
| 3   | Definir la estrategia de imágenes del catálogo (mockups, fotos de muestra o mixta) y documentarla.            | Ivan            | 4 nov        |
| 4   | Rotar la revisión: ninguna tarjeta se cierra sin que la revise alguien distinto de quien la construyó.        | Todos           | Permanente   |
| 5   | Cerrar el DoD del Sprint 1: revisión de `[E1]` y `[E1-E2]` por otro integrante y capturas adjuntas.           | Eduardo / Jesus | 4 nov        |
| 6   | Probar en móvil en cada entrega, no al final del sprint.                                                      | Todos           | Permanente   |
| 7   | Reunión de 15 minutos al cierre de cada semana para revisar avance y bloqueos.                                | Horacio         | Cada domingo |
| 8   | Las decisiones de alcance se consultan en el grupo antes de implementarse.                                    | Todos           | Permanente   |

---

## 6. Riesgos para el Sprint 2

| Riesgo                                           | Impacto                               | Mitigación                                                                                            |
| ------------------------------------------------ | ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| No hay prendas físicas para fotografiar          | Alto — `[E2]` depende de las imágenes | Decidir el 4 nov entre mockups y muestra física; las fotos reales solo de 3 referencias               |
| El contenido legal exige investigación           | Medio — `[E4]` puede quedarse corto   | Usar la Ley 1480 de 2011 (retracto) y la Ley 1581 de 2012 (datos) como base, con revisión del docente |
| Solo una persona domina el código                | Medio — cuello de botella             | Revisión cruzada obligatoria y sesión de 1 hora para explicar la estructura del proyecto              |
| Los compañeros no aceptan la invitación a tiempo | Alto — el sprint se repite igual      | Enviar la invitación el 3 nov y confirmar recepción el 4 nov                                          |

---

## 7. Acuerdos del equipo

1. **Definición de terminado:** criterios cumplidos, probado en móvil, revisado por alguien que no lo construyó, desplegado en Vercel y evidencia adjunta. Sin los cinco, la tarjeta no pasa a `✅ Hecho`.
2. **Límite de trabajo en curso:** máximo 4 tarjetas en `🔧 En progreso`.
3. **Pull requests:** una revisión es suficiente para fusionar; si nadie revisa en 24 horas, el autor puede fusionar dejando constancia en el comentario.
4. **Rama por tarjeta:** `feat/`, `fix/` o `docs/` con el nombre de la tarjeta, y Conventional Commits.
5. **Una decisión, un registro:** toda decisión de alcance o de precio se anota en `docs/catalogo.md` con fecha y motivo.

---

## 8. Cierre

El Sprint 1 entregó una tienda funcionando con catálogo, precios y márgenes definidos. Lo que falta no es código: es **acceso para el equipo** y **disciplina con el DoD**. Las dos cosas se resuelven en la primera semana del Sprint 2 y son la diferencia entre un proyecto de una persona y uno de cuatro.
