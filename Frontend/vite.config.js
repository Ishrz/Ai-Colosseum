import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from './node_modules/@tailwindcss/vite/dist/index.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
