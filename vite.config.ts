import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // 開発サーバー設定
  server: {
    port: 8080,
    open: true,
    host: true
  },

  // ビルド設定
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'tutorial-01': resolve(__dirname, 'examples/01-basic-scene-ts.html'),
        'tutorial-02': resolve(__dirname, 'examples/02-typed-geometries.html'),
        'tutorial-03': resolve(__dirname, 'examples/03-class-based-scene.html'),
        'tutorial-04': resolve(__dirname, 'examples/04-advanced-types.html')
      }
    }
  },

  // パス解決設定
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/examples': resolve(__dirname, 'examples'),
      '@/types': resolve(__dirname, 'types')
    }
  },

  // 最適化設定
  optimizeDeps: {
    include: ['three']
  },

  // 型チェック（開発時）
  esbuild: {
    target: 'es2022'
  }
});