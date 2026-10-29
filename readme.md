# TecnoStock

Tienda web para consultar productos y preparar pedidos. Está hecha con HTML,
CSS y JavaScript, sin frameworks.

## Cómo iniciar

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Inicia `index.html` con **Live Server**. Se necesita un servidor local para
   cargar el catálogo con `fetch()`.
3. La página carga los productos desde `data/products.json`. Si ocurre un
   problema, muestra un mensaje en pantalla.

## Cómo usar la tienda

1. Busca por nombre o descripción, o filtra por categoría y disponibilidad.
   También puedes ordenar por precio. Los filtros se pueden combinar.
2. Presiona **Agregar al carrito**. Los productos agotados o inactivos no se
   pueden agregar.
3. En el carrito, usa **+** y **-** para cambiar cantidades, **Eliminar** para
   quitar una línea o **Vaciar carrito** para borrar todo.
4. El carrito muestra las unidades, los subtotales y el total. Al alcanzar
   $300.000 COP de subtotal, aplica un descuento del 10 %.
5. Presiona **Confirmar pedido** para ver la factura simulada. No se realiza
   ningún pago real; después de confirmar, el carrito se vacía.

El carrito se guarda en el navegador y se conserva al recargar la página.