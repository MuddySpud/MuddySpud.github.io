import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import path from 'path';
import fs from 'fs';

// Custom middleware to serve 'docs' folder during development
const DocsMiddleware = {
    name: 'docs-middleware',
    configureServer(server) {
        server.middlewares.use((req, res, next) => {
            if (req.url.startsWith('/docs/')) {
                const filePath = path.resolve(__dirname, '..', req.url.slice(1));
                console.log('Requested URL:', req.url); // Debug
                console.log('Resolved Path:', filePath); // Debug
                if (fs.existsSync(filePath)) {
                    const ext = path.extname(filePath);
                    res.setHeader('Content-Type', ext === '.html' ? 'text/html' : 'text/plain');
                    fs.createReadStream(filePath).pipe(res);
                } else {
                    console.log('File not found:', filePath); // Debug
                    res.statusCode = 404;
                    res.end('File not found');
                }
            } else {
                next();
            }
        });
    },
};

// https://vitejs.dev/config/
export default defineConfig({
    root: './root',
    build: {
        sourcemap: 'inline',
        emptyOutDir: true,
        outDir: '../build',
        minify: false,
        rollupOptions: {
            output: {
                entryFileNames: `[name].[hash].js`,
                chunkFileNames: `[name].[hash].js`,
                assetFileNames: `[name].[hash].[ext]`,
            },
        },
    },
    server: {
        port: 1216,
        strictPort: true,
        https: true,
    },
    plugins: [
        mkcert(),
        // visualizer(),
        DocsMiddleware,
    ],
    css: {
        preprocessorOptions: {
            scss: {
                charset: false,
            },
        },
    },
});