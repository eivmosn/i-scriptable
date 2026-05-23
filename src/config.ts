import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(fileURLToPath(import.meta.url), '../..')

export const config = {
  name: 'iScriptable',
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT || 8787),
  },
  paths: {
    root: rootDir,
    sourceWidgets: path.join(rootDir, 'widgets'),
    builtWidgets: path.join(rootDir, 'dist', 'widgets'),
  },
  files: {
    scriptExtensions: new Set(['.js']),
    assetExtensions: new Set(['.png', '.jpg', '.jpeg', '.webp']),
  },
} as const
