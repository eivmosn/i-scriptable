import type { Dirent } from 'node:fs'
import type { FileEntry, Manifest, ScriptEntry } from './types'
import fs from 'node:fs/promises'
import path from 'node:path'
import { config } from './config'

export async function createManifest(): Promise<Manifest> {
  const scriptPaths = await listRecursiveNames(config.paths.builtWidgets, config.files.scriptExtensions)

  return {
    updatedAt: new Date().toISOString(),
    scripts: scriptPaths.map(toScriptEntry),
    assets: await listRecursiveNames(config.paths.builtWidgets, config.files.assetExtensions),
  }
}

export async function resolveSyncFile(name: string): Promise<FileEntry | undefined> {
  const manifest = await createManifest()

  const script = manifest.scripts.find(script => script.name === name || script.path === name)

  if (script) {
    return {
      name: script.path,
      kind: 'script',
      path: resolveInside(config.paths.builtWidgets, script.path),
    }
  }

  if (manifest.assets.includes(name)) {
    return {
      name,
      kind: 'asset',
      path: resolveInside(config.paths.builtWidgets, name),
    }
  }

  return undefined
}

function toScriptEntry(scriptPath: string): ScriptEntry {
  const dir = path.posix.dirname(scriptPath)
  const base = path.posix.basename(dir === '.' ? scriptPath : dir)

  return {
    name: `${base}.js`,
    path: scriptPath,
  }
}

async function listRecursiveNames(dir: string, extensions: Set<string>): Promise<string[]> {
  const result: string[] = []

  await walk(dir, '', extensions, result)

  return result.sort((a, b) => a.localeCompare(b))
}

async function walk(dir: string, prefix: string, extensions: Set<string>, result: string[]): Promise<void> {
  let entries: Dirent<string>[]

  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  }
  catch (error) {
    if (isNotFound(error))
      return
    throw error
  }

  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      await walk(fullPath, relative, extensions, result)
      continue
    }

    if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) {
      result.push(relative)
    }
  }
}

function resolveInside(root: string, relativePath: string): string {
  const resolved = path.resolve(root, relativePath)
  const normalizedRoot = path.resolve(root)

  if (!resolved.startsWith(normalizedRoot)) {
    throw new Error(`Invalid path: ${relativePath}`)
  }

  return resolved
}

function isNotFound(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT'
}
