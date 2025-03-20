import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/fragen-katalog/",  // ✅ This must match your GitHub Pages repo name
  plugins: [react()],
});
