// @env node
import type { Dirent } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { config } from './config'

await copyAssets()

async function copyAssets(): Promise<void> {
  await fs.mkdir(config.paths.builtWidgets, { recursive: true })
  await copyDirectory(config.paths.sourceWidgets, config.paths.builtWidgets)
}

async function copyDirectory(source: string, target: string): Promise<void> {
  let entries: Dirent<string>[]

  try {
    entries = await fs.readdir(source, { withFileTypes: true })
  }
  catch (error) {
    if (isNotFound(error))
      return
    throw error
  }

  await fs.mkdir(target, { recursive: true })

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name)
    const targetPath = path.join(target, entry.name)

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath)
      continue
    }

    if (entry.isFile() && config.files.assetExtensions.has(path.extname(entry.name).toLowerCase())) {
      await fs.copyFile(sourcePath, targetPath)
    }
  }
}

function isNotFound(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT'
}
