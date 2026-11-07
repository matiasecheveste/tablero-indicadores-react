# Tablero de precios de combustibles

Tablero web que muestra la evolución de los **precios máximos de combustibles en Uruguay** (super 95, premium 97,
gasoil, supergás y queroseno) con indicadores, filtros por producto y período, gráfico y tabla.

**Tecnologías:** React 19, TypeScript estricto, Vite, gráficos SVG propios (sin bibliotecas de gráficos), Vitest,
Testing Library y GitHub Actions. Publicado en Vercel.

Los datos provienen del proyecto [etl-datos-abiertos](https://github.com/matiasecheveste/etl-datos-abiertos), que
limpia el conjunto publicado por ANCAP en el Catálogo de Datos Abiertos.

## Qué demuestra

- **Componentes funcionales y hooks** (`useState`, `useMemo`, `useId`) con estado derivado, sin estado duplicado.
- **Visualización de datos desde cero:** escalas lineales, marcas «redondas» en el eje, cortes de línea en meses
  sin cotización y tooltip.
- **Accesibilidad:** el gráfico tiene título, cada punto se puede recorrer con el teclado y se anuncia por lector
  de pantalla (`aria-live`); la vista de tabla ofrece los mismos datos; contraste en modo claro y oscuro.
- **Lógica separada de la interfaz** (`src/lib/series.ts`): indicadores (último valor, extremos, promedio y
  variación interanual sólo si existe un dato comparable) probados de forma unitaria.
- **Pruebas de comportamiento** con Testing Library: interacción con filtros, pestañas y teclado.
- **Encabezados de seguridad** (CSP sin scripts en línea) en `vercel.json`.

## Uso

```bash
npm install
npm run dev     # http://localhost:5173
npm test
npm run build
```

## Estructura

```
src/App.tsx                     Filtros, tarjetas, pestañas y tabla
src/componentes/GraficoLineas   Gráfico SVG accesible
src/lib/series.ts               Indicadores, escalas y utilidades
src/datos/precios.json          Series exportadas por el ETL
tests/                          Pruebas unitarias y de componentes
```

## Autoría

Desarrollado por **Matías Nicolás Echeveste Cardozo**. Licencia MIT.
