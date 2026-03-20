import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { configDefaults } from 'vitest/config'

export default defineConfig({
    base: './',
    plugins: [
        react(),
    ],
    server: {
        port: 5173
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.js'],
        exclude: [
            ...configDefaults.exclude,
            '**/tests/e2e/**',
            '**/*.spec.js',
            '**/node_modules/**',
        ],
    },
})