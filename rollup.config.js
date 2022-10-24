module.exports = {
    input: 'dist/esm/index.js',
    treeshake: true,
    output: {
        file: 'dist/umd/index.js',
        format: 'umd',
        compact: true,
        sourcemap: true,
        name: 'Afterthought',
        globals: {
            react: 'React',
        },
    },
    external: ['react'],
    plugins: [],
}
