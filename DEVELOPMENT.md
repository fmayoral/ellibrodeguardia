# Desarrollo

Documentación técnica para quien mantenga o edite el código. Para la descripción de la app en sí, ver [README.md](./README.md).

## Estructura del proyecto

- `index.html` — shell de la app (sidebar, barra superior, buscador)
- `css/` — estilos (tokens de tema, layout, componentes, responsive)
- `content/` — el contenido real: un archivo por módulo clínico (`content/modules/`), por calculadora (`content/calculators/`) y por categoría de fármacos (`content/drugs/`), más `meta.json` con título/categoría/ícono de cada uno
- `js/` — router, buscador, motor de calculadoras y demás lógica
- `manifest.json` / `sw.js` — instalación como app y funcionamiento offline
- `tools/` — scripts de desarrollo (servidor local, generación del service worker)

No hay build ni dependencias: lo que está en el repo es exactamente lo que sirve GitHub Pages.

## Previsualizar en local

`fetch()` del contenido necesita un servidor real (no funciona abriendo `index.html` directo desde el disco). No hace falta instalar nada, solo Node:

```
node tools/dev-server.mjs
```

y abrir `http://localhost:8080`.

## Agregar o editar un módulo clínico

Crear/editar su archivo en `content/modules/` y agregar su entrada en `content/meta.json` (título, categoría, ícono). Después de agregar o quitar archivos, correr:

```
node tools/generate-sw.mjs
```

para que el modo offline los incluya en el cache.
