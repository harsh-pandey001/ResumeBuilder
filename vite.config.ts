import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Port 5173 (Vite default) keeps it clear of CareerNext's web (3000) and api (4000)
// when both run locally during the integration work.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
