// Scriptable 小组件：GRAIN · 噪点渐变（small，纯背景）
// 参数：dusk（默认）/ daybreak / meridian / nocturne —— 四套网格渐变
//       wave / beam / silk —— 参考图扩展的三种光感风格
export {}

type Style = 'wave' | 'beam' | 'silk' | 'halo' | 'flow' | 'spiral' | 'pillar' | 'aurora'

interface GrainPalette {
  top: string
  bottom: string
  glowA: string
  glowB: string
}

interface Rgb {
  r: number
  g: number
  b: number
}

interface Glow {
  x: number
  y: number
  radius: number
  strength: number
  color: Rgb
}

type WaveDirection = 's' | 'mirror'

interface WaveConfig {
  baseTop: string
  baseBottom: string
  electric: string
  ice: string
  wash: string
  direction: WaveDirection
}

const CANVAS = 180
const STEP = 2

const palettes: Record<string, GrainPalette> = {
  daybreak: {
    top: '#FAE6D8',
    bottom: '#D9A6C6',
    glowA: '#FFCB8E',
    glowB: '#8C79D8',
  },
  meridian: {
    top: '#E9F3F7',
    bottom: '#A6C6DA',
    glowA: '#FFE4B8',
    glowB: '#6BA6D8',
  },
  dusk: {
    top: '#2A1B3D',
    bottom: '#C15A6E',
    glowA: '#FF8E5E',
    glowB: '#6C4BC4',
  },
  nocturne: {
    top: '#070B24',
    bottom: '#1F1B4A',
    glowA: '#5F45C9',
    glowB: '#2E86B8',
  },
}

const wavePalettes: Record<string, Omit<WaveConfig, 'direction'>> = {
  blue: {
    baseTop: '#01040B',
    baseBottom: '#051530',
    electric: '#1F5CFF',
    ice: '#8FB8FF',
    wash: '#0A2A80',
  },
  cyan: {
    baseTop: '#010A0C',
    baseBottom: '#06222A',
    electric: '#00D6C2',
    ice: '#9DFFF2',
    wash: '#046B6A',
  },
  warm: {
    baseTop: '#0A0503',
    baseBottom: '#2A1206',
    electric: '#FF7A2F',
    ice: '#FFD9A8',
    wash: '#7A2C0A',
  },
}

const waveVariants: WaveConfig[] = [
  { ...wavePalettes.blue, direction: 's' },
  { ...wavePalettes.cyan, direction: 's' },
  { ...wavePalettes.warm, direction: 's' },
  { ...wavePalettes.blue, direction: 'mirror' },
]

function parseWaveConfig(token: string): WaveConfig | null {
  const match = /^wave(\d*)$/.exec(token)

  if (!match)
    return null

  const index = match[1] ? Number(match[1]) : 0

  return waveVariants[index] ?? waveVariants[0]
}

const rawVariant = args.widgetParameter?.trim().toLowerCase() ?? 'dusk'
const waveConfig = parseWaveConfig(rawVariant)
const styles: Style[] = ['beam', 'silk', 'halo', 'flow', 'spiral', 'pillar', 'aurora']
const style: Style | null = waveConfig
  ? 'wave'
  : styles.includes(rawVariant as Style)
    ? rawVariant as Style
    : null
const palette = palettes[rawVariant] ?? palettes.dusk

const ctx = new DrawContext()
ctx.size = new Size(CANVAS, CANVAS)
ctx.opaque = true
ctx.respectScreenScale = true

if (style) {
  paintStyleBackground(ctx, style)
  paintStyleLines(ctx, style)
}
else {
  paintMesh(ctx, palette)
}

const widget = new ListWidget()
widget.backgroundImage = ctx.getImage()

if (config.runsInWidget) {
  Script.setWidget(widget)
}
else {
  await widget.presentSmall()
}

Script.complete()

// ========================
// 网格渐变（原有四套）
// ========================

function paintMesh(ctx: DrawContext, palette: GrainPalette): void {
  const top = hexToRgb(palette.top)
  const bottom = hexToRgb(palette.bottom)
  const glows: Glow[] = [
    { x: 0.78, y: 0.2, radius: 0.85, strength: 0.9, color: hexToRgb(palette.glowA) },
    { x: 0.16, y: 0.84, radius: 0.78, strength: 0.85, color: hexToRgb(palette.glowB) },
    { x: 0.5, y: 0.5, radius: 0.55, strength: 0.3, color: hexToRgb(palette.glowB) },
  ]

  for (let y = 0; y < CANVAS; y += STEP) {
    const v = y / CANVAS

    for (let x = 0; x < CANVAS; x += STEP) {
      const u = x / CANVAS
      let color = mixRgb(top, bottom, v)

      for (const glow of glows) {
        const dx = u - glow.x
        const dy = v - glow.y
        const weight = Math.exp(-((dx * dx + dy * dy) / (glow.radius * glow.radius)) * 2.6) * glow.strength

        color = mixRgb(color, glow.color, weight)
      }

      color = vignette(color, u, v, 0.15)
      ctx.setFillColor(new Color(rgbToHex(
        Math.round(color.r),
        Math.round(color.g),
        Math.round(color.b),
      )))
      ctx.fillRect(new Rect(x, y, STEP + 0.6, STEP + 0.6))
    }
  }
}

// ========================
// 参考图风格：光感背景
// ========================

function paintStyleBackground(ctx: DrawContext, style: Style): void {
  for (let y = 0; y < CANVAS; y += STEP) {
    const v = y / CANVAS

    for (let x = 0; x < CANVAS; x += STEP) {
      const u = x / CANVAS
      const color = style === 'wave' && waveConfig
        ? waveAt(u, v, waveConfig)
        : styleColorAt(style, u, v)

      ctx.setFillColor(new Color(rgbToHex(
        Math.round(color.r),
        Math.round(color.g),
        Math.round(color.b),
      )))
      ctx.fillRect(new Rect(x, y, STEP + 0.6, STEP + 0.6))
    }
  }
}

// 电光波带：地平线状光带 + 侧向光柱（配色 / 角度可配置）
function waveAt(u: number, v: number, config: WaveConfig): Rgb {
  let color = mixRgb(hexToRgb(config.baseTop), hexToRgb(config.baseBottom), clamp01(v * 0.85 + u * 0.15))

  const ridge = ridgeAt(u, config)
  const distance = v - ridge
  const columnX = columnFor(config.direction)

  const beam = Math.exp(-(distance * distance) / (2 * 0.085 * 0.085))
  const column = Math.exp(-((u - columnX) ** 2) / (2 * 0.15 * 0.15))
    * Math.exp(-((v - 0.38) ** 2) / (2 * 0.45 * 0.45))

  color = mixRgb(color, hexToRgb(config.electric), clamp01(beam * 0.9 + column * 0.75))

  const core = Math.exp(-(distance * distance) / (2 * 0.028 * 0.028))
    * Math.exp(-((u - (columnX - 0.02)) ** 2) / (2 * 0.24 * 0.24))
  color = mixRgb(color, hexToRgb(config.ice), clamp01(core * 0.7))

  const wash = Math.exp(-((u - 0.86) ** 2 + (v - 0.88) ** 2) / (2 * 0.32 * 0.32))
  color = mixRgb(color, hexToRgb(config.wash), clamp01(wash * 0.35))

  return vignette(color, u, v, 0.2)
}

function ridgeAt(u: number, config: WaveConfig): number {
  const t = config.direction === 'mirror' ? 1 - u : u

  return 0.64 + 0.16 * Math.sin(t * 4.6 + 1.1) + 0.05 * Math.sin(t * 11.3 + 2)
}

function columnFor(direction: WaveDirection): number {
  return direction === 'mirror' ? 0.26 : 0.74
}

// 蓝色光束：左上冷光斜扫进深蓝
function beamAt(u: number, v: number): Rgb {
  const pale = hexToRgb('#D9F1FA')
  const azure = hexToRgb('#1E86E8')
  const deep = hexToRgb('#0A2464')

  const diagonal = clamp01(0.58 * u + 0.42 * v)
  let color = diagonal < 0.55
    ? mixRgb(pale, azure, smoothstep(0.04, 0.55, diagonal))
    : mixRgb(azure, deep, smoothstep(0.55, 0.98, diagonal))

  const beam = Math.exp(-((v - (0.52 * u + 0.06)) ** 2) / (2 * 0.085 * 0.085))
    * Math.exp(-((u - 0.36) ** 2) / (2 * 0.4 * 0.4))
  color = mixRgb(color, hexToRgb('#EAF9FF'), clamp01(beam * 0.55))

  const shadow = Math.exp(-((u - 0.94) ** 2 + (v - 0.04) ** 2) / (2 * 0.26 * 0.26))
  color = mixRgb(color, hexToRgb('#001233'), clamp01(shadow * 0.45))

  const bottomGlow = Math.exp(-((u - 0.2) ** 2 + (v - 1.05) ** 2) / (2 * 0.4 * 0.4))
  color = mixRgb(color, hexToRgb('#3AA6FF'), clamp01(bottomGlow * 0.2))

  return vignette(color, u, v, 0.12)
}

// 暖金丝绸：象牙底 + 左上冷灰 + 右下暖金
function silkAt(u: number, v: number): Rgb {
  let color = mixRgb(hexToRgb('#F7F2E4'), hexToRgb('#F9EDD4'), smoothstep(0, 1, v))

  const coldWeight = Math.exp(-((u - 0.02) ** 2 + (v - 0.02) ** 2) / (2 * 0.38 * 0.38))
  color = mixRgb(color, hexToRgb('#D8E6F1'), clamp01(coldWeight * 0.9))

  const goldWeight = Math.exp(-((u - 0.9) ** 2 + (v - 1.02) ** 2) / (2 * 0.42 * 0.42))
  color = mixRgb(color, hexToRgb('#EBC167'), clamp01(goldWeight * 1))

  const lift = Math.exp(-((u - 0.48) ** 2 + (v - 0.42) ** 2) / (2 * 0.5 * 0.5))
  color = mixRgb(color, hexToRgb('#FFFDF6'), clamp01(lift * 0.35))

  return vignette(color, u, v, 0.05)
}

function styleColorAt(style: Style, u: number, v: number): Rgb {
  if (style === 'beam')
    return beamAt(u, v)
  if (style === 'silk')
    return silkAt(u, v)
  if (style === 'halo')
    return haloAt(u, v)
  if (style === 'flow')
    return flowAt(u, v)
  if (style === 'spiral')
    return spiralAt(u, v)
  if (style === 'pillar')
    return pillarAt(u, v)
  if (style === 'aurora')
    return auroraAt(u, v)

  return waveAt(u, v, { ...wavePalettes.blue, direction: 's' })
}

// 四周辉光：暗底 + 边框泛光
function haloAt(u: number, v: number): Rgb {
  let color = mixRgb(hexToRgb('#02040F'), hexToRgb('#071033'), clamp01(0.35 + v * 0.35))

  const edge = Math.min(u, 1 - u, v, 1 - v)
  const bloom = Math.exp(-edge / 0.085)
  color = mixRgb(color, hexToRgb('#2F6BFF'), clamp01(bloom * 0.92))

  const cornerA = Math.exp(-((u - 0.08) ** 2 + (v - 0.08) ** 2) / (2 * 0.18 * 0.18))
  const cornerB = Math.exp(-((u - 0.92) ** 2 + (v - 0.9) ** 2) / (2 * 0.2 * 0.2))
  color = mixRgb(color, hexToRgb('#7FD8FF'), clamp01((cornerA + cornerB) * 0.22))

  const center = Math.exp(-((u - 0.5) ** 2 + (v - 0.5) ** 2) / (2 * 0.2 * 0.2))
  color = mixRgb(color, hexToRgb('#01030A'), clamp01(center * 0.6))

  return color
}

// 流光丝线：整面细丝 + 左侧泛光
function flowAt(u: number, v: number): Rgb {
  let color = mixRgb(hexToRgb('#02050F'), hexToRgb('#061433'), clamp01(0.18 + v * 0.5 - u * 0.08))

  const leftGlow = Math.exp(-((u + 0.04) ** 2) / (2 * 0.26 * 0.26))
    * Math.exp(-((v - 0.32) ** 2) / (2 * 0.5 * 0.5))
  color = mixRgb(color, hexToRgb('#1E5CFF'), clamp01(leftGlow * 0.8))

  const centerGlow = Math.exp(-((u - 0.56) ** 2 + (v - 0.64) ** 2) / (2 * 0.28 * 0.28))
  color = mixRgb(color, hexToRgb('#0B2E8A'), clamp01(centerGlow * 0.55))

  const edge = Math.min(u, 1 - u, v, 1 - v)
  const bloom = Math.exp(-edge / 0.055)
  color = mixRgb(color, hexToRgb('#3F7BFF'), clamp01(bloom * 0.4))

  return color
}

// 发光漩涡：中心辉光 + 螺旋流光
function spiralAt(u: number, v: number): Rgb {
  let color = mixRgb(hexToRgb('#02030B'), hexToRgb('#050A22'), clamp01(0.2 + v * 0.5))

  const core = Math.exp(-((u - 0.42) ** 2 + (v - 0.47) ** 2) / (2 * 0.17 * 0.17))
  color = mixRgb(color, hexToRgb('#1E4FFF'), clamp01(core * 0.85))

  const inner = Math.exp(-((u - 0.42) ** 2 + (v - 0.47) ** 2) / (2 * 0.06 * 0.06))
  color = mixRgb(color, hexToRgb('#9FD0FF'), clamp01(inner * 0.5))

  const edge = Math.min(u, 1 - u, v, 1 - v)
  const bloom = Math.exp(-edge / 0.05)
  color = mixRgb(color, hexToRgb('#2C5CE8'), clamp01(bloom * 0.3))

  return color
}

// 深空光柱：两端炸开、中段收束成柱
function pillarAt(u: number, v: number): Rgb {
  let color = mixRgb(hexToRgb('#010208'), hexToRgb('#020513'), smoothstep(0, 1, v))

  const horizon = Math.exp(-((v - 1.05) ** 2) / (2 * 0.16 * 0.16))
  color = mixRgb(color, hexToRgb('#0A2A66'), clamp01(horizon * 0.4))

  const sky = Math.exp(-((u - 0.5) ** 2 + (v + 0.05) ** 2) / (2 * 0.45 * 0.45))
  color = mixRgb(color, hexToRgb('#132C63'), clamp01(sky * 0.15))

  const positions = [0.12, 0.27, 0.42, 0.58, 0.73, 0.88]

  for (let index = 0; index < positions.length; index++) {
    const phase = index * 1.73
    const center = positions[index] + 0.02 * Math.sin(v * 2.6 + phase)
    const topBurst = Math.exp(-((v - 0.07) ** 2) / (2 * 0.11 * 0.11)) * 0.55
    const bottomBurst = Math.exp(-((v - 0.93) ** 2) / (2 * 0.13 * 0.13))
    const profile = topBurst + bottomBurst + 0.16
    const width = 0.011 + 0.045 * profile
    const lateral = Math.exp(-((u - center) ** 2) / (2 * width * width))
    const flicker = 0.72 + 0.28 * Math.sin(v * 8.5 + phase * 2.1)
    const strength = lateral * profile * flicker * (0.5 + pillarNoise(index) * 0.3)

    color = mixRgb(color, hexToRgb('#3E7BFF'), clamp01(strength * 0.55))

    const core = Math.exp(-((u - center) ** 2) / (2 * (width * 0.42) ** 2))
      * (bottomBurst + topBurst * 0.7)
    color = mixRgb(color, hexToRgb('#A9D4FF'), clamp01(core * 0.6))
  }

  return color
}

function pillarNoise(index: number): number {
  const value = Math.sin(index * 91.7 + 4.2) * 43758.5453
  return value - Math.floor(value)
}

// 深蓝极光：暗底上的大尺度斜向光带
function auroraAt(u: number, v: number): Rgb {
  let color = mixRgb(hexToRgb('#02070F'), hexToRgb('#0C2A47'), 1 - smoothstep(0, 1, v))

  // 主光带：从左下方斜向右上方
  const mainCenter = 0.62 - 0.5 * u + 0.1 * Math.sin(u * 2.2 + 1.1)
  const mainDistance = v - mainCenter
  color = mixRgb(color, hexToRgb('#C6E4F2'), Math.exp(-(mainDistance * mainDistance) / (2 * 0.2 * 0.2)) * 0.75)

  // 反向细带
  const secondCenter = 0.18 + 0.45 * u + 0.08 * Math.sin(u * 3.1 + 2.4)
  const secondDistance = v - secondCenter
  color = mixRgb(color, hexToRgb('#8DB8D2'), Math.exp(-(secondDistance * secondDistance) / (2 * 0.16 * 0.16)) * 0.5)

  // 中段柔光
  const softCenter = 0.5 + 0.1 * Math.sin(u * 1.7 + 0.3)
  const softDistance = v - softCenter
  color = mixRgb(color, hexToRgb('#5B8FB2'), Math.exp(-(softDistance * softDistance) / (2 * 0.3 * 0.3)) * 0.38)

  const bloom = Math.exp(-((u - 0.76) ** 2 + (v - 0.14) ** 2) / (2 * 0.34 * 0.34))
  color = mixRgb(color, hexToRgb('#D8EFF9'), clamp01(bloom * 0.3))

  const bottomFade = clamp01(smoothstep(0.68, 1, v) * 0.35)
  color = mixRgb(color, hexToRgb('#020810'), bottomFade)

  return color
}

// ========================
// 参考图风格：细流动线
// ========================

function paintStyleLines(ctx: DrawContext, style: Style): void {
  if (style === 'wave' && waveConfig)
    paintWaveLines(ctx, waveConfig)
  else if (style === 'silk')
    paintSilkLines(ctx)
  else if (style === 'halo')
    paintHaloLines(ctx)
  else if (style === 'flow')
    paintFlowLines(ctx)
  else if (style === 'spiral')
    paintSpiralLines(ctx)
}

function paintWaveLines(ctx: DrawContext, config: WaveConfig): void {
  const curves = 46
  const segments = 46

  ctx.setLineWidth(0.32)

  for (let index = 0; index < curves; index++) {
    const offset = (index / (curves - 1)) * 0.46 - 0.08
    const alpha = 0.04 + 0.09 * Math.max(0, 1 - Math.abs(offset + 0.02) / 0.5)

    ctx.setStrokeColor(new Color(index % 6 === 0 ? config.ice : '#9CC4FF', alpha))

    const path = new Path()

    for (let step = 0; step <= segments; step++) {
      const u = step / segments
      const ridge = ridgeAt(u, config)
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

function paintSilkLines(ctx: DrawContext): void {
  const families = [
    { count: 64, spread: 0.5, alpha: 0.08, color: '#A98243' },
    { count: 36, spread: 0.4, alpha: 0.06, color: '#FFFFFF' },
  ]

  for (const family of families) {
    for (let index = 0; index < family.count; index++) {
      const offset = (index / (family.count - 1)) * family.spread
      const alpha = family.alpha * (1 - (offset / family.spread) * 0.45)

      ctx.setStrokeColor(new Color(family.color, alpha))
      ctx.setLineWidth(0.3)

      const path = new Path()

      for (let step = 0; step <= 52; step++) {
        const u = step / 52
        const base = 0.58 + 0.17 * Math.sin(u * 3.2 + 1.2) + 0.05 * Math.sin(u * 8.1 + 0.4)
        const v = base + offset + 0.008 * Math.sin(u * 13 + index * 0.5)
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
}

function paintHaloLines(ctx: DrawContext): void {
  // 发光边框：多层描边模拟泛光
  for (let index = 0; index < 7; index++) {
    const inset = 5 + index * 1.7

    ctx.setLineWidth(6.4 - index * 0.75)
    ctx.setStrokeColor(new Color('#4F8CFF', 0.03 + index * 0.004))

    const path = new Path()
    path.addRoundedRect(new Rect(inset, inset, CANVAS - inset * 2, CANVAS - inset * 2), 18, 18)
    ctx.addPath(path)
    ctx.strokePath()
  }

  // 横向流动细丝
  const curves = 38
  const segments = 44

  ctx.setLineWidth(0.3)

  for (let index = 0; index < curves; index++) {
    const baseY = 0.06 + (index / (curves - 1)) * 0.88
    const alpha = 0.05 + 0.05 * Math.exp(-((baseY - 0.5) ** 2) / (2 * 0.3 * 0.3))

    ctx.setStrokeColor(new Color(index % 5 === 0 ? '#A8DCFF' : '#7FA8FF', alpha))

    const path = new Path()

    for (let step = 0; step <= segments; step++) {
      const u = step / segments
      const v = baseY + 0.012 * Math.sin(u * 9 + index * 0.4) + 0.006 * Math.sin(u * 21 - index * 0.2)
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

function paintFlowLines(ctx: DrawContext): void {
  const curves = 96
  const segments = 56

  ctx.setLineWidth(0.3)

  for (let index = 0; index < curves; index++) {
    const baseY = -0.08 + (index / (curves - 1)) * 1.16
    const bandDistance = baseY - 0.55
    const alpha = 0.035 + 0.075 * Math.exp(-(bandDistance * bandDistance) / (2 * 0.24 * 0.24))
    const color = index % 6 === 0 ? '#C4E8FF' : index % 3 === 0 ? '#6FA8FF' : '#8CC0FF'

    ctx.setStrokeColor(new Color(color, alpha))

    const path = new Path()

    for (let step = 0; step <= segments; step++) {
      const u = step / segments
      const v = baseY + 0.055 * Math.sin(u * 3.4 + index * 0.17) + 0.025 * Math.sin(u * 8.2 - index * 0.09)
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

function paintSpiralLines(ctx: DrawContext): void {
  const curves = 18
  const segments = 90

  ctx.setLineWidth(0.34)

  for (let index = 0; index < curves; index++) {
    const phase = (index / curves) * Math.PI * 2
    const color = index % 3 === 0 ? '#D6F0FF' : index % 3 === 1 ? '#8FC4FF' : '#5E97FF'
    const alpha = 0.1 + (index % 3) * 0.015

    ctx.setStrokeColor(new Color(color, alpha))

    const path = new Path()

    for (let step = 0; step <= segments; step++) {
      const t = step / segments
      const radius = 0.04 + t * 0.6
      const angle = phase + t * 4.6
      const x = 0.42 + Math.cos(angle) * radius
      const y = 0.47 + Math.sin(angle) * radius * 0.95
      const point = new Point(x * CANVAS, y * CANVAS)

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
// 工具
// ========================

function vignette(color: Rgb, u: number, v: number, strength: number): Rgb {
  const edge = Math.min(u, 1 - u, v, 1 - v)
  const factor = 1 - strength * Math.max(0, 1 - edge / 0.18) ** 1.6

  return { r: color.r * factor, g: color.g * factor, b: color.b * factor }
}

function mixRgb(from: Rgb, to: Rgb, ratio: number): Rgb {
  const t = clamp01(ratio)

  return {
    r: from.r + (to.r - from.r) * t,
    g: from.g + (to.g - from.g) * t,
    b: from.b + (to.b - from.b) * t,
  }
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
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
