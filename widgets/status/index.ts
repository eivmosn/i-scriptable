// Scriptable 中型小组件：今日状态
export {}

interface StatusCard {
  kind: 'battery' | 'calendar' | 'focus'
  title: string
  value: string
  subtitle: string
  accent: string
}

const now = new Date()
const battery = Math.round(Device.batteryLevel() * 100)
const cards: StatusCard[] = [
  {
    kind: 'battery',
    title: '电量',
    value: `${battery}%`,
    subtitle: Device.isCharging() ? '正在充电' : '状态稳定',
    accent: battery > 30 ? '#5ff0b0' : '#ff6477',
  },
  {
    kind: 'calendar',
    title: '日程',
    value: weekdayShort(now),
    subtitle: '周末模式',
    accent: '#66e7ff',
  },
  {
    kind: 'focus',
    title: '状态',
    value: 'Focus',
    subtitle: '保持推进',
    accent: '#8da7ff',
  },
]

const widget = new ListWidget()
widget.setPadding(14, 16, 13, 16)
widget.spacing = 0
widget.backgroundImage = await loadBackground()
widget.refreshAfterDate = new Date(Date.now() + 1000 * 60)

const root = widget.addStack()
root.layoutHorizontally()
root.centerAlignContent()

const left = root.addStack()
left.layoutVertically()
left.size = new Size(166, 0)

const today = left.addStack()
today.layoutHorizontally()
today.centerAlignContent()
today.spacing = 6

const mark = today.addImage(makeTodayMark())
mark.imageSize = new Size(16, 16)

const todayText = today.addText('Today')
todayText.font = Font.semiboldSystemFont(14)
todayText.textColor = new Color('#dfeaff')
todayText.lineLimit = 1

left.addSpacer(4)

const dayMeta = left.addText(`第${weekOfYear(now)}周 · 今年第${dayOfYear(now)}天`)
dayMeta.font = Font.mediumSystemFont(10)
dayMeta.textColor = new Color('#80dff0')
dayMeta.lineLimit = 1
dayMeta.minimumScaleFactor = 0.8

left.addSpacer(7)

const time = left.addText(formatTime(now))
time.font = Font.heavySystemFont(44)
time.textColor = new Color('#f7fbff')
time.lineLimit = 1
time.minimumScaleFactor = 0.8

left.addSpacer(5)

const date = left.addText(formatDate(now))
date.font = Font.semiboldSystemFont(15)
date.textColor = new Color('#c7d6ec')
date.lineLimit = 1
date.minimumScaleFactor = 0.76

left.addSpacer()

const device = left.addStack()
device.layoutHorizontally()
device.centerAlignContent()
device.spacing = 5

const phone = device.addImage(makePhoneIcon())
phone.imageSize = new Size(12, 12)

const deviceText = device.addText(`${Device.model()} · ${Device.systemName()} ${Device.systemVersion()}`)
deviceText.font = Font.mediumSystemFont(10)
deviceText.textColor = new Color('#8fa7c7')
deviceText.lineLimit = 1
deviceText.minimumScaleFactor = 0.72

root.addSpacer()

const right = root.addStack()
right.layoutVertically()
right.spacing = 8

for (const card of cards)
  addStatusCard(right, card)

if (config.runsInWidget) {
  Script.setWidget(widget)
}
else {
  await widget.presentMedium()
}

Script.complete()

function addStatusCard(parent: WidgetStack, card: StatusCard): void {
  const panel = parent.addStack()
  panel.layoutHorizontally()
  panel.centerAlignContent()
  panel.size = new Size(140, 42)
  panel.cornerRadius = 18
  panel.backgroundColor = new Color('#ffffff', 0.17)
  panel.borderColor = new Color('#ffffff', 0.14)
  panel.borderWidth = 1
  panel.setPadding(5, 9, 5, 9)
  panel.spacing = 8

  const icon = panel.addImage(makeStatusIcon(card.kind, card.accent))
  icon.imageSize = new Size(32, 32)

  const text = panel.addStack()
  text.layoutVertically()
  text.spacing = 1

  const row = text.addStack()
  row.layoutHorizontally()
  row.centerAlignContent()
  row.spacing = 5

  const title = row.addText(card.title)
  title.font = Font.mediumSystemFont(12)
  title.textColor = new Color('#aec3df')
  title.lineLimit = 1

  const value = row.addText(card.value)
  value.font = Font.boldSystemFont(15)
  value.textColor = new Color('#f7fbff')
  value.lineLimit = 1
  value.minimumScaleFactor = 0.62

  const subtitle = text.addText(card.subtitle)
  subtitle.font = Font.mediumSystemFont(12)
  subtitle.textColor = new Color('#d5e1f4')
  subtitle.lineLimit = 1
  subtitle.minimumScaleFactor = 0.66
}

function makeTodayMark(): ScriptableImage {
  const size = new Size(48, 48)
  const ctx = imageContext(size)
  ctx.setFillColor(new Color('#68f2ff'))
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 2; x++)
      ctx.fillEllipse(new Rect(8 + x * 18, 8 + y * 18, 12, 12))
  }
  return ctx.getImage()
}

function makePhoneIcon(): ScriptableImage {
  const size = new Size(36, 36)
  const ctx = imageContext(size)
  ctx.setStrokeColor(new Color('#7fc7ff'))
  ctx.setLineWidth(2)
  ctx.strokeRect(new Rect(11, 5, 14, 26))
  ctx.setFillColor(new Color('#7fc7ff'))
  ctx.fillEllipse(new Rect(16, 27, 4, 4))
  return ctx.getImage()
}

function makeStatusIcon(kind: StatusCard['kind'], accent: string): ScriptableImage {
  const size = new Size(80, 80)
  const ctx = imageContext(size)
  ctx.setFillColor(new Color('#ffffff', 0.12))
  ctx.fillEllipse(new Rect(0, 0, 80, 80))
  ctx.setFillColor(new Color(accent, 0.22))
  ctx.fillEllipse(new Rect(14, 14, 52, 52))
  ctx.setFillColor(new Color(accent))

  if (kind === 'battery') {
    ctx.setStrokeColor(new Color('#d7f9ff'))
    ctx.setLineWidth(3)
    ctx.strokeRect(new Rect(24, 32, 27, 15))
    ctx.fillRect(new Rect(52, 36, 4, 7))
    ctx.fillRect(new Rect(28, 36, 16, 7))
  }
  else if (kind === 'calendar') {
    ctx.setStrokeColor(new Color('#d7f9ff'))
    ctx.setLineWidth(3)
    ctx.strokeRect(new Rect(24, 24, 32, 32))
    ctx.fillRect(new Rect(24, 31, 32, 4))
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 3; x++)
        ctx.fillRect(new Rect(30 + x * 8, 40 + y * 7, 3, 3))
    }
  }
  else {
    ctx.fillEllipse(new Rect(38, 18, 4, 18))
    ctx.fillEllipse(new Rect(38, 44, 4, 18))
    ctx.fillEllipse(new Rect(18, 38, 18, 4))
    ctx.fillEllipse(new Rect(44, 38, 18, 4))
    ctx.setFillColor(new Color('#d7f9ff'))
    ctx.fillEllipse(new Rect(28, 28, 5, 5))
    ctx.fillEllipse(new Rect(50, 26, 4, 4))
    ctx.fillEllipse(new Rect(48, 50, 5, 5))
  }

  return ctx.getImage()
}

function imageContext(size: Size): DrawContext {
  const ctx = new DrawContext()
  ctx.size = size
  ctx.opaque = false
  ctx.respectScreenScale = true
  return ctx
}

function formatTime(date: Date): string {
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${hours}:${minutes}`
}

function formatDate(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdayLong(date)}`
}

function weekdayShort(date: Date): string {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
}

function weekdayLong(date: Date): string {
  return ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.getDay()]
}

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1)
  return Math.floor((startOfDay(date).getTime() - start.getTime()) / 86400000) + 1
}

function weekOfYear(date: Date): number {
  const target = startOfDay(date)
  const day = target.getDay() || 7
  target.setDate(target.getDate() + 4 - day)
  const yearStart = new Date(target.getFullYear(), 0, 1)
  return Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

async function loadBackground(): Promise<ScriptableImage> {
  const fm = FileManager.iCloud()
  const path = fm.joinPath(fm.documentsDirectory(), 'status/background.png')

  if (!fm.fileExists(path))
    throw new Error('Missing background image: status/background.png')

  await fm.downloadFileFromiCloud(path)
  const image = fm.readImage(path)
  if (image)
    return image

  throw new Error('Cannot read background image: status/background.png')
}
