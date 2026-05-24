// Scriptable 小组件：节气与假期倒计时
export {}

interface CountdownItem {
  title: string
  date: Date
}

const today = startOfDay(new Date())
const items: CountdownItem[] = [
  { title: '处暑', date: dateOf(2026, 8, 23) },
  { title: '白露', date: dateOf(2026, 9, 7) },
  { title: '秋分', date: dateOf(2026, 9, 23) },
  { title: '国庆节', date: dateOf(2026, 10, 1) },
  { title: '中秋节', date: dateOf(2026, 9, 25) },
]
  .filter(item => item.date >= today)
  .slice(0, 6)

const widget = new ListWidget()
widget.setPadding(17, 20, 15, 20)
widget.spacing = 0
widget.backgroundImage = await loadBackground()
widget.refreshAfterDate = nextMidnight()

const root = widget.addStack()
root.layoutVertically()
root.spacing = 8

items.forEach((item, index) => {
  const row = root.addStack()
  row.layoutHorizontally()
  row.centerAlignContent()
  row.spacing = 0

  const title = row.addText(item.title)
  title.font = Font.heavySystemFont(20)
  title.textColor = index === 0 ? new Color('#20a7ff') : new Color('#fff7ec')
  title.lineLimit = 1
  title.minimumScaleFactor = 0.72

  row.addSpacer()

  addDistance(row, daysUntil(item.date))
})

if (config.runsInWidget) {
  Script.setWidget(widget)
}
else {
  await widget.presentSmall()
}

Script.complete()

async function loadBackground(): Promise<ScriptableImage> {
  const fm = FileManager.iCloud()
  const path = fm.joinPath(fm.documentsDirectory(), 'season-countdown/background.png')

  if (fm.fileExists(path)) {
    await fm.downloadFileFromiCloud(path)
    const image = fm.readImage(path)
    if (image)
      return image
  }

  return makeBackground()
}

function addDistance(row: WidgetStack, days: number): void {
  const parts = distanceParts(days)
  for (const part of parts) {
    const text = row.addText(part.text)
    text.font = part.highlight ? Font.semiboldSystemFont(22) : Font.mediumSystemFont(22)
    text.textColor = part.highlight ? new Color('#20a7ff') : new Color('#fff7ec')
    text.lineLimit = 1
    text.minimumScaleFactor = 0.58
  }
}

function distanceParts(days: number): Array<{ text: string, highlight: boolean }> {
  if (days <= 0) {
    return [{ text: '今天', highlight: true }]
  }
  if (days < 14) {
    return [
      { text: '不到', highlight: false },
      { text: `${days + 1}`, highlight: true },
      { text: '天', highlight: false },
    ]
  }

  const months = Math.floor(days / 30)
  const restDays = days % 30

  if (months <= 0) {
    return [
      { text: '不到', highlight: false },
      { text: '1', highlight: true },
      { text: '月', highlight: false },
    ]
  }

  if (restDays === 0) {
    return [
      { text: `${months}`, highlight: true },
      { text: '月', highlight: false },
    ]
  }

  return [
    { text: `${months}`, highlight: true },
    { text: '月', highlight: false },
    { text: `${restDays}`, highlight: true },
    { text: '天', highlight: false },
  ]
}

function daysUntil(date: Date): number {
  return Math.ceil((startOfDay(date).getTime() - today.getTime()) / 86400000)
}

function dateOf(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day)
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function nextMidnight(): Date {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(0, 5, 0, 0)
  return date
}

function makeBackground(): ScriptableImage {
  const size = new Size(360, 360)
  const ctx = new DrawContext()
  ctx.size = size
  ctx.opaque = false
  ctx.respectScreenScale = true

  const step = 4
  for (let y = 0; y < size.height; y += step) {
    for (let x = 0; x < size.width; x += step) {
      const nx = x / size.width
      const ny = y / size.height
      const blueGlow = Math.max(0, 1 - Math.sqrt((nx - 0.86) ** 2 + (ny - 0.18) ** 2) / 0.92)
      const lowerGlow = Math.max(0, 1 - Math.sqrt((nx - 0.22) ** 2 + (ny - 1.02) ** 2) / 0.88)
      const diagonal = nx * 0.18 + (1 - ny) * 0.1
      const edge = 1 - Math.max(Math.abs(nx - 0.5), Math.abs(ny - 0.5)) * 0.14
      const r = (13 + blueGlow * 6 + lowerGlow * 4 + diagonal * 12) * edge
      const g = (16 + blueGlow * 12 + lowerGlow * 7 + diagonal * 14) * edge
      const b = (22 + blueGlow * 27 + lowerGlow * 18 + diagonal * 18) * edge

      ctx.setFillColor(new Color(rgbToHex(r, g, b)))
      ctx.fillRect(new Rect(x, y, step + 0.5, step + 0.5))
    }
  }

  ctx.setFillColor(new Color('#37a8ff', 0.055))
  ctx.fillEllipse(new Rect(238, -70, 170, 150))
  ctx.setFillColor(new Color('#ffffff', 0.018))
  ctx.fillRect(new Rect(28, 26, 132, 1))

  return ctx.getImage()
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')}`
}
