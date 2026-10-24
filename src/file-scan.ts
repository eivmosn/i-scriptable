import type { Dirent } from 'node:fs'
import type { FileEntry, Manifest, ScriptEntry, WidgetMeta } from './types'
import fs from 'node:fs/promises'
import path from 'node:path'
import { config } from './config'

export async function createManifest(): Promise<Manifest> {
  const scriptPaths = await listRecursiveNames(config.paths.builtWidgets, config.files.scriptExtensions)

  return {
    updatedAt: new Date().toISOString(),
    scripts: await Promise.all(scriptPaths.map(toScriptEntry)),
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

async function toScriptEntry(scriptPath: string): Promise<ScriptEntry> {
  const dir = path.posix.dirname(scriptPath)
  const widgetDir = path.posix.basename(dir === '.' ? scriptPath : dir)
  const meta = await readWidgetMeta(widgetDir)

  return {
    name: `${widgetDir}.js`,
    alias: meta.alias?.trim() || widgetDir,
    description: meta.description?.trim() || undefined,
    path: scriptPath,
  }
}

async function readWidgetMeta(widgetDir: string): Promise<WidgetMeta> {
  const metaPath = path.join(config.paths.sourceWidgets, widgetDir, 'meta.json')

  try {
    const value: unknown = JSON.parse(await fs.readFile(metaPath, 'utf8'))
    if (!isRecord(value))
      return {}

    return {
      alias: typeof value.alias === 'string' ? value.alias : undefined,
      description: typeof value.description === 'string' ? value.description : undefined,
    }
  }
  catch {
    return {}
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
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
