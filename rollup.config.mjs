import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: "src/index.js",
    output: {
        format: "cjs",
        strict: false,
        file: "dist/index.js",
    },
    plugins:[nodeResolve(), commonjs()]
}