// Scriptable 同步脚本。首次手动导入，之后在 App 内运行它，勾选组件后同步 dist/widgets 中的脚本。
export {}

interface SyncManifest {
  updatedAt: string
  scripts: SyncScript[]
  assets: string[]
}

interface SyncScript {
  name: string
  path: string
  alias?: string
  description?: string
}

type TableAction = { type: 'sync', selected: Set<string> } | { type: 'clear' } | { type: 'cancel' }

const server = 'http://192.168.50.35:8787'
const fm = FileManager.iCloud()
const baseDir = fm.documentsDirectory()
const selectionPath = fm.joinPath(baseDir, 'sync-selection.json')

try {
  await main()
}
catch (error) {
  await showError(error)
}

Script.complete()

async function main(): Promise<void> {
  if (!config.runsInApp)
    throw new Error('sync 脚本需要在 Scriptable 应用内运行，才能显示组件选择列表。')

  const manifest = await loadManifest()

  if (manifest.scripts.length === 0) {
    await showNoWidgetsFound()
    return
  }

  const action = await chooseComponents(manifest)

  if (action.type === 'cancel')
    return

  if (action.type === 'clear') {
    await clearComponents(manifest)
    return
  }

  const selected = action.selected
  if (selected.size === 0) {
    await showMessage('未选择组件', '至少勾选一个组件后，再点「开始同步」。')
    return
  }

  const selectedScripts = manifest.scripts.filter(script => selected.has(script.name))
  const selectedWidgets = new Set(selectedScripts.map(script => topDirectory(script.path)))
  const selectedAssets = manifest.assets.filter(file => selectedWidgets.has(topDirectory(file)))

  const updatedScripts: SyncScript[] = []
  const updatedAssets: string[] = []
  const failedFiles: string[] = []

  for (const script of selectedScripts) {
    try {
      const content = await loadText(fileUrl(script.path))
      fm.writeString(fm.joinPath(baseDir, script.name), content)
      updatedScripts.push(script)
    }
    catch (error) {
      failedFiles.push(formatFailedFile(script.name, error))
    }
  }

  for (const file of selectedAssets) {
    try {
      const image = await loadImage(fileUrl(file))
      ensureParentDirectory(file)
      fm.writeImage(fm.joinPath(baseDir, file), image)
      updatedAssets.push(file)
    }
    catch (error) {
      failedFiles.push(formatFailedFile(file, error))
    }
  }

  saveSelection([...selected])
  await showResult(updatedScripts, updatedAssets, failedFiles)
}

// ========================
// 组件选择列表
// ========================

async function chooseComponents(manifest: SyncManifest): Promise<TableAction> {
  const scripts = manifest.scripts
  const selected = loadSelection(scripts)
  const table = new UITable()
  let syncRequested = false
  let clearRequested = false

  table.showSeparators = true

  const renderRows = (): void => {
    table.removeAllRows()

    const header = new UITableRow()
    header.height = 58
    const headerCell = header.addText('组件同步', `已选 ${selected.size} / ${scripts.length} 个组件`)
    headerCell.titleFont = Font.boldSystemFont(22)
    headerCell.subtitleFont = Font.mediumSystemFont(13)
    table.addRow(header)

    if (scripts.some(script => !script.alias)) {
      const warning = new UITableRow()
      warning.height = 52
      warning.backgroundColor = Color.dynamic(new Color('#FFF4E0'), new Color('#3B2A10'))
      const warningCell = warning.addText('⚠️ 服务端没有返回中文别名', '请重启电脑端 pnpm serve 后再试')
      warningCell.titleFont = Font.mediumSystemFont(14)
      warningCell.subtitleFont = Font.systemFont(12)
      warningCell.titleColor = new Color('#B25000')
      warningCell.subtitleColor = new Color('#B25000')
      table.addRow(warning)
    }

    for (const script of scripts) {
      const isSelected = selected.has(script.name)
      const alias = script.alias || script.name

      const row = new UITableRow()
      row.height = 58
      row.dismissOnSelect = false
      if (isSelected)
        row.backgroundColor = Color.dynamic(new Color('#E7F9EE'), new Color('#123524'))

      const cell = row.addText(
        `${isSelected ? '✅' : '⬜️'}  ${alias}`,
        script.description || `${script.name} · 点击切换勾选`,
      )
      cell.titleFont = Font.semiboldSystemFont(17)
      cell.subtitleFont = Font.regularSystemFont(12)

      row.onSelect = () => {
        if (selected.has(script.name))
          selected.delete(script.name)
        else
          selected.add(script.name)
        renderRows()
      }

      table.addRow(row)
    }

    const batchRow = new UITableRow()
    batchRow.height = 48
    const selectAll = batchRow.addButton('全选')
    selectAll.widthWeight = 0.5
    selectAll.titleFont = Font.semiboldSystemFont(16)
    selectAll.onTap = () => {
      for (const script of scripts)
        selected.add(script.name)
      renderRows()
    }
    const selectNone = batchRow.addButton('全不选')
    selectNone.widthWeight = 0.5
    selectNone.titleFont = Font.semiboldSystemFont(16)
    selectNone.onTap = () => {
      selected.clear()
      renderRows()
    }
    table.addRow(batchRow)

    const clearRow = new UITableRow()
    clearRow.height = 48
    const clearCell = clearRow.addButton('🗑  清空手机里的组件')
    clearCell.titleFont = Font.semiboldSystemFont(16)
    clearCell.titleColor = new Color('#FF3B30')
    clearCell.dismissOnTap = true
    clearCell.onTap = () => {
      clearRequested = true
    }
    table.addRow(clearRow)

    const actionRow = new UITableRow()
    actionRow.height = 52
    const cancel = actionRow.addButton('取消')
    cancel.widthWeight = 0.4
    cancel.titleFont = Font.semiboldSystemFont(16)
    cancel.dismissOnTap = true
    cancel.onTap = () => {}

    const sync = actionRow.addButton(`开始同步${selected.size > 0 ? ` (${selected.size})` : ''}`)
    sync.widthWeight = 0.6
    sync.titleFont = Font.boldSystemFont(17)
    sync.dismissOnTap = true
    sync.onTap = () => {
      syncRequested = true
    }
    table.addRow(actionRow)

    const info = new UITableRow()
    info.height = 44
    const infoCell = info.addText('同步服务', `${server} · ${formatUpdatedAt(manifest.updatedAt)}`)
    infoCell.titleFont = Font.systemFont(12)
    infoCell.subtitleFont = Font.systemFont(11)
    infoCell.titleColor = new Color('#8E8E93')
    infoCell.subtitleColor = new Color('#8E8E93')
    table.addRow(info)

    table.reload()
  }

  renderRows()
  await table.present()

  if (clearRequested)
    return { type: 'clear' }

  if (syncRequested)
    return { type: 'sync', selected }

  return { type: 'cancel' }
}

function loadSelection(scripts: SyncScript[]): Set<string> {
  try {
    if (fm.fileExists(selectionPath)) {
      const parsed: unknown = JSON.parse(fm.readString(selectionPath))
      if (isRecord(parsed) && Array.isArray(parsed.selected)) {
        const known = new Set(scripts.map(script => script.name))
        const stored = parsed.selected.filter((name): name is string => typeof name === 'string' && known.has(name))
        return new Set(stored)
      }
    }
  }
  catch {
    // 读取失败时按未勾选处理
  }

  // 默认不勾选，由用户自己选择
  return new Set()
}

function saveSelection(names: string[]): void {
  try {
    fm.writeString(selectionPath, JSON.stringify({
      selected: names,
      updatedAt: new Date().toISOString(),
    }, null, 2))
  }
  catch (error) {
    console.warn(`保存同步选择失败：${formatError(error)}`)
  }
}

// ========================
// 清空手机上的组件
// ========================

async function clearComponents(manifest: SyncManifest): Promise<void> {
  if (!await confirmClear())
    return

  const removedScripts: SyncScript[] = []
  const removedAssets: string[] = []
  const failedFiles: string[] = []

  for (const script of manifest.scripts) {
    try {
      const target = fm.joinPath(baseDir, script.name)
      if (fm.fileExists(target)) {
        fm.remove(target)
        removedScripts.push(script)
      }
    }
    catch (error) {
      failedFiles.push(formatFailedFile(script.name, error))
    }
  }

  const assetDirectories = new Set<string>()

  for (const file of manifest.assets) {
    assetDirectories.add(topDirectory(file))
    try {
      const target = fm.joinPath(baseDir, file)
      if (fm.fileExists(target)) {
        fm.remove(target)
        removedAssets.push(file)
      }
    }
    catch (error) {
      failedFiles.push(formatFailedFile(file, error))
    }
  }

  // 素材目录清空后再删除空目录，非空目录保留
  for (const dir of assetDirectories) {
    try {
      const target = fm.joinPath(baseDir, dir)
      if (fm.fileExists(target) && fm.listContents(target).length === 0)
        fm.remove(target)
    }
    catch {
      // 目录非空或删除失败时忽略
    }
  }

  const message = [
    `已删除 ${removedScripts.length} 个组件脚本`,
    ...removedScripts.map(script => `- ${script.alias || script.name}（${script.name}）`),
    `已删除 ${removedAssets.length} 个素材`,
    failedFiles.length > 0 ? '' : undefined,
    failedFiles.length > 0 ? `失败 ${failedFiles.length} 个` : undefined,
    ...formatFiles(failedFiles),
    '',
    '电脑端文件不受影响，重新勾选并同步即可恢复。',
  ].filter(Boolean).join('\n')

  await showMessage('清空完成', message)
}

async function confirmClear(): Promise<boolean> {
  const alert = new Alert()
  alert.title = '清空手机上的组件'
  alert.message = '将删除已同步到本机的组件脚本和素材（不影响电脑端文件）。确定清空吗？'
  alert.addAction('取消')
  alert.addDestructiveAction('清空')
  const index = await alert.presentAlert()
  return index === 1
}

// ========================
// 同步服务
// ========================

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

// ========================
// 结果与提示
// ========================

async function showResult(components: SyncScript[], assets: string[], failed: string[]): Promise<void> {
  const ok = failed.length === 0
  const message = [
    `已同步 ${components.length} 个组件`,
    ...components.map(script => `- ${script.alias || script.name}（${script.name}）`),
    assets.length > 0 ? `素材 ${assets.length} 个` : undefined,
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
  await showMessage('没有可同步组件', [
    '暂未发现任何组件。',
    '',
    '请在电脑端创建 widgets/<name>/index.ts，',
    '然后运行 pnpm build 或 pnpm serve。',
  ].join('\n'))
}

async function showError(error: unknown): Promise<void> {
  await showMessage('同步失败', formatError(error))
}

async function showMessage(title: string, message: string): Promise<void> {
  console.log(message)

  if (config.runsInApp) {
    const alert = new Alert()
    alert.title = title
    alert.message = message
    alert.addAction('好')
    await alert.present()
  }
}

// ========================
// 工具函数
// ========================

function topDirectory(file: string): string {
  return file.split('/')[0]
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

function formatUpdatedAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime()))
    return ''

  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

function formatFiles(files: string[]): string[] {
  if (files.length === 0)
    return []

  return files.map(file => `- ${file}`)
}

function formatFailedFile(file: string, error: unknown): string {
  return `${file} (${formatError(error)})`
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// ========================
// 网络
// ========================

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
