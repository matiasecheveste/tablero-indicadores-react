/*
 * Tablero de indicadores — Matías Nicolás Echeveste Cardozo
 * Gráfico de líneas en SVG, sin bibliotecas externas, con tooltip accesible desde el teclado.
 */
import { useId, useMemo, useState } from 'react'
import { escala, marcas, mesAbsoluto, periodoLegible, pesos, tramos, type Serie } from '../lib/series'

interface Props {
  series: Serie[]
  colores: Record<string, string>
  alto?: number
}

const ANCHO = 760
const MARGEN = { arriba: 16, derecha: 16, abajo: 32, izquierda: 64 }

export function GraficoLineas({ series, colores, alto = 320 }: Props) {
  const idTitulo = useId()
  const [foco, setFoco] = useState<{ producto: string; indice: number } | null>(null)

  const geometria = useMemo(() => {
    const puntos = series.flatMap((s) => s.puntos)
    if (puntos.length === 0) return null
    const meses = puntos.map((p) => mesAbsoluto(p.periodo))
    const valores = puntos.map((p) => p.valor)
    const minV = Math.min(...valores)
    const maxV = Math.max(...valores)
    const holgura = (maxV - minV) * 0.08 || 1
    const x = escala(Math.min(...meses), Math.max(...meses), MARGEN.izquierda, ANCHO - MARGEN.derecha)
    const y = escala(minV - holgura, maxV + holgura, alto - MARGEN.abajo, MARGEN.arriba)
    const anios = [...new Set(puntos.map((p) => p.periodo.slice(0, 4)))].sort()
    return { x, y, marcasY: marcas(minV - holgura, maxV + holgura), anios }
  }, [series, alto])

  if (!geometria) return <p className="vacio">Seleccione al menos un producto.</p>
  const { x, y, marcasY, anios } = geometria
  const enFoco = foco && series.find((s) => s.producto === foco.producto)?.puntos[foco.indice]

  return (
    <figure className="grafico">
      <svg viewBox={`0 0 ${ANCHO} ${alto}`} role="img" aria-labelledby={idTitulo} onMouseLeave={() => setFoco(null)}>
        <title id={idTitulo}>Evolución mensual del precio máximo por producto</title>
        {marcasY.map((v) => (
          <g key={v}>
            <line className="guia" x1={MARGEN.izquierda} x2={ANCHO - MARGEN.derecha} y1={y(v)} y2={y(v)} />
            <text className="eje" x={MARGEN.izquierda - 8} y={y(v)} textAnchor="end" dominantBaseline="middle">
              {v}
            </text>
          </g>
        ))}
        {anios.map((a) => (
          <text key={a} className="eje" x={x(mesAbsoluto(`${a}-01`))} y={alto - 8} textAnchor="middle">
            {a}
          </text>
        ))}
        {series.map((s) => (
          <g key={s.producto} stroke={colores[s.producto]} fill={colores[s.producto]}>
            {tramos(s.puntos).map((t) => (
              <polyline
                key={t[0]!.periodo}
                className="linea"
                fill="none"
                points={t.map((p) => `${x(mesAbsoluto(p.periodo))},${y(p.valor)}`).join(' ')}
              />
            ))}
            {s.puntos.map((p, i) => (
              <circle
                key={p.periodo}
                className="punto"
                cx={x(mesAbsoluto(p.periodo))}
                cy={y(p.valor)}
                r={foco?.producto === s.producto && foco.indice === i ? 5 : 3}
                tabIndex={0}
                aria-label={`${s.producto}, ${periodoLegible(p.periodo)}: ${pesos.format(p.valor)}`}
                onMouseEnter={() => setFoco({ producto: s.producto, indice: i })}
                onFocus={() => setFoco({ producto: s.producto, indice: i })}
                onBlur={() => setFoco(null)}
              />
            ))}
          </g>
        ))}
      </svg>
      <figcaption aria-live="polite" className="tooltip">
        {enFoco && foco ? `${foco.producto} · ${periodoLegible(enFoco.periodo)} · ${pesos.format(enFoco.valor)}` : ' '}
      </figcaption>
    </figure>
  )
}
