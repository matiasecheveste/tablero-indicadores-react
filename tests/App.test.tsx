/*
 * Tablero de indicadores — Matías Nicolás Echeveste Cardozo
 */
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../src/App'

describe('Tablero', () => {
  it('muestra tarjetas de los productos elegidos por defecto', () => {
    render(<App />)
    const tarjetas = within(screen.getByRole('region', { name: 'Indicadores' })).getAllByRole('heading', { level: 2 })
    expect(tarjetas.map((t) => t.textContent)).toEqual(['SUPER 95 30-S', 'GASOIL 50-S'])
    expect(screen.getByRole('img', { name: /Evolución mensual/ })).toBeInTheDocument()
  })

  it('agrega y quita productos y advierte unidades mezcladas', async () => {
    const usuario = userEvent.setup()
    render(<App />)
    await usuario.click(screen.getByRole('checkbox', { name: 'SUPERGAS' }))
    expect(screen.getByRole('note')).toHaveTextContent('unidades distintas')
    await usuario.click(screen.getByRole('checkbox', { name: 'SUPERGAS' }))
    expect(screen.queryByRole('note')).not.toBeInTheDocument()
  })

  it('cambia a la vista de tabla y filtra por período', async () => {
    const usuario = userEvent.setup()
    render(<App />)
    await usuario.click(screen.getByRole('tab', { name: 'Tabla' }))
    const total = screen.getAllByRole('row').length
    await usuario.selectOptions(screen.getByRole('combobox', { name: 'Desde' }), '2026-01')
    expect(screen.getAllByRole('row').length).toBeLessThan(total)
    for (const fila of screen.getAllByRole('row').slice(1)) {
      expect(fila.textContent).toMatch(/2026/)
    }
  })

  it('muestra el valor del punto enfocado con el teclado', async () => {
    const usuario = userEvent.setup()
    render(<App />)
    const punto = screen.getAllByRole('img')[0]!.querySelector('circle')!
    punto.focus()
    await usuario.keyboard('{Tab}')
    expect(screen.getByText(/SUPER 95 30-S · \w{3} \d{4} · \$/)).toBeInTheDocument()
  })
})
