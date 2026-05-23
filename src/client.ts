// Scriptable 同步脚本。首次手动导入，之后运行它同步 dist/widgets 中的脚本。
export {}

interface SyncManifest {
  updatedAt: string
  scripts: ScriptEntry[]
  assets: string[]
}

interface ScriptEntry {
  name: string
  path: string
}

const server = 'http://192.168.50.35:8787'
const fm = FileManager.iCloud()
const baseDir = fm.documentsDirectory()

try {
  await main()
}
catch (error) {
  await showError(error)
}

Script.complete()

async function main(): Promise<void> {
  const manifest = await loadManifest()
  const updatedScripts: string[] = []
  const updatedAssets: string[] = []
  const failedFiles: string[] = []

  if (manifest.scripts.length === 0) {
    await showNoWidgetsFound()
    return
  }

  for (const script of manifest.scripts) {
    try {
      const source = fileUrl(script.path)
      const content = await loadText(source)
      const target = fm.joinPath(baseDir, script.name)

      fm.writeString(target, content)
      updatedScripts.push(script.name)
    }
    catch (error) {
      failedFiles.push(formatFailedFile(script.name, error))
    }
  }

  for (const file of manifest.assets) {
    try {
      const source = fileUrl(file)
      const image = await loadImage(source)
      const target = fm.joinPath(baseDir, file)

      ensureParentDirectory(file)
      fm.writeImage(target, image)
      updatedAssets.push(file)
    }
    catch (error) {
      failedFiles.push(formatFailedFile(file, error))
    }
  }

  await showResult(updatedScripts, failedFiles)
}

async function loadManifest(): Promise<SyncManifest> {
  try {
    const manifest = await loadJson<SyncManifest>(`${server}/manifest.json`)
    assertManifest(manifest)
    return manifest
  }
  catch (error) {
    throw new Error([
      '无法连接同步服务。',
      '',
      `当前地址：${server}`,
      '',
      '请确认：',
      '1. 电脑已运行 pnpm serve',
      '2. 手机和电脑在同一 Wi-Fi',
      '3. SERVER 地址是电脑当前局域网 IP',
      '4. 防火墙没有拦截 8787 端口',
      '',
      error instanceof Error ? `原始错误：${error.message}` : String(error),
    ].join('\n'))
  }
}

function fileUrl(file: string): string {
  return `${server}/files/${encodeURIComponent(file)}?t=${Date.now()}`
}

function ensureParentDirectory(file: string): void {
  const parts = file.split('/')
  if (parts.length <= 1)
    return

  parts.pop()
  let current = baseDir

  for (const part of parts) {
    current = fm.joinPath(current, part)
    if (fm.fileExists(current))
      continue

    createDirectory(current)
  }
}

function createDirectory(path: string): void {
  try {
    fm.createDirectory(path, true)
  }
  catch {
    fm.createDirectory(path)
  }
}

async function showResult(components: string[], failed: string[]): Promise<void> {
  const ok = failed.length === 0
  const message = [
    `已同步 ${components.length} 个组件`,
    ...formatFiles(components),
    failed.length > 0 ? '' : undefined,
    failed.length > 0 ? `失败 ${failed.length} 个` : undefined,
    failed.length > 0 ? '请查看括号内的具体原因。' : undefined,
    ...formatFiles(failed),
  ].filter(Boolean).join('\n')

  console.log(message)

  if (config.runsInApp) {
    const alert = new Alert()
    alert.title = ok ? '同步完成' : '同步完成，但有文件失败'
    alert.message = message || '没有可同步文件'
    alert.addAction('好')
    await alert.present()
  }
}

async function showNoWidgetsFound(): Promise<void> {
  const message = [
    '暂未发现任何组件。',
    '',
    '请在电脑端创建 widgets/<name>/index.ts，',
    '然后运行 pnpm build 或 pnpm serve。',
  ].join('\n')

  console.warn(message)

  if (config.runsInApp) {
    const alert = new Alert()
    alert.title = '没有可同步组件'
    alert.message = message
    alert.addAction('好')
    await alert.present()
  }
}

async function showError(error: unknown): Promise<void> {
  const message = error instanceof Error ? error.message : String(error)

  console.error(message)

  if (config.runsInApp) {
    const alert = new Alert()
    alert.title = '同步失败'
    alert.message = message
    alert.addAction('好')
    await alert.present()
  }
}

function formatFiles(files: string[]): string[] {
  if (files.length === 0)
    return []

  return files.map(file => `- ${file}`)
}

function formatFailedFile(file: string, error: unknown): string {
  const reason = error instanceof Error ? error.message : String(error)
  return `${file} (${reason})`
}

function assertManifest(value: SyncManifest): void {
  if (!value || !Array.isArray(value.scripts) || !Array.isArray(value.assets)) {
    throw new Error('同步服务返回的数据格式不正确。')
  }

  for (const script of value.scripts) {
    if (!script || typeof script.name !== 'string' || typeof script.path !== 'string') {
      throw new Error('同步服务返回的脚本数据格式不正确。')
    }
  }
}

async function loadJson<T>(url: string): Promise<T> {
  const request = createRequest(url)
  request.headers = {
    'Cache-Control': 'no-cache',
  }
  return await request.loadJSON() as T
}

async function loadText(url: string): Promise<string> {
  const request = createRequest(url)
  request.headers = {
    'Cache-Control': 'no-cache',
  }
  return await request.loadString()
}

async function loadImage(url: string): Promise<ScriptableImage> {
  const request = createRequest(url)
  request.headers = {
    'Cache-Control': 'no-cache',
  }
  return await request.loadImage()
}

function createRequest(url: string): ScriptableRequest {
  const RequestConstructor = Request as unknown as new (url: string) => ScriptableRequest
  return new RequestConstructor(url)
}
