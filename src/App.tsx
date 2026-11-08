/*
 * Tablero de indicadores — Matías Nicolás Echeveste Cardozo
 * Tablero de precios máximos de combustibles en Uruguay con filtros, indicadores, gráfico y tabla.
 */
import { useMemo, useState } from 'react'
import { GraficoLineas } from './componentes/GraficoLineas'
import datos from './datos/precios.json'
import { filtrarPorRango, indicadores, periodoLegible, pesos, type Serie } from './lib/series'

const SERIES = datos.series as Serie[]
const COLORES: Record<string, string> = {
  'SUPER 95 30-S': '#2563eb',
  'PREMIUM 97 30-S': '#7c3aed',
  'GASOIL 50-S': '#d97706',
  'GASOIL 10-S': '#059669',
  'QUEROSENO ILUMINANTE': '#dc2626',
  SUPERGAS: '#0891b2',
}
const PERIODOS = [...new Set(SERIES.flatMap((s) => s.puntos.map((p) => p.periodo)))].sort()
const UNIDADES: Record<string, string> = { litro: '$/litro', kilo: '$/kilo', tonelada: '$/tonelada' }

export default function App() {
  const [elegidos, setElegidos] = useState<string[]>(['SUPER 95 30-S', 'GASOIL 50-S'])
  const [desde, setDesde] = useState(PERIODOS[0]!)
  const [hasta, setHasta] = useState(PERIODOS.at(-1)!)
  const [vista, setVista] = useState<'grafico' | 'tabla'>('grafico')

  const visibles = useMemo(
    () =>
      SERIES.filter((s) => elegidos.includes(s.producto)).map((s) => ({
        ...s,
        puntos: filtrarPorRango(s.puntos, desde, hasta),
      })),
    [elegidos, desde, hasta],
  )
  const unidadesMezcladas = new Set(visibles.map((s) => s.unidad)).size > 1

  const alternar = (producto: string) =>
    setElegidos((actual) => (actual.includes(producto) ? actual.filter((p) => p !== producto) : [...actual, producto]))

  return (
    <main>
      <header>
        <h1>Precios de combustibles en Uruguay</h1>
        <p className="sub">Precios máximos mensuales con IVA fijados por el Poder Ejecutivo.</p>
      </header>

      <section className="filtros" aria-label="Filtros">
        <fieldset>
          <legend>Productos</legend>
          {SERIES.map((s) => (
            <label key={s.producto} className="chip" style={{ '--color': COLORES[s.producto] } as React.CSSProperties}>
              <input type="checkbox" checked={elegidos.includes(s.producto)} onChange={() => alternar(s.producto)} />
              {s.producto}
            </label>
          ))}
        </fieldset>
        <label>
          Desde{' '}
          <select value={desde} onChange={(e) => setDesde(e.target.value)}>
            {PERIODOS.filter((p) => p <= hasta).map((p) => (
              <option key={p} value={p}>
                {periodoLegible(p)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Hasta{' '}
          <select value={hasta} onChange={(e) => setHasta(e.target.value)}>
            {PERIODOS.filter((p) => p >= desde).map((p) => (
              <option key={p} value={p}>
                {periodoLegible(p)}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="tarjetas" aria-label="Indicadores">
        {visibles.map((s) => {
          const ind = indicadores(s.puntos)
          return (
            <article key={s.producto} className="tarjeta" style={{ borderColor: COLORES[s.producto] }}>
              <h2>{s.producto}</h2>
              {ind ? (
                <>
                  <p className="valor">
                    {pesos.format(ind.ultimo.valor)} <span>{UNIDADES[s.unidad]}</span>
                  </p>
                  <p className="detalle">Último dato: {periodoLegible(ind.ultimo.periodo)}</p>
                  <p className="detalle">
                    Interanual:{' '}
                    {ind.interanual === null ? 'sin dato' : `${ind.interanual > 0 ? '+' : ''}${ind.interanual} %`}
                  </p>
                  <p className="detalle">
                    Rango: {pesos.format(ind.minimo.valor)} – {pesos.format(ind.maximo.valor)}
                  </p>
                </>
              ) : (
                <p className="detalle">Sin datos en el período elegido.</p>
              )}
            </article>
          )
        })}
      </section>

      {unidadesMezcladas && (
        <p className="aviso" role="note">
          Atención: hay productos con unidades distintas (litro y kilo) en el mismo gráfico.
        </p>
      )}

      <div className="pestanas" role="tablist" aria-label="Vista">
        <button role="tab" aria-selected={vista === 'grafico'} onClick={() => setVista('grafico')}>
          Gráfico
        </button>
        <button role="tab" aria-selected={vista === 'tabla'} onClick={() => setVista('tabla')}>
          Tabla
        </button>
      </div>

      {vista === 'grafico' ? (
        <GraficoLineas series={visibles} colores={COLORES} unidad={unidadesMezcladas ? "$ por unidad" : UNIDADES[visibles[0]?.unidad ?? ""]} />
      ) : (
        <div className="tabla-contenedor" tabIndex={0}>
          <table>
            <caption>Precios por período</caption>
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Período</th>
                <th scope="col">Precio</th>
              </tr>
            </thead>
            <tbody>
              {visibles.flatMap((s) =>
                s.puntos.map((p) => (
                  <tr key={`${s.producto}-${p.periodo}`}>
                    <td>{s.producto}</td>
                    <td>{periodoLegible(p.periodo)}</td>
                    <td>{pesos.format(p.valor)}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      )}

      <footer>
        Fuente: {datos.fuente}. Versión del {datos.actualizado.split('-').reverse().join('/')}. Los meses sin
        cotización publicada se muestran como cortes en la línea.
      </footer>
    </main>
  )
}
