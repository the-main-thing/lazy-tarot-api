import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
	publicDir: path.resolve(__dirname, 'src', 'translationsAdminFront', 'public'),
  build: {
    outDir: path.resolve(__dirname, 'public'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src', 'translationsAdminFront'),
    },
  },
})
