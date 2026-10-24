// Scriptable 小组件：WAVE POSTER · grain 的 wave 背景 + 纯排版文字
// 背景与 grain（参数 wave）完全一致；参数可替换大标题文字，默认 wave
export {}

interface Rgb {
  r: number
  g: number
  b: number
}

interface Spec {
  padding: number
  headlineSize: number
  subSize: number
}

const CANVAS = 180
const STEP = 2

const family = config.widgetFamily ?? 'medium'
const spec = specFor(family)
const headlineText = args.widgetParameter?.trim() || 'wave'

const ctx = new DrawContext()
ctx.size = new Size(CANVAS, CANVAS)
ctx.opaque = true
ctx.respectScreenScale = true

paintBackground(ctx)
paintLines(ctx)

const widget = new ListWidget()
widget.setPadding(spec.padding, spec.padding, spec.padding, spec.padding)
widget.backgroundImage = ctx.getImage()

addInfo(widget, spec, headlineText)

if (config.runsInWidget) {
  Script.setWidget(widget)
}
else if (family === 'medium') {
  await widget.presentMedium()
}
else if (family === 'large' || family === 'extraLarge') {
  await widget.presentLarge()
}
else {
  await widget.presentSmall()
}

Script.complete()

// ========================
// 背景：与 grain · wave 完全一致
// ========================

function paintBackground(ctx: DrawContext): void {
  for (let y = 0; y < CANVAS; y += STEP) {
    const v = y / CANVAS

    for (let x = 0; x < CANVAS; x += STEP) {
      const u = x / CANVAS
      const color = waveAt(u, v)

      ctx.setFillColor(new Color(rgbToHex(Math.round(color.r), Math.round(color.g), Math.round(color.b))))
      ctx.fillRect(new Rect(x, y, STEP + 0.6, STEP + 0.6))
    }
  }
}

function waveAt(u: number, v: number): Rgb {
  let color = mixRgb(hexToRgb('#01040B'), hexToRgb('#051530'), clamp01(v * 0.85 + u * 0.15))

  const ridge = 0.64 + 0.16 * Math.sin(u * 4.6 + 1.1) + 0.05 * Math.sin(u * 11.3 + 2)
  const distance = v - ridge
  const beam = Math.exp(-(distance * distance) / (2 * 0.085 * 0.085))
  const column = Math.exp(-((u - 0.74) ** 2) / (2 * 0.15 * 0.15))
    * Math.exp(-((v - 0.38) ** 2) / (2 * 0.45 * 0.45))

  color = mixRgb(color, hexToRgb('#1F5CFF'), clamp01(beam * 0.9 + column * 0.75))

  const core = Math.exp(-(distance * distance) / (2 * 0.028 * 0.028))
    * Math.exp(-((u - 0.72) ** 2) / (2 * 0.24 * 0.24))
  color = mixRgb(color, hexToRgb('#8FB8FF'), clamp01(core * 0.7))

  const wash = Math.exp(-((u - 0.86) ** 2 + (v - 0.88) ** 2) / (2 * 0.32 * 0.32))
  color = mixRgb(color, hexToRgb('#0A2A80'), clamp01(wash * 0.35))

  const edge = Math.min(u, 1 - u, v, 1 - v)
  const vignette = 1 - 0.2 * Math.max(0, 1 - edge / 0.18) ** 1.6

  return {
    r: color.r * vignette,
    g: color.g * vignette,
    b: color.b * vignette,
  }
}

function paintLines(ctx: DrawContext): void {
  const curves = 46
  const segments = 46

  ctx.setLineWidth(0.32)

  for (let index = 0; index < curves; index++) {
    const offset = (index / (curves - 1)) * 0.46 - 0.08
    const alpha = 0.04 + 0.09 * Math.max(0, 1 - Math.abs(offset + 0.02) / 0.5)

    ctx.setStrokeColor(new Color(index % 6 === 0 ? '#8FB8FF' : '#9CC4FF', alpha))

    const path = new Path()

    for (let step = 0; step <= segments; step++) {
      const u = step / segments
      const ridge = 0.64 + 0.16 * Math.sin(u * 4.6 + 1.1) + 0.05 * Math.sin(u * 11.3 + 2)
      const v = ridge + offset + 0.012 * Math.sin(u * 16 + index * 0.8)
      const point = new Point(u * CANVAS, v * CANVAS)

      if (step === 0)
        path.move(point)
      else
        path.addLine(point)
    }

    ctx.addPath(path)
    ctx.strokePath()
  }
}

// ========================
// 排版层
// ========================

function addInfo(widget: ListWidget, spec: Spec, headline: string): void {
  // 文字只出现在左上角的暗场里，其余区域保持纯背景
  const block = widget.addStack()
  block.layoutVertically()
  block.spacing = 0

  const title = block.addText(headline)
  title.font = Font.boldRoundedSystemFont(spec.headlineSize)
  title.textColor = new Color('#FFFFFF', 0.96)
  title.lineLimit = 1
  title.minimumScaleFactor = 0.55
  title.shadowColor = new Color('#000000', 0.2)
  title.shadowRadius = 10
  title.shadowOffset = new Point(0, 2)

  const sub = block.addText('silence in motion')
  sub.font = Font.italicSystemFont(spec.subSize)
  sub.textColor = new Color('#FFFFFF', 0.72)
  sub.lineLimit = 1

  widget.addSpacer()
}

function specFor(family: string): Spec {
  if (family === 'small') {
    return { padding: 12, headlineSize: 34, subSize: 10 }
  }
  if (family === 'large' || family === 'extraLarge') {
    return { padding: 18, headlineSize: 78, subSize: 14 }
  }

  return { padding: 15, headlineSize: 54, subSize: 12 }
}

// ========================
// 工具
// ========================

function mixRgb(from: Rgb, to: Rgb, ratio: number): Rgb {
  const t = Math.max(0, Math.min(1, ratio))

  return {
    r: from.r + (to.r - from.r) * t,
    g: from.g + (to.g - from.g) * t,
    b: from.b + (to.b - from.b) * t,
  }
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function hexToRgb(hex: string): Rgb {
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
