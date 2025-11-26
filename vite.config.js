// https://stackoverflow.com/questions/69417788/vite-https-on-localhost

import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({

    root: './root',

    build: {
        sourcemap: 'inline',
        emptyOutDir: true,
        outDir: "../build",
        minify: false,
        rollupOptions: {
            output: {
                entryFileNames: `[name].[hash].js`,
                chunkFileNames: `[name].[hash].js`,
                assetFileNames: `[name].[hash].[ext]`,
                manualChunks(id) {
                    if (id.includes('src2/stepHook')) {
                        return 'stepHook';
                    }
                    if (id.includes('src/index')) {
                        return 'guide';
                    }
                }
            },
        },
    },

    server: {
        port: 1226,
        strictPort: true,
        https: {
            key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
            cert: fs.readFileSync(path.resolve(__dirname, 'localhost.pem'))
        }
    },

    plugins: [
        // visualizer(),
        viteStaticCopy({
            targets: [
                {
                    src: 'src/modules/components/fragments/scss/fragments.scss',
                    dest: '../build'
                }
            ]
        })
    ],

    css: {
        preprocessorOptions: {
            scss: {
                charset: false,
            }
        }
    }
});