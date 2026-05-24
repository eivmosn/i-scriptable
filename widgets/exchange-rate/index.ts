// Scriptable 中型小组件：外汇汇率
export {}

type CurrencyCode = 'GBP' | 'USD' | 'AUD' | 'HKD'

interface CurrencyMeta {
  code: CurrencyCode
  name: string
  flag: string
  spread: number
}

interface RateItem {
  code: CurrencyCode
  rate: number
}

interface RateData {
  items: RateItem[]
  date: string
  updatedAt: number
}

interface FrankfurterResponse {
  date?: string
  rates?: Record<string, number>
}

interface ValidFrankfurterResponse {
  date?: string
  rates: Record<CurrencyCode, number>
}

const currencies: CurrencyMeta[] = [
  { code: 'GBP', name: '英镑', flag: '🇬🇧', spread: 0.0022 },
  { code: 'USD', name: '美元', flag: '🇺🇸', spread: 0.0021 },
  { code: 'AUD', name: '澳大利亚元', flag: '🇦🇺', spread: 0.0025 },
  { code: 'HKD', name: '港币', flag: '🇭🇰', spread: 0.0022 },
]

const data = await getRatesWithCache()

const widget = new ListWidget()
widget.setPadding(20, 22, 18, 22)
widget.spacing = 0
widget.backgroundImage = await loadBackground()
widget.refreshAfterDate = new Date(Date.now() + 1000 * 60 * 60 * 4)
widget.url = `https://api.frankfurter.dev/v1/latest?base=CNY&symbols=${currencies.map(item => item.code).join(',')}`

const header = widget.addStack()
header.layoutHorizontally()
header.centerAlignContent()

const title = header.addText('外汇汇率')
title.font = Font.semiboldSystemFont(25)
title.textColor = new Color('#141414')
title.lineLimit = 1
title.minimumScaleFactor = 0.82

header.addSpacer()

const dateText = header.addText(formatTimestamp(data.updatedAt))
dateText.font = Font.systemFont(15)
dateText.textColor = new Color('#8d8b90')
dateText.lineLimit = 1
dateText.minimumScaleFactor = 0.72
dateText.rightAlignText()

widget.addSpacer(12)

const grid = widget.addStack()
grid.layoutHorizontally()
grid.centerAlignContent()
grid.spacing = 0

for (let index = 0; index < currencies.length; index++) {
  const currency = currencies[index]
  const rate = data.items.find(item => item.code === currency.code)
  const price = rate ? formatPrice((1 / rate.rate) * (1 + currency.spread)) : '--'

  const column = grid.addStack()
  column.layoutVertically()
  column.spacing = 5

  const flag = column.addText(currency.flag)
  flag.font = Font.systemFont(32)
  flag.lineLimit = 1

  const name = column.addText(currency.name)
  name.font = Font.mediumSystemFont(currency.code === 'AUD' ? 14 : 16)
  name.textColor = new Color('#8b8786')
  name.lineLimit = 1
  name.minimumScaleFactor = 0.66

  const valueRow = column.addStack()
  valueRow.layoutHorizontally()
  valueRow.centerAlignContent()
  valueRow.spacing = 3

  const value = valueRow.addText(price)
  value.font = Font.mediumSystemFont(20)
  value.textColor = new Color('#171717')
  value.lineLimit = 1
  value.minimumScaleFactor = 0.72

  const arrow = valueRow.addText('↑')
  arrow.font = Font.boldSystemFont(18)
  arrow.textColor = new Color('#ff455d')
  arrow.lineLimit = 1

  const label = column.addText('现汇卖出价')
  label.font = Font.mediumSystemFont(14)
  label.textColor = new Color('#aaa3a2')
  label.lineLimit = 1
  label.minimumScaleFactor = 0.72

  if (index < currencies.length - 1) {
    grid.addSpacer()
    addDivider(grid)
    grid.addSpacer()
  }
}

if (config.runsInWidget) {
  Script.setWidget(widget)
}
else {
  await widget.presentMedium()
}

Script.complete()

async function getRatesWithCache(): Promise<RateData> {
  const fm = FileManager.iCloud()
  const cacheDir = fm.joinPath(fm.documentsDirectory(), 'exchange-rate')
  const cachePath = fm.joinPath(cacheDir, 'medium-rates.json')

  if (!fm.fileExists(cacheDir))
    fm.createDirectory(cacheDir, true)

  try {
    const data = await fetchRates()
    fm.writeString(cachePath, JSON.stringify(data))
    return data
  }
  catch (error) {
    if (!fm.fileExists(cachePath))
      throw error

    await fm.downloadFileFromiCloud(cachePath)
    return JSON.parse(fm.readString(cachePath)) as RateData
  }
}

async function fetchRates(): Promise<RateData> {
  const symbols = currencies.map(item => item.code).join(',')
  const request = new Request(`https://api.frankfurter.dev/v1/latest?base=CNY&symbols=${symbols}`)
  request.timeoutInterval = 10
  request.headers = {
    Accept: 'application/json',
  }

  const json = await request.loadJSON()
  if (!isFrankfurterResponse(json))
    throw new Error('Unexpected exchange response')

  return {
    date: json.date || formatIsoDate(new Date()),
    items: currencies.map(currency => ({
      code: currency.code,
      rate: json.rates[currency.code],
    })),
    updatedAt: Date.now(),
  }
}

function isFrankfurterResponse(value: unknown): value is ValidFrankfurterResponse {
  if (
    typeof value !== 'object'
    || value === null
    || !('rates' in value)
    || typeof (value as FrankfurterResponse).rates !== 'object'
    || (value as FrankfurterResponse).rates === null
  ) {
    return false
  }

  return currencies.every(currency => typeof (value as FrankfurterResponse).rates?.[currency.code] === 'number')
}

function formatPrice(value: number): string {
  return value.toFixed(4)
}

function formatTimestamp(value: number): string {
  const date = new Date(value)
  const year = `${date.getFullYear()}`.slice(-2)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${year}.${month}.${day} ${hours}:${minutes}`
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDivider(parent: WidgetStack): void {
  const wrapper = parent.addStack()
  wrapper.layoutVertically()
  wrapper.size = new Size(1, 88)
  wrapper.addSpacer(43)

  const divider = wrapper.addStack()
  divider.layoutVertically()
  divider.size = new Size(1, 34)
  divider.spacing = 3

  for (let i = 0; i < 5; i++) {
    const dash = divider.addStack()
    dash.size = new Size(1, 4)
    dash.backgroundColor = new Color('#bba98f', 0.72)
  }
}

async function loadBackground(): Promise<ScriptableImage> {
  const fm = FileManager.iCloud()
  const path = fm.joinPath(fm.documentsDirectory(), 'exchange-rate/background.png')

  if (!fm.fileExists(path))
    throw new Error('Missing background image: exchange-rate/background.png')

  await fm.downloadFileFromiCloud(path)
  const image = fm.readImage(path)
  if (image)
    return image

  throw new Error('Cannot read background image: exchange-rate/background.png')
}
