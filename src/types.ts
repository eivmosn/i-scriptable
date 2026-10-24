export interface Manifest {
  updatedAt: string
  scripts: ScriptEntry[]
  assets: string[]
}

export interface FileEntry {
  name: string
  path: string
  kind: 'script' | 'asset'
}

export interface ScriptEntry {
  name: string
  alias: string
  description?: string
  path: string
}

export interface WidgetMeta {
  alias?: string
  description?: string
}
