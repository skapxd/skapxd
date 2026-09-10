# Cabecera del perfil

[`skapxd-signal.svg`](./skapxd-signal.svg) es la cabecera del README. Las letras
están dibujadas con trazos SVG propios: no requieren una fuente para el logotipo.
El relieve en cobre y las líneas de fondo conservan la composición sin movimiento.

- Lienzo: `1200 × 480`, escalable mediante `viewBox`.
- Entrada: un reflejo cruza las letras y un pulso recorre el fondo durante
  **4,6 segundos**, una sola vez. Después queda estático.
- Accesibilidad: `title`, `desc` y texto alternativo en el README. La animación
  solo se activa con `prefers-reduced-motion: no-preference`.
- Móvil: a un ancho de imagen de 600 px o menos se ocultan las dos etiquetas
  secundarias y se amplían los textos restantes.
- Sin JavaScript, imágenes incrustadas, fuentes remotas, servicios ni generación
  periódica. El archivo SVG es la fuente editable y el artefacto publicado.

Para ajustar el diseño, editar los gradientes `background`, `ivory`, `copper` y
`thread`. El grupo `wordmark` define las seis letras; sus copias producen el
relieve, la cara y la máscara del reflejo. `sweep` y `signal` controlan la entrada.

Revisar el **README renderizado**, además del archivo individual: GitHub puede
mostrar una vista estática del SVG en su visor de archivos. La imagen mantiene
todo su contenido cuando no hay animación. Las rutas relativas del README
permiten revisar el recurso en la rama del PR antes de fusionarlo.

Para una comprobación local, abrir el README con un visor Markdown que admita
HTML o cargar el SVG mediante `<img>` en un HTML. Verificar a 1200 y 390 px,
con temas claro/oscuro y movimiento reducido activado. Los archivos temporales
de revisión no necesitan incluirse en el repositorio.
