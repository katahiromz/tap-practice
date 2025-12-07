import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 【重要】本番環境でのデプロイ先サブディレクトリを指定
  // 例: アプリケーションが example.com/tap-practice/ にデプロイされる場合
  base: '/tap-practice/',

  plugins: [react()],
})
