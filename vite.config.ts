import {defineConfig as defineViteConfig, mergeConfig} from 'vite'; // Функции для настройки Vite. mergeConfig для объединения конфигураций Vite и Vitest.
import {defineConfig as defineVitestConfig} from 'vitest/config'; // Функция для настройки Vitest
import react from '@vitejs/plugin-react'; // Плагин для поддержки React
import path from 'path'; // Модуль для работы с путями
import svgr from 'vite-plugin-svgr'; // Плагин для импорта SVG как React-компонентов

// Конфигурация Vite
const viteConfig = defineViteConfig({
  // Настройка алиасов для путей
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/app'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@pages': path.resolve(__dirname, './src/pages'),
    },
  },
  // Подключаем плагины
  plugins: [
    react(), // Плагин для поддержки React
    svgr({include: '**/*.svg?react'}), // Плагин для импорта SVG как React-компонентов
  ],
  // Настройка CSS/SCSS
  css: {
    preprocessorOptions: {
      scss: {
        // Добавляем глобальные SCSS-переменные в каждый SCSS-файл
        additionalData: `@use "@app/styles/_variables.scss" as *;`,
      },
    },
  },
});

// Конфигурация Vitest
const vitestConfig = defineVitestConfig({
  test: {
    environment: 'jsdom', // Используем jsdom для тестирования веб-приложений
    globals: true, // Включаем глобальные переменные Vitest (describe, it, expect)
    setupFiles: './setupTests.ts', // Файл для настройки тестового окружения
    watch: false, // Отключаем watch-режим (тесты не будут перезапускаться автоматически)
    css: {
      modules: {
        classNameStrategy: 'non-scoped', // Отключаем хэши в именах классов CSS-модулей
      },
    },
  },
});

// Объединяем конфигурации Vite и Vitest
export default mergeConfig(viteConfig, vitestConfig);
