// Scriptable 中型小组件：周期提醒 · 心情渐变版
// 参数：2026.05.21 或 2026.05.21,28（逗号后是周期天数）
export {}

const DEFAULT_LAST_DATE = '2026.05.21'
const DEFAULT_CYCLE_DAYS = 28
const EARLY_DAYS = 2

interface WidgetParam {
  lastDate: Date
  cycleDays: number
}

interface CycleProgress {
  currentStart: Date
  nextDate: Date
  remindDate: Date
  passedDays: number
  daysToNext: number
  daysToRemind: number
}

interface WidgetCopy {
  tag: string
  remindText: string
  dateLine: string
  careLine: string
}

const rawParam = args.widgetParameter?.trim() || DEFAULT_LAST_DATE
const { lastDate, cycleDays } = parseParam(rawParam)

const today = startOfDay(new Date())
const progress = calcProgress(lastDate, cycleDays, today)
const moodIcon = getMood(progress.daysToNext)
const content = buildCopy(progress)

// ========================
// 小组件
// ========================

const widget = new ListWidget()
widget.setPadding(15, 18, 14, 18)

// 淡粉背景：柔和但有层次
const background = new LinearGradient()
background.locations = [0, 0.48, 1]
background.colors = [
  new Color('#FBEFF3'),
  new Color('#F3D7E1'),
  new Color('#E8BFD0'),
]
widget.backgroundGradient = background

// 字体颜色：莓紫 + 玫瑰灰
const primary = new Color('#3A2532')
const secondary = new Color('#684657')
const soft = new Color('#8D6C7A')
const accent = new Color('#B25F7E')
const pillBackground = new Color('#FFFFFF', 0.46)

// ========================
// 顶部信息
// ========================

const top = widget.addStack()
top.layoutHorizontally()
top.centerAlignContent()

const topText = top.addText(`上次 ${formatDate(progress.currentStart)} · 周期第 ${progress.passedDays + 1} 天`)
topText.font = Font.mediumRoundedSystemFont(13)
topText.textColor = secondary
topText.lineLimit = 1

top.addSpacer()

const tagBox = top.addStack()
tagBox.backgroundColor = pillBackground
tagBox.cornerRadius = 14
tagBox.setPadding(5, 11, 5, 11)

const tagText = tagBox.addText(content.tag)
tagText.font = Font.mediumRoundedSystemFont(10)
tagText.textColor = accent
tagText.lineLimit = 1

widget.addSpacer(12)

// ========================
// 主体内容
// ========================

const main = widget.addStack()
main.layoutHorizontally()
main.centerAlignContent()

const icon = main.addText(moodIcon)
icon.font = Font.systemFont(36)

main.addSpacer(12)

const textBox = main.addStack()
textBox.layoutVertically()

const infoText = textBox.addText(content.dateLine)
infoText.font = Font.mediumRoundedSystemFont(14)
infoText.textColor = secondary
infoText.lineLimit = 1
infoText.minimumScaleFactor = 0.82

textBox.addSpacer(7)

const careText = textBox.addText(content.careLine)
careText.font = Font.mediumRoundedSystemFont(14)
careText.textColor = soft
careText.lineLimit = 2
careText.minimumScaleFactor = 0.82

widget.addSpacer(14)

// ========================
// 底部提醒条
// ========================

const bottom = widget.addStack()
bottom.layoutHorizontally()
bottom.centerAlignContent()
bottom.backgroundColor = pillBackground
bottom.cornerRadius = 18
bottom.setPadding(10, 13, 10, 13)

const moon = bottom.addText('☾')
moon.font = Font.mediumRoundedSystemFont(14)
moon.textColor = accent

bottom.addSpacer(8)

const reminder = bottom.addText(content.remindText)
reminder.font = Font.semiboldRoundedSystemFont(15)
reminder.textColor = primary
reminder.lineLimit = 1

bottom.addSpacer()

const cycleText = bottom.addText(`${cycleDays} 天周期`)
cycleText.font = Font.regularSystemFont(11)
cycleText.textColor = soft
cycleText.lineLimit = 1

widget.refreshAfterDate = new Date(Date.now() + 60 * 60 * 1000)

if (config.runsInWidget) {
  Script.setWidget(widget)
}
else {
  await widget.presentMedium()
}

Script.complete()

// ========================
// 日期计算
// ========================

function parseParam(raw: string): WidgetParam {
  const parts = raw
    .split(/[,，|]/)
    .map(part => part.trim())
    .filter(Boolean)

  const cycle = Number(parts[1])

  return {
    lastDate: parseDate(parts[0] ?? '') ?? requireDate(DEFAULT_LAST_DATE),
    cycleDays: Number.isFinite(cycle) && cycle > 0 ? cycle : DEFAULT_CYCLE_DAYS,
  }
}

function parseDate(value: string): Date | null {
  const clean = value
    .replace(/年/g, '.')
    .replace(/月/g, '.')
    .replace(/日/g, '')
    .replace(/\//g, '.')
    .replace(/-/g, '.')

  const parts = clean.split('.').filter(Boolean)
  if (parts.length !== 3)
    return null

  const [year, month, day] = parts.map(Number)
  if (!year || !month || !day)
    return null

  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null
  }

  return date
}

function requireDate(value: string): Date {
  const date = parseDate(value)
  if (!date)
    throw new Error(`无法解析默认日期：${value}`)
  return date
}

function calcProgress(start: Date, cycle: number, now: Date): CycleProgress {
  let currentStart = startOfDay(start)
  let nextDate = addDays(currentStart, cycle)

  while (nextDate < now) {
    currentStart = nextDate
    nextDate = addDays(currentStart, cycle)
  }

  const remindDate = addDays(nextDate, -EARLY_DAYS)

  return {
    currentStart,
    nextDate,
    remindDate,
    passedDays: Math.max(0, diffDays(currentStart, now)),
    daysToNext: diffDays(now, nextDate),
    daysToRemind: diffDays(now, remindDate),
  }
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function diffDays(from: Date, to: Date): number {
  return Math.ceil((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86400000)
}

function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}.${day}`
}

// ========================
// 心情数组：越接近预计日越靠后
// 6 天及以上：😆  5 天：😀  4 天：🤨  3 天：😩
// 2 天：😵‍💫  1 天：🥺  今天：😭
// ========================

function getMood(daysToNext: number): string {
  const moods = ['😆', '😀', '🤨', '😩', '😵‍💫', '🥺', '😭']
  const index = moods.length - 1 - Math.max(0, daysToNext)
  return moods[Math.max(0, Math.min(moods.length - 1, index))]
}

// ========================
// 文案
// ========================

function buildCopy(cycle: CycleProgress): WidgetCopy {
  let tag = 'CALM'
  let remindText = `${Math.max(0, cycle.daysToRemind)} 天后提醒`
  let dateLine = `提醒日 ${formatDate(cycle.remindDate)} · 预计 ${formatDate(cycle.nextDate)}`
  let careLine = '保持好心情，慢慢来，也要好好照顾自己'

  if (cycle.daysToRemind <= 0 && cycle.daysToNext > 0) {
    tag = 'READY'
    remindText = `${cycle.daysToNext} 天到预计日`
    dateLine = `已经进入提醒期 · 预计 ${formatDate(cycle.nextDate)}`
    careLine = '可以提前准备啦，少冰一点，早点休息'
  }

  if (cycle.daysToNext === 0) {
    tag = 'TODAY'
    remindText = '今天要照顾自己'
    dateLine = '今天多照顾自己'
    careLine = '放慢一点，喝点热的，别太累'
  }

  return { tag, remindText, dateLine, careLine }
}
