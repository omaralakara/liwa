import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Connect, type Plugin } from 'vite'

// Two real pages, no router: a static host serves /packages/ as a folder and redirects /packages
// to it on its own. The dev and preview servers need telling.
const packagesSlash = (): Plugin => {
  const redirect: Connect.NextHandleFunction = (req, res, next) => {
    const [path, query] = (req.url ?? '').split('?')
    if (path !== '/packages') return next()
    res.statusCode = 301
    res.setHeader('Location', `/packages/${query ? `?${query}` : ''}`)
    res.end()
  }
  return {
    name: 'liwa-packages-slash',
    configureServer: (server) => void server.middlewares.use(redirect),
    configurePreviewServer: (server) => void server.middlewares.use(redirect),
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), packagesSlash()],
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        packages: resolve(import.meta.dirname, 'packages/index.html'),
      },
    },
  },
})
