# Cabecera del perfil

[`skapxd-signal.svg`](./skapxd-signal.svg) muestra **Núcleo sereno**: la x roja
emite un latido doble con un halo cálido y compacto, un apagado progresivo
y una pausa entre ciclos.
El nombre completo permanece visible y el loop dura **1,6 segundos**.

La identidad usa fondos antracita `#1A1A1A` y `#121212`, letras blancas, texto
secundario `#B0B0B0` y el acento rojo `#C0392B`. El logotipo es Inter Bold
convertido a contornos; las etiquetas usan fuentes sans-serif del sistema
cuando Inter no está disponible.

- Lienzo escalable de `1200 × 480` con `viewBox`.
- La x se expande ligeramente en dos impulsos. Un degradado radial forma el
  resplandor. Una máscara lo atenúa antes de los bordes de la zona central
  para evitar cortes visibles.
- Los keyframes `heart` y `gentle` comparten duración y terminan en reposo.
- Con `prefers-reduced-motion: reduce`, el SVG conserva su composición estática.
- A 600 px de ancho de imagen o menos se ocultan las etiquetas secundarias
  y se amplían los textos restantes.
- Incluye `title`, `desc` y texto alternativo en el README.
- SVG autónomo: sin scripts, filtros, fuentes remotas ni servicios externos.

Para modificar la cadencia, ajustar las dos duraciones en el bloque de
movimiento. `wordmark-x` define la x y `warm` controla el resplandor.
El SVG es tanto la fuente editable como el recurso que usa el README.

## Revisión local

Abrir [`preview-final.html`](../preview-final.html) directamente en un navegador.
La vista utiliza el archivo real mediante `<img>` y permite revisarlo en un
ancho grande y en 390 px. Activar la preferencia de movimiento reducido del
sistema o del navegador para comprobar el estado estático.
