import { defineConfig } from "rollup";
import { aliucordPlugin } from "rollup-plugin-aliucord";

export default defineConfig({
    input: `${process.env.plugin}/index.ts`,
    output: {
        file: `dist/${process.env.plugin}.js`
    },
    plugins: [
        aliucordPlugin({
            autoDeploy: !!process.env.ROLLUP_WATCH,
            hermesPath: "node_modules/.pnpm/hermes-engine@0.11.0/node_modules/hermes-engine"
        })
    ]
});
