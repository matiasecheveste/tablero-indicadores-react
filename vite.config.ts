/*
 * Tablero de indicadores — Matías Nicolás Echeveste Cardozo
 */
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/preparacion.ts'],
  },
})
