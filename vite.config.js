import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                popup: resolve(__dirname, "popup.html"),
                options: resolve(__dirname, "options.html"),
                background: resolve(__dirname, "src/background/index.ts"),
                content: resolve(__dirname, "src/content/index.ts"),
            },
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: "assets/[name].[ext]",
            },
        },
        outDir: "dist",
    },
});
