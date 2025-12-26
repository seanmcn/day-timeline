import * as esbuild from 'esbuild';
import { readdirSync } from 'fs';
import { join } from 'path';

const isWatch = process.argv.includes('--watch');

// Find all handler files
const handlersDir = join(process.cwd(), 'src', 'handlers');
let entryPoints = [];

try {
  entryPoints = readdirSync(handlersDir)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => join(handlersDir, f));
} catch {
  console.log('No handlers directory found yet');
}

if (entryPoints.length === 0) {
  console.log('No handler files found');
  process.exit(0);
}

const buildOptions = {
  entryPoints,
  bundle: true,
  minify: !isWatch,
  sourcemap: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outdir: 'dist',
  outExtension: { '.js': '.mjs' },
  external: ['@aws-sdk/*'],
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(buildOptions);
  console.log('Build complete');
}
