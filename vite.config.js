import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        minify: 'terser',
        terserOptions: {
            mangle: false, // Prevent renaming of variables
            compress: {
                defaults: false, // Disable most default compress options that might lead to obfuscation
                drop_console: true, // Optional: removes console statements
                drop_debugger: true, // Optional: removes debugger statements
            },
            format: {
                beautify: false, // Keeps the code compact without adding extra whitespace
                comments: false, // Removes comments
            },
        },
    },
});
