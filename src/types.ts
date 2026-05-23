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
  path: string
}
