import { defineConfig } from 'tsup';

export default defineConfig(({ watch }) => ({
  entry: ['./src/index.ts', './src/bin.ts'],
  format: ['cjs', 'esm'],
  outDir: './out',
  dts: true,
  clean: !watch,
  minify: !watch,
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.mjs' };
  },
  onSuccess: `pnpm -s update-readme`,
}));
