// Scriptable 小组件：金牛座卡片
export {}

const widget = new ListWidget()
widget.setPadding(15, 13, 14, 13)
widget.spacing = 0
widget.backgroundImage = await loadBackground()
widget.refreshAfterDate = new Date(Date.now() + 1000 * 60 * 60 * 6)

const title = widget.addText('金牛座')
title.font = Font.heavySystemFont(30)
title.textColor = Color.white()
title.lineLimit = 1
title.minimumScaleFactor = 0.8

widget.addSpacer(2)

const date = widget.addText('02/18')
date.font = Font.heavySystemFont(22)
date.textColor = Color.white()
date.lineLimit = 1

widget.addSpacer()

const tip = widget.addText('今日有意外财运，\n需留意')
tip.font = Font.heavySystemFont(18)
tip.textColor = Color.white()
tip.lineLimit = 2
tip.minimumScaleFactor = 0.7

if (config.runsInWidget) {
  Script.setWidget(widget)
}
else {
  await widget.presentSmall()
}

Script.complete()

async function loadBackground(): Promise<ScriptableImage> {
  const fm = FileManager.iCloud()
  const dir = fm.documentsDirectory()
  const names = [
    'taurus/banner.png',
  ]

  for (const name of names) {
    const path = fm.joinPath(dir, name)
    if (!fm.fileExists(path))
      continue

    await fm.downloadFileFromiCloud(path)
    const image = fm.readImage(path)
    if (image)
      return image
  }

  return makeBackground()
}

function makeBackground(): ScriptableImage {
  const size = new Size(360, 360)
  const ctx = new DrawContext()
  ctx.size = size
  ctx.opaque = false
  ctx.respectScreenScale = true

  paintDiffusedGradient(ctx, size)
  paintNoise(ctx, size)

  return ctx.getImage()
}

function paintDiffusedGradient(ctx: DrawContext, size: Size): void {
  const step = 3
  const fields = [
    { x: -0.24, y: 0.52, radius: 0.72, color: '#7eefff', power: 1.55, weight: 1.2 },
    { x: 0.08, y: 1.08, radius: 0.74, color: '#73d8ff', power: 1.45, weight: 1.05 },
    { x: 0.92, y: 1.03, radius: 0.72, color: '#daf3cd', power: 1.65, weight: 0.62 },
    { x: 0.36, y: 0.42, radius: 0.92, color: '#2376ca', power: 1.15, weight: 0.95 },
    { x: 0.86, y: 0.08, radius: 0.75, color: '#0d1742', power: 1.2, weight: 1.45 },
    { x: 0.54, y: -0.2, radius: 0.62, color: '#171a53', power: 1.35, weight: 1.2 },
  ].map(field => ({
    ...field,
    rgb: hexToRgb(field.color),
  }))

  for (let y = 0; y < size.height; y += step) {
    for (let x = 0; x < size.width; x += step) {
      const nx = x / size.width
      const ny = y / size.height
      const diagonalShade = nx * 0.18 + (1 - ny) * 0.22
      let total = 0.001
      let r = 10 + diagonalShade * 18
      let g = 22 + diagonalShade * 22
      let b = 58 + diagonalShade * 45

      for (const field of fields) {
        const dx = nx - field.x
        const dy = ny - field.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const influence = Math.max(0, 1 - distance / field.radius) ** field.power * field.weight

        total += influence
        r += field.rgb.r * influence
        g += field.rgb.g * influence
        b += field.rgb.b * influence
      }

      const vignette = edgeVignette(nx, ny)
      const color = rgbToHex(
        clamp(Math.round((r / total) * vignette), 0, 255),
        clamp(Math.round((g / total) * vignette), 0, 255),
        clamp(Math.round((b / total) * vignette), 0, 255),
      )

      ctx.setFillColor(new Color(color))
      ctx.fillRect(new Rect(x, y, step + 0.5, step + 0.5))
    }
  }
}

function paintNoise(ctx: DrawContext, size: Size): void {
  for (let i = 0; i < 1900; i++) {
    const x = randomBetween(0, size.width)
    const y = randomBetween(0, size.height)
    const alpha = randomBetween(0.015, 0.055)
    const light = Math.random() > 0.46
    const gray = Math.round(randomBetween(light ? 170 : 10, light ? 255 : 80))
    const radius = randomBetween(0.35, 1.15)

    ctx.setFillColor(new Color(rgbToHex(gray, gray, gray), alpha))
    ctx.fillEllipse(new Rect(x, y, radius, radius))
  }
}

function edgeVignette(nx: number, ny: number): number {
  const leftTop = 1 - Math.max(0, 0.32 - nx) * 0.14
  const rightTop = 1 - Math.max(0, nx - 0.62) * Math.max(0, 0.42 - ny) * 0.9
  const bottomRight = 1 - Math.max(0, nx - 0.65) * Math.max(0, ny - 0.74) * 0.42
  return Math.max(0.62, leftTop * rightTop * bottomRight)
}

function hexToRgb(hex: string): { r: number, g: number, b: number } {
  const value = hex.replace('#', '')
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}
