import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      'server-only': path.resolve(import.meta.dirname, 'tests/stubs/empty.ts'),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    environment: 'node',
    fileParallelism: false,
    testTimeout: 60000,
    hookTimeout: 60000,
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgres://postgres@localhost:5433/aqua_test',
      PAYMENT_PROVIDER: 'mock',
      ALLOW_MOCK_PAYMENTS: 'true',
      APP_URL: 'http://localhost:3999',
      ENCRYPTION_KEY: 'test-encryption-key-0123456789abcdef',
      DATABASE_POOL_MAX: '30',
    },
  },
});
