import { nodeResolve } from '@rollup/plugin-node-resolve';


export default {
    input: "src/index.js",
    output: {
        format: "cjs",
        strict: false,
        file: "dist/index.js",
    },
    plugins:[nodeResolve()]
}