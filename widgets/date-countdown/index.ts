// Scriptable 中型小组件：精致低饱和渐变 · 正计时
// 小组件参数填写起始日期，例如 2022.12.12；不填写参数时默认 2021.11.12
export {}

const DEFAULT_DATE = '2021.11.12'

interface Elapsed {
  days: number
  hours: number
  minutes: number
}

const rawDate = args.widgetParameter?.trim() || DEFAULT_DATE
const startDate = parseDate(rawDate) ?? requireDate(DEFAULT_DATE)

const now = new Date()
const elapsed = calcElapsed(startDate, now)

// ========================
// Widget
// ========================

const widget = new ListWidget()

const background = new LinearGradient()
background.locations = [0, 0.32, 0.68, 1]
background.colors = [
  new Color('#3A4654'),
  new Color('#242C36'),
  new Color('#151A21'),
  new Color('#07090D'),
]

widget.backgroundGradient = background
widget.setPadding(18, 18, 16, 18)

// ========================
// 顶部
// ========================

const top = widget.addStack()
top.layoutHorizontally()
top.centerAlignContent()

const title = top.addText('在一起')
title.font = Font.boldSystemFont(24)
title.textColor = new Color('#F8F5EE')

top.addSpacer()

// 两圈绿色状态点
const glowOuter = top.addStack()
glowOuter.layoutHorizontally()
glowOuter.centerAlignContent()
glowOuter.size = new Size(18, 18)
glowOuter.cornerRadius = 9
glowOuter.backgroundColor = new Color('#8CFF9A', 0.14)

glowOuter.addSpacer()

const glowInner = glowOuter.addStack()
glowInner.size = new Size(8, 8)
glowInner.cornerRadius = 4
glowInner.backgroundColor = new Color('#A6FFAE', 0.92)

glowOuter.addSpacer()

widget.addSpacer(4)

const startLine = widget.addText(`${formatDate(startDate)}  已经`)
startLine.font = Font.mediumSystemFont(13)
startLine.textColor = new Color('#F8F5EE', 0.58)

// ========================
// 中间留白
// ========================

widget.addSpacer()

// ========================
// 主数字
// ========================

const numberRow = widget.addStack()
numberRow.layoutHorizontally()
numberRow.bottomAlignContent()

const number = numberRow.addText(String(elapsed.days))
number.font = Font.blackRoundedSystemFont(66)
number.textColor = new Color('#FFFDF7')
number.minimumScaleFactor = 0.5
number.shadowColor = new Color('#000000', 0.26)
number.shadowRadius = 3
number.shadowOffset = new Point(0, 2)

numberRow.addSpacer(6)

const unit = numberRow.addText('天')
unit.font = Font.boldSystemFont(18)
unit.textColor = new Color('#F8F5EE', 0.72)

// ========================
// 底部
// ========================

widget.addSpacer(10)

const bottom = widget.addStack()
bottom.layoutHorizontally()
bottom.centerAlignContent()
bottom.backgroundColor = new Color('#FFFFFF', 0.085)
bottom.cornerRadius = 12
bottom.setPadding(7, 10, 7, 10)

const time = bottom.addText(`${elapsed.hours} 小时 ${elapsed.minutes} 分钟`)
time.font = Font.mediumSystemFont(11)
time.textColor = new Color('#F8F5EE', 0.86)
time.lineLimit = 1
time.minimumScaleFactor = 0.7

bottom.addSpacer()

const label = bottom.addText('TIME')
label.font = Font.boldSystemFont(10)
label.textColor = new Color('#F8F5EE', 0.42)
label.lineLimit = 1

widget.refreshAfterDate = new Date(Date.now() + 60 * 1000)

if (config.runsInWidget) {
  Script.setWidget(widget)
}
else {
  await widget.presentMedium()
}

Script.complete()

// ========================
// 时间计算
// ========================

function calcElapsed(start: Date, reference: Date): Elapsed {
  const diff = Math.max(0, reference.getTime() - start.getTime())

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
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

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}
