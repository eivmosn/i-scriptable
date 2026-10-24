import type { UserConfig } from 'tsdown'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'tsdown'

const distDir = path.resolve('dist')
console.log(`[build] 清空 ${distDir}`)
fs.rmSync(distDir, { force: true, recursive: true })

const jsOutput = {
  fixedExtension: false,
  hash: false,
  outExtensions: () => ({ js: '.js' }),
} satisfies Partial<UserConfig>

const widgetEntries = Object.fromEntries(
  fs.readdirSync('widgets', { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .filter(entry => fs.existsSync(path.join('widgets', entry.name, 'index.ts')))
    .map(entry => [`${entry.name}/index`, path.join('widgets', entry.name, 'index.ts')]),
)

if (Object.keys(widgetEntries).length === 0) {
  console.warn('[widgets] 暂未发现任何组件：请在 widgets/<name>/index.ts 新建组件。')
}

const configs: UserConfig[] = [
  {
    ...jsOutput,
    entry: {
      server: 'src/server.ts',
    },
    outDir: 'dist',
    platform: 'node',
    format: ['esm'],
    target: 'node24',
    clean: false,
    dts: false,
  },
  {
    ...jsOutput,
    entry: {
      'copy-assets': 'src/copy-assets.ts',
    },
    outDir: 'dist',
    platform: 'node',
    format: ['esm'],
    target: 'node24',
    clean: false,
    dts: false,
  },
  {
    ...jsOutput,
    entry: {
      sync: 'src/sync.ts',
    },
    outDir: 'dist',
    platform: 'browser',
    format: ['esm'],
    target: 'es2022',
    clean: false,
    dts: false,
    minify: false,
  },
]

if (Object.keys(widgetEntries).length > 0) {
  configs.push({
    ...jsOutput,
    entry: widgetEntries,
    outDir: 'dist/widgets',
    platform: 'browser',
    format: ['esm'],
    target: 'es2022',
    clean: false,
    dts: false,
    minify: false,
  })
}

export default defineConfig(configs)
