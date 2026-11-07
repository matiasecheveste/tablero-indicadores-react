/*
 * Tablero de indicadores — Matías Nicolás Echeveste Cardozo
 */
import { describe, expect, it } from 'vitest'
import { escala, filtrarPorRango, indicadores, marcas, periodoLegible, tramos } from '../src/lib/series'

const puntos = [
  { periodo: '2024-01', valor: 70 },
  { periodo: '2024-06', valor: 80 },
  { periodo: '2024-07', valor: 75 },
  { periodo: '2025-01', valor: 77 },
]

describe('indicadores', () => {
  it('calcula último, extremos, promedio e interanual', () => {
    const ind = indicadores(puntos)!
    expect(ind.ultimo.periodo).toBe('2025-01')
    expect(ind.minimo.valor).toBe(70)
    expect(ind.maximo.valor).toBe(80)
    expect(ind.promedio).toBe(75.5)
    expect(ind.interanual).toBe(10)
  })
  it('no inventa la variación interanual si no hay dato cercano', () => {
    expect(indicadores(puntos.slice(1))!.interanual).toBeNull()
    expect(indicadores([])).toBeNull()
  })
})

describe('utilidades', () => {
  it('filtra por rango de períodos', () => {
    expect(filtrarPorRango(puntos, '2024-06', '2024-12').map((p) => p.periodo)).toEqual(['2024-06', '2024-07'])
  })
  it('corta la línea en huecos largos', () => {
    expect(tramos(puntos).map((t) => t.length)).toEqual([1, 2, 1])
  })
  it('genera marcas redondas y escalas lineales', () => {
    expect(marcas(68, 93)).toEqual([70, 75, 80, 85, 90])
    expect(escala(0, 10, 100, 200)(5)).toBe(150)
  })
  it('formatea períodos en español', () => {
    expect(periodoLegible('2026-09')).toBe('set 2026')
  })
})
