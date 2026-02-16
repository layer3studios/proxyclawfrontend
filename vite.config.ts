import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// @ts-ignore
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    inspectAttr()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})