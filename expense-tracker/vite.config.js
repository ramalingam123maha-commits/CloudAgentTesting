// Vite build configuration for the Expense Tracker React app
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Enable JSX fast-refresh and React support via the official Vite plugin
  plugins: [react()],
})
