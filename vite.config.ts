import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [vue()],

    // Set home as the root directory
    root: path.resolve(__dirname),

    // Make sure public assets are served correctly
    publicDir: path.resolve(__dirname, 'public'),

    // Use relative paths for assets
    base: './',

    resolve: {
        alias: {
            'renderer': path.resolve(__dirname, './src/renderer'),
            '@': path.resolve(__dirname, './src/renderer'),
            '@assets': fileURLToPath(new URL('./public', import.meta.url))
        }
    },

    build: {
        // Place built files in dist/renderer
        outDir: path.resolve(__dirname, 'build'),
        emptyOutDir: true,      //delete build-directory before building
        sourcemap: true,

        // Make sure the HTML file is included in the build
        rollupOptions: {
            input: path.resolve(__dirname, 'index.html'),
        }
    }
});