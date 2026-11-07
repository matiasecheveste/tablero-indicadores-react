/*
 * Tablero de indicadores — Matías Nicolás Echeveste Cardozo
 * Funciones puras sobre series mensuales: filtrado, indicadores y escalas para el gráfico.
 */

export interface Punto {
  periodo: string // AAAA-MM
  valor: number
}

export interface Serie {
  producto: string
  unidad: string
  puntos: Punto[]
}

export interface Indicadores {
  ultimo: Punto
  minimo: Punto
  maximo: Punto
  /** Variación respecto del dato disponible más cercano a 12 meses antes (null si no hay). */
  interanual: number | null
  promedio: number
}

/** Convierte AAAA-MM en un número de mes absoluto para medir distancias entre períodos. */
export function mesAbsoluto(periodo: string): number {
  const [a, m] = periodo.split('-').map(Number)
  return a! * 12 + (m! - 1)
}

export function filtrarPorRango(puntos: Punto[], desde: string, hasta: string): Punto[] {
  return puntos.filter((p) => p.periodo >= desde && p.periodo <= hasta)
}

export function indicadores(puntos: Punto[]): Indicadores | null {
  if (puntos.length === 0) return null
  const ordenados = [...puntos].sort((a, b) => a.periodo.localeCompare(b.periodo))
  const ultimo = ordenados.at(-1)!
  const objetivo = mesAbsoluto(ultimo.periodo) - 12
  const candidatos = ordenados.filter((p) => Math.abs(mesAbsoluto(p.periodo) - objetivo) <= 2)
  const base = candidatos.sort(
    (a, b) => Math.abs(mesAbsoluto(a.periodo) - objetivo) - Math.abs(mesAbsoluto(b.periodo) - objetivo),
  )[0]
  return {
    ultimo,
    minimo: ordenados.reduce((m, p) => (p.valor < m.valor ? p : m)),
    maximo: ordenados.reduce((m, p) => (p.valor > m.valor ? p : m)),
    interanual: base ? redondear((ultimo.valor / base.valor - 1) * 100, 1) : null,
    promedio: redondear(ordenados.reduce((s, p) => s + p.valor, 0) / ordenados.length, 2),
  }
}

export function redondear(valor: number, decimales: number): number {
  const f = 10 ** decimales
  return Math.round(valor * f) / f
}

/** Escala lineal del dominio [d0, d1] al rango [r0, r1]. */
export function escala(d0: number, d1: number, r0: number, r1: number) {
  const ancho = d1 - d0 || 1
  return (x: number) => r0 + ((x - d0) / ancho) * (r1 - r0)
}

/** Marcas «redondas» para el eje vertical (1, 2 o 5 × 10^n). */
export function marcas(min: number, max: number, cantidad = 5): number[] {
  if (min === max) return [min]
  const paso0 = (max - min) / cantidad
  const potencia = 10 ** Math.floor(Math.log10(paso0))
  const paso = [1, 2, 5, 10].map((k) => k * potencia).find((p) => p >= paso0)!
  const inicio = Math.ceil(min / paso) * paso
  const resultado: number[] = []
  for (let v = inicio; v <= max + 1e-9; v += paso) resultado.push(redondear(v, 6))
  return resultado
}

/** Divide una serie en tramos continuos: un hueco de más de `maximoHueco` meses corta la línea. */
export function tramos(puntos: Punto[], maximoHueco = 3): Punto[][] {
  const resultado: Punto[][] = []
  for (const p of puntos) {
    const actual = resultado.at(-1)
    const previo = actual?.at(-1)
    if (actual && previo && mesAbsoluto(p.periodo) - mesAbsoluto(previo.periodo) <= maximoHueco) actual.push(p)
    else resultado.push([p])
  }
  return resultado
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic']

export function periodoLegible(periodo: string): string {
  const [a, m] = periodo.split('-')
  return `${MESES[Number(m) - 1]} ${a}`
}

export const pesos = new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', minimumFractionDigits: 2 })
