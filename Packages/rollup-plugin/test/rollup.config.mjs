import directives from '../dist/index.js';

export default {
    input: "test/src/index.js",
    output: {
        format: "esm",
        file: "test/dist/index.js",
    },
    plugins: [
        directives({ defines: [ ], log: true })
    ]
}