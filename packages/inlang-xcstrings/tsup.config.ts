import { defineConfig } from 'tsup';

export default defineConfig(({ watch }) => ({
  entry: ['./src/index.ts'],
  format: ['cjs', 'esm'],
  outDir: './out',
  dts: true,
  clean: !watch,
  minify: !watch,
}));
