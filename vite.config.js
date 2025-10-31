import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import alias from '@rollup/plugin-alias'
import path from 'path'
import optimizer from 'vite-plugin-optimizer'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// import liveReload from 'vite-plugin-live-reload'

export default defineConfig({
	css: {
		preprocessorOptions: {
			scss: {api: 'modern-compiler'},
		},
		// postcss: {
		//     plugins: [
		//         tailwindcss('./tailwind.config.cjs'),
		//         postcssPrefixSelector({
		//             prefix: '#power-checkout-wc-setting-app',
		//             transform(prefix, selector, prefixedSelector, filePath) {
		//                 // 只處理 node_modules/element-plus 的 CSS
		//                 if (filePath && !filePath.includes('/power-checkout/js/src/index.css')) {
		//                     if (selector.startsWith(':root') || selector.startsWith('html') || selector.startsWith('body')) {
		//                         return selector
		//                     }
		//                     return prefixedSelector
		//                 }
		//                 console.log(filePath)
		//                 // 其他 CSS (例如 Tailwind) 不加 prefix
		//                 return selector
		//             }
		//         })
		//     ]
		// }
	},
  build: {
    emptyOutDir: true,
    minify: true,
    outDir: path.resolve(__dirname, 'js/dist'),

    // watch: {
    //   include: ['js/src/**', 'inc/**'],
    //   exclude: 'node_modules/**, .git/**, dist/**, .vscode/**',
    // },

    rollupOptions: {
      input: 'js/src/main.ts', // Optional, defaults to 'src/main.js'.
      output: {
        assetFileNames: 'assets/[ext]/index.[ext]',
        entryFileNames: 'index.js',
      },
    },
  },
  plugins: [
		vue(),
		vueDevTools(),
    alias(),
    tsconfigPaths(),

    // liveReload([
    //   __dirname + '/**/*.php',
    //   __dirname + '/js/dist/**/*',
    //   __dirname + '/js/src/**/*.tsx',
    // ]), // Optional, if you want to reload page on php changed

    optimizer({
      jquery: 'const $ = window.jQuery; export { $ as default }',
    }),
  ],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./js/src', import.meta.url))
		},
	},
})
