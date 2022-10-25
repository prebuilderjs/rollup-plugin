
export default [
    {
        input: "src/index.js",
        output: {
            format: "cjs",
            strict: false,
            name: "process",
            file: "dist/index.cjs.js",
        }
    },
    {
        input: "src/index.js",
        output: {
            format: "esm",
            file: "dist/index.esm.js",
        }
    }
]