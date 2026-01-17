import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // no need to import describe, it, expect in every test
    environment: 'node', // use node environment (not browser)
  },
});
