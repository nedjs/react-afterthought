const esbuild = require('esbuild');

const isDev = false;
const minify = !isDev;

esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    sourcemap: true,
    treeShaking: true,
    minify: minify,
    outfile: 'dist/cjs/index.js',
    external: ['react'],
    format: 'cjs',
    platform: 'node',
    target: ['es2019'],
    define: { __DEV__: isDev },
}).catch((e) => {
    throw e;
    process.exit(1)
})

esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    sourcemap: true,
    treeShaking: true,
    minify: minify,
    outfile: 'dist/esm/index.js',
    external: ['react'],
    format: 'esm',
    platform: 'node',
    target: ['es2019'],
    define: { __DEV__: isDev },
}).catch((e) => {
    throw e;
    process.exit(1)
})
