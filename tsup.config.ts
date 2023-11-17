import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/index.ts', './src/bin.ts'],
  format: ['cjs', 'esm'],
  outDir: './out',
  dts: true,
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.mjs' };
  },
});
