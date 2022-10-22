const esbuild = require('esbuild');

const isDev = Boolean(process.argv.find(v => v === '-dev'));
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
}).then(v => {
    console.log('cjs build finished')
}).catch((e) => {
    throw e;
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
}).then(v => {
    console.log('esm build finished')
}).catch((e) => {
    throw e;
})
