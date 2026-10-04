import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const tursoUrl =
    env.VITE_TURSO_DATABASE_URL ||
    env.TURSO_DATABASE_URL ||
    env.TURSO_DB_URL ||
    env.LIBSQL_URL ||
    process.env.VITE_TURSO_DATABASE_URL ||
    process.env.TURSO_DATABASE_URL ||
    process.env.TURSO_DB_URL ||
    process.env.LIBSQL_URL ||
    '';

  const tursoToken =
    env.VITE_TURSO_AUTH_TOKEN ||
    env.TURSO_AUTH_TOKEN ||
    env.TURSO_DB_AUTH_TOKEN ||
    env.LIBSQL_AUTH_TOKEN ||
    process.env.VITE_TURSO_AUTH_TOKEN ||
    process.env.TURSO_AUTH_TOKEN ||
    process.env.TURSO_DB_AUTH_TOKEN ||
    process.env.LIBSQL_AUTH_TOKEN ||
    '';

  return {
    plugins: [react()],
    base: './',
    define: {
      'import.meta.env.VITE_TURSO_DATABASE_URL': JSON.stringify(tursoUrl),
      'import.meta.env.VITE_TURSO_AUTH_TOKEN': JSON.stringify(tursoToken),
    },
    server: {
      port: 3000,
      open: false,
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-charts': ['recharts'],
            'vendor-xlsx': ['xlsx'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
  };
});

