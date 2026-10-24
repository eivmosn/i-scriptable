// Scriptable 大型小组件：SIGNAL MONASTERY · 生成式 ASCII 极光海报
// 参数：amber（默认）/ cyan / violet 三套配色
export {}

interface Palette {
  ink: string
  cream: string
  dim: string
  accent: string
  accent2: string
}

interface ArtLayout {
  width: number
  height: number
  margin: number
  cell: number
  fieldTop: number
  fieldBottom: number
  orbRadius: number
  holeWidth: number
  holeHeight: number
  clockSize: number
  titleSize: number
  labelSize: number
  compact: boolean
}

interface Hole {
  cx: number
  cy: number
  width: number
  height: number
}

interface Grid {
  cols: number
  rows: number
  cellWidth: number
  cellHeight: number
}

const palettes: Record<string, Palette> = {
  amber: {
    ink: '#0A0A0C',
    cream: '#F2EADB',
    dim: '#5B5860',
    accent: '#FF6A3D',
    accent2: '#7FE3FF',
  },
  cyan: {
    ink: '#061014',
    cream: '#E6F7F4',
    dim: '#46606A',
    accent: '#3DFFC4',
    accent2: '#FFD166',
  },
  violet: {
    ink: '#0C0812',
    cream: '#F0E8FF',
    dim: '#5A4E6B',
    accent: '#B76BFF',
    accent2: '#FFB86B',
  },
}

const variant = args.widgetParameter?.trim().toLowerCase() ?? 'amber'
const palette = palettes[variant] ?? palettes.amber
const family = config.widgetFamily ?? 'large'

if (isAccessoryFamily(family))
  await presentAccessory(family, palette)
else
  await presentArt(family, palette)

Script.complete()

// ========================
// 主流程
// ========================

async function presentArt(family: string, palette: Palette): Promise<void> {
  const layout = layoutFor(family)
  const renderedAt = new Date()
  const seed = Math.floor(renderedAt.getTime() / 60000)
  const phase = (seed % 997) / 159.4

  const ctx = new DrawContext()
  ctx.size = new Size(layout.width, layout.height)
  ctx.opaque = true
  ctx.respectScreenScale = true

  paintBackdrop(ctx, layout, palette)
  paintOrbits(ctx, layout, palette)
  paintEdgeRulers(ctx, layout, palette)
  paintField(ctx, layout, palette, seed, phase)
  paintOrbitalDust(ctx, layout, palette)
  paintHolePlate(ctx, layout, palette, seed)
  paintTexture(ctx, layout, palette, seed)
  paintChrome(ctx, layout, palette, seed, phase, renderedAt)

  const widget = new ListWidget()
  widget.setPadding(0, 0, 0, 0)
  widget.backgroundImage = ctx.getImage()
  widget.url = URLScheme.forRunningScript()
  widget.refreshAfterDate = new Date(Date.now() + 30 * 60 * 1000)

  addLiveClock(widget, layout, palette)

  if (config.runsInWidget) {
    Script.setWidget(widget)
    return
  }

  if (family === 'small')
    await widget.presentSmall()
  else if (family === 'medium')
    await widget.presentMedium()
  else
    await widget.presentLarge()
}

async function presentAccessory(family: string, palette: Palette): Promise<void> {
  const widget = new ListWidget()
  const now = new Date()

  widget.addAccessoryWidgetBackground = true
  widget.setPadding(4, 6, 4, 6)

  if (family === 'accessoryInline') {
    const text = widget.addText('SIGNAL MONASTERY')
    text.font = Font.semiboldSystemFont(12)
    text.textColor = new Color(palette.cream)
    text.lineLimit = 1
  }
  else if (family === 'accessoryCircular') {
    const clock = widget.addDate(startOfDay(now))
    clock.applyTimerStyle()
    clock.font = Font.regularMonospacedSystemFont(11)
    clock.textColor = new Color(palette.cream)
    clock.lineLimit = 1
    clock.minimumScaleFactor = 0.5
  }
  else {
    const row = widget.addStack()
    row.layoutHorizontally()
    row.centerAlignContent()

    const mark = row.addText('SIG')
    mark.font = Font.heavySystemFont(11)
    mark.textColor = new Color(palette.accent)
    mark.lineLimit = 1

    row.addSpacer(4)

    const clock = row.addDate(startOfDay(now))
    clock.applyTimerStyle()
    clock.font = Font.regularMonospacedSystemFont(12)
    clock.textColor = new Color(palette.cream)
    clock.lineLimit = 1
    clock.minimumScaleFactor = 0.5
  }

  if (config.runsInWidget) {
    Script.setWidget(widget)
    return
  }

  if (family === 'accessoryInline')
    await widget.presentAccessoryInline()
  else if (family === 'accessoryCircular')
    await widget.presentAccessoryCircular()
  else
    await widget.presentAccessoryRectangular()
}

function addLiveClock(widget: ListWidget, layout: ArtLayout, palette: Palette): void {
  widget.addSpacer()

  const row = widget.addStack()
  row.layoutHorizontally()
  row.centerAlignContent()
  row.addSpacer()

  const clock = row.addDate(startOfDay(new Date()))
  clock.applyTimerStyle()
  clock.font = Font.regularMonospacedSystemFont(layout.clockSize)
  clock.textColor = new Color(palette.cream)
  clock.textOpacity = 0.94
  clock.lineLimit = 1
  clock.minimumScaleFactor = 0.6

  row.addSpacer()
  widget.addSpacer()
}

// ========================
// 版面
// ========================

function layoutFor(family: string): ArtLayout {
  if (family === 'small') {
    return {
      width: 180,
      height: 180,
      margin: 11,
      cell: 4.4,
      fieldTop: 34,
      fieldBottom: 142,
      orbRadius: 16,
      holeWidth: 138,
      holeHeight: 58,
      clockSize: 19,
      titleSize: 5.4,
      labelSize: 4.6,
      compact: true,
    }
  }

  if (family === 'medium') {
    return {
      width: 360,
      height: 172,
      margin: 16,
      cell: 7,
      fieldTop: 40,
      fieldBottom: 134,
      orbRadius: 30,
      holeWidth: 200,
      holeHeight: 70,
      clockSize: 27,
      titleSize: 7,
      labelSize: 5.4,
      compact: true,
    }
  }

  return {
    width: 360,
    height: 380,
    margin: 16,
    cell: 7,
    fieldTop: 46,
    fieldBottom: 304,
    orbRadius: 50,
    holeWidth: 236,
    holeHeight: 112,
    clockSize: 40,
    titleSize: 9,
    labelSize: 5.8,
    compact: false,
  }
}

function gridFor(layout: ArtLayout): Grid {
  const areaWidth = layout.width - layout.margin * 2
  const areaHeight = layout.fieldBottom - layout.fieldTop
  const cols = Math.floor(areaWidth / layout.cell)
  const rows = Math.floor(areaHeight / layout.cell)

  return {
    cols,
    rows,
    cellWidth: areaWidth / cols,
    cellHeight: areaHeight / rows,
  }
}

function holeFor(layout: ArtLayout): Hole {
  return {
    cx: layout.width / 2,
    cy: layout.height / 2,
    width: layout.holeWidth,
    height: layout.holeHeight,
  }
}

// ========================
// 底层：墨、光晕、轨道、标尺
// ========================

function paintBackdrop(ctx: DrawContext, layout: ArtLayout, palette: Palette): void {
  ctx.setFillColor(new Color(palette.ink))
  ctx.fillRect(new Rect(0, 0, layout.width, layout.height))

  paintGlow(ctx, layout.width * 0.78, layout.height * 0.2, layout.width * 0.95, palette.accent, 0.05)
  paintGlow(ctx, layout.width * 0.16, layout.height * 0.84, layout.width * 0.8, palette.accent2, 0.04)
  paintGlow(ctx, layout.width * 0.5, layout.height * 0.5, layout.width * 0.6, palette.cream, 0.025)

  ctx.setFillColor(new Color('#000000', 0.3))
  ctx.fillRect(new Rect(0, 0, layout.width, layout.fieldTop - 12))
  ctx.setFillColor(new Color('#000000', 0.34))
  ctx.fillRect(new Rect(0, layout.fieldBottom + 6, layout.width, layout.height - layout.fieldBottom - 6))
}

function paintGlow(ctx: DrawContext, cx: number, cy: number, diameter: number, color: string, alpha: number): void {
  const steps = 7

  for (let i = 0; i < steps; i++) {
    const size = diameter * (1 - i * 0.115)
    ctx.setFillColor(new Color(color, alpha * (0.32 + i * 0.11)))
    ctx.fillEllipse(new Rect(cx - size / 2, cy - size / 2, size, size))
  }
}

function paintOrbits(ctx: DrawContext, layout: ArtLayout, palette: Palette): void {
  const hole = holeFor(layout)

  ctx.setLineWidth(0.7)

  for (const scale of [0.62, 0.8, 0.98]) {
    const width = layout.width * scale
    const height = width * 0.72

    ctx.setStrokeColor(new Color(palette.accent2, 0.1))
    ctx.strokeEllipse(new Rect(hole.cx - width / 2, hole.cy - height / 2, width, height))
  }

  ctx.setStrokeColor(new Color(palette.accent, 0.16))
  ctx.strokeRect(new Rect(
    layout.margin,
    layout.fieldTop,
    layout.width - layout.margin * 2,
    layout.fieldBottom - layout.fieldTop,
  ))
}

function paintOrbitalDust(ctx: DrawContext, layout: ArtLayout, palette: Palette): void {
  const orb = orbFor(layout)
  const radius = orb.radius + 9

  ctx.setLineWidth(0.5)
  ctx.setStrokeColor(new Color(palette.accent2, 0.12))
  ctx.strokeEllipse(new Rect(orb.cx - radius, orb.cy - radius, radius * 2, radius * 2))
  ctx.setStrokeColor(new Color(palette.accent, 0.22))
  ctx.strokeEllipse(new Rect(orb.cx - orb.radius, orb.cy - orb.radius, orb.radius * 2, orb.radius * 2))

  ctx.setFillColor(new Color(palette.accent2, 0.5))

  for (let index = 0; index < 96; index++) {
    if (index % 3 === 0)
      continue

    const angle = (index / 96) * Math.PI * 2
    const x = orb.cx + Math.cos(angle) * radius
    const y = orb.cy + Math.sin(angle) * radius

    ctx.fillRect(new Rect(x, y, 1.1, 1.1))
  }

  ctx.setFillColor(new Color(palette.cream, 0.4))

  for (const angle of [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]) {
    const x = orb.cx + Math.cos(angle) * (radius + 6)
    const y = orb.cy + Math.sin(angle) * (radius + 6)
    ctx.fillRect(new Rect(x - 2, y - 0.3, 4, 0.6))
    ctx.fillRect(new Rect(x - 0.3, y - 2, 0.6, 4))
  }
}

function paintEdgeRulers(ctx: DrawContext, layout: ArtLayout, palette: Palette): void {
  const step = 18
  let index = 0

  ctx.setFillColor(new Color(palette.cream, 0.3))

  for (let y = layout.fieldTop; y < layout.fieldBottom; y += step) {
    const length = index % 4 === 0 ? 5 : 3

    ctx.fillRect(new Rect(layout.margin - 8, y, length, 0.7))
    ctx.fillRect(new Rect(layout.width - layout.margin + 8 - length, y, length, 0.7))

    index++
  }
}

// ========================
// ASCII 强度场
// ========================

interface Orb {
  cx: number
  cy: number
  radius: number
}

interface OrbSample {
  value: number
  rim: number
  highlight: number
}

function paintField(
  ctx: DrawContext,
  layout: ArtLayout,
  palette: Palette,
  seed: number,
  phase: number,
): void {
  const grid = gridFor(layout)
  const hole = holeFor(layout)
  const orb = orbFor(layout)
  const ramp = ' .:-=+*#%@'
  const font = new Font('Menlo', grid.cellHeight * 0.94)
  const occupied = new Set<string>()

  ctx.setFont(font)
  ctx.setTextAlignedCenter()

  // 相位场的整数等值线：逐列求解，保证线条连续
  for (let col = 0; col < grid.cols; col++) {
    const u = (col + 0.5) / grid.cols
    const warp = 0.42 * Math.sin(u * 4.1 + phase)
      + 0.22 * Math.cos(u * 6.8 - phase * 0.8)
      + 0.16 * Math.sin(u * 5 + phase * 1.7)

    for (let line = -1; line <= 9; line++) {
      const v = (line - warp) / 7.3

      if (v < 0 || v > 1)
        continue

      const row = Math.round(v * grid.rows)
      if (row < 0 || row >= grid.rows)
        continue
      if (isOrbCell(col, row, layout, grid, orb))
        continue
      if (hash(col, line, seed + 29) <= 0.12)
        continue

      const strength = 0.62 + hash(col, line, seed + 11) * 0.38
      const char = ramp[4 + Math.round(hash(col, line, seed + 31) * 2)]
      let color: Color

      if (line % 3 === 1)
        color = new Color(palette.accent2, 0.5)
      else
        color = new Color(palette.cream, 0.42 + strength * 0.4)

      if (u > 0.58 && line % 4 === 2 && hash(col, line, seed + 41) > 0.6)
        color = new Color(palette.accent, 0.72)

      drawFieldChar(ctx, layout, grid, hole, col, row, char, color, occupied)

      if (line % 2 === 0)
        drawFieldChar(ctx, layout, grid, hole, col, row + 1, '·', new Color(palette.cream, 0.25), occupied)
    }
  }

  // 稀薄尘埃
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      if (isOrbCell(col, row, layout, grid, orb))
        continue
      if (hash(col, row, seed + 23) > 0.9)
        drawFieldChar(ctx, layout, grid, hole, col, row, '.', new Color(palette.dim, 0.7), occupied)
    }
  }

  // ASCII 星球
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const cellX = layout.margin + col * grid.cellWidth
      const cellY = layout.fieldTop + row * grid.cellHeight
      const cx = cellX + grid.cellWidth / 2
      const cy = cellY + grid.cellHeight / 2

      if (insideHole(cx, cy, hole))
        continue

      const dx = (cx - orb.cx) / orb.radius
      const dy = (cy - orb.cy) / orb.radius
      const distance = Math.hypot(dx, dy)

      if (distance > 1.08)
        continue

      // 星体外圈的光环
      if (distance > 0.96) {
        if (hash(col, row, seed + 43) > 0.45) {
          ctx.setTextColor(new Color(palette.accent, 0.6))
          ctx.drawTextInRect(hash(col, row, seed + 47) > 0.5 ? '+' : '·', new Rect(cellX, cellY, grid.cellWidth, grid.cellHeight))
          continue
        }
      }

      const sample = orbSample(dx, dy, distance, hash(col, row, seed + 3))
      if (sample.value < 0.11)
        continue

      const index = Math.round(sample.value * (ramp.length - 1))
      const char = ramp[index]

      if (char === ' ')
        continue

      ctx.setTextColor(orbColor(sample, distance, palette))
      ctx.drawTextInRect(char, new Rect(cellX, cellY, grid.cellWidth, grid.cellHeight))
    }
  }
}

function isOrbCell(col: number, row: number, layout: ArtLayout, grid: Grid, orb: Orb): boolean {
  const cx = layout.margin + (col + 0.5) * grid.cellWidth
  const cy = layout.fieldTop + (row + 0.5) * grid.cellHeight

  return Math.hypot(cx - orb.cx, cy - orb.cy) <= orb.radius * 1.12
}

function drawFieldChar(
  ctx: DrawContext,
  layout: ArtLayout,
  grid: Grid,
  hole: Hole,
  col: number,
  row: number,
  char: string,
  color: Color,
  occupied: Set<string>,
): void {
  if (row < 0 || row >= grid.rows || col < 0 || col >= grid.cols)
    return

  const key = `${col},${row}`
  if (occupied.has(key))
    return

  const x = layout.margin + col * grid.cellWidth
  const y = layout.fieldTop + row * grid.cellHeight
  const cx = x + grid.cellWidth / 2
  const cy = y + grid.cellHeight / 2

  if (insideHole(cx, cy, hole))
    return

  occupied.add(key)
  ctx.setTextColor(color)
  ctx.drawTextInRect(char, new Rect(x, y, grid.cellWidth, grid.cellHeight))
}

function orbFor(layout: ArtLayout): Orb {
  return {
    cx: layout.width - layout.margin - layout.orbRadius - 6,
    cy: layout.fieldTop + layout.orbRadius + 12,
    radius: layout.orbRadius,
  }
}

function orbSample(dx: number, dy: number, distance: number, noise: number): OrbSample {
  if (distance > 1.06)
    return { value: 0.06 + noise * 0.08, rim: 0, highlight: 0 }

  const light = 0.72 - 0.32 * dx - 0.26 * dy
  const shade = Math.max(0, 1 - distance * distance) ** 0.72 * Math.max(0.25, light)
  const texture = 0.62 + 0.38 * noise
  const highlight = Math.exp(-(((dx + 0.3) ** 2 + (dy + 0.28) ** 2) / 0.03)) * 0.55
  const limb = Math.exp(-(((distance - 0.9) / 0.05) ** 2)) * 0.95
  const value = Math.min(1, shade * texture + highlight + limb * 0.3)

  return { value, rim: limb, highlight }
}

function orbColor(sample: OrbSample, distance: number, palette: Palette): Color {
  if (distance > 1.06)
    return new Color(palette.accent2, 0.45)
  if (sample.highlight > 0.3)
    return new Color(palette.cream, 1)
  if (sample.rim > 0.5)
    return new Color(palette.accent, 0.95)
  if (sample.value > 0.55)
    return new Color(palette.cream, 0.85)
  if (sample.value > 0.25)
    return new Color(palette.cream, 0.6)

  return new Color(palette.dim, 0.85)
}

function insideHole(x: number, y: number, hole: Hole): boolean {
  return Math.abs(x - hole.cx) <= hole.width / 2 + 4 && Math.abs(y - hole.cy) <= hole.height / 2 + 4
}

// ========================
// 中央活版：时钟铭牌
// ========================

function paintHolePlate(ctx: DrawContext, layout: ArtLayout, palette: Palette, seed: number): void {
  const hole = holeFor(layout)
  const x = hole.cx - hole.width / 2
  const y = hole.cy - hole.height / 2
  const radius = 12
  const labelFont = new Font('Menlo', layout.labelSize)

  fillRoundedRect(ctx, new Rect(x - 10, y - 10, hole.width + 20, hole.height + 20), radius + 8, new Color(palette.ink, 0.55))
  fillRoundedRect(ctx, new Rect(x, y, hole.width, hole.height), radius, new Color(palette.ink, 0.93))
  strokeRoundedRect(ctx, new Rect(x, y, hole.width, hole.height), radius, new Color(palette.cream, 0.24), 0.7)
  strokeRoundedRect(ctx, new Rect(x + 3, y + 3, hole.width - 6, hole.height - 6), radius - 4, new Color(palette.cream, 0.08), 0.5)

  ctx.setFillColor(new Color(palette.accent, 0.6))
  const tick = 7
  const corners: [number, number][] = [
    [x - 13, y - 13],
    [x + hole.width + 13, y - 13],
    [x - 13, y + hole.height + 13],
    [x + hole.width + 13, y + hole.height + 13],
  ]

  for (const [tx, ty] of corners) {
    ctx.fillRect(new Rect(tx - tick / 2, ty - 0.4, tick, 0.8))
    ctx.fillRect(new Rect(tx - 0.4, ty - tick / 2, 0.8, tick))
  }

  drawLabel(ctx, '●   L I V E   S I G N A L', new Rect(x, y + 12, hole.width, 9), labelFont, new Color(palette.accent, 0.8), 'center')
  drawLabel(ctx, `PLATE ${String(seed % 1000).padStart(3, '0')}  /  LOCAL MEAN TIME`, new Rect(x, y + hole.height - 21, hole.width, 9), labelFont, new Color(palette.dim), 'center')

  clearPlate(ctx, new Rect(hole.cx - 150, y - 15, 300, 10), palette)
  drawLabel(ctx, 'T I M E   S I G N A L', new Rect(hole.cx - 150, y - 15, 300, 9), labelFont, new Color(palette.cream, 0.7), 'center')

  clearPlate(ctx, new Rect(hole.cx - 170, y + hole.height + 6, 340, 10), palette)
  drawLabel(ctx, 'UTC+08:00   /   LIVE   /   NO IMAGES', new Rect(hole.cx - 170, y + hole.height + 6, 340, 9), labelFont, new Color(palette.dim), 'center')
}

function clearPlate(ctx: DrawContext, rect: Rect, palette: Palette): void {
  ctx.setFillColor(new Color(palette.ink, 0.88))
  ctx.fillRect(rect)
}

function fillRoundedRect(ctx: DrawContext, rect: Rect, radius: number, color: Color): void {
  const path = new Path()
  path.addRoundedRect(rect, radius, radius)
  ctx.setFillColor(color)
  ctx.addPath(path)
  ctx.fillPath()
}

function strokeRoundedRect(ctx: DrawContext, rect: Rect, radius: number, color: Color, lineWidth: number): void {
  const path = new Path()
  path.addRoundedRect(rect, radius, radius)
  ctx.setStrokeColor(color)
  ctx.setLineWidth(lineWidth)
  ctx.addPath(path)
  ctx.strokePath()
}

// ========================
// 肌理：扫描线、颗粒
// ========================

function paintTexture(ctx: DrawContext, layout: ArtLayout, palette: Palette, seed: number): void {
  ctx.setFillColor(new Color('#000000', 0.06))

  for (let y = 0; y < layout.height; y += 3)
    ctx.fillRect(new Rect(0, y, layout.width, 0.6))

  for (let index = 0; index < 900; index++) {
    const x = hash(index, 7, seed) * layout.width
    const y = hash(index, 11, seed) * layout.height
    const alpha = 0.02 + hash(index, 13, seed) * 0.05
    const color = index % 3 === 0 ? palette.cream : '#000000'

    ctx.setFillColor(new Color(color, alpha))
    ctx.fillRect(new Rect(x, y, 1, 1))
  }
}

// ========================
// 版面标注：标题、标尺、色卡、条码、微文字
// ========================

function paintChrome(
  ctx: DrawContext,
  layout: ArtLayout,
  palette: Palette,
  seed: number,
  phase: number,
  renderedAt: Date,
): void {
  const grid = gridFor(layout)
  const margin = layout.margin
  const innerWidth = layout.width - margin * 2
  const ruleColor = new Color(palette.cream, 0.28)
  const titleFont = new Font('Menlo-Bold', layout.titleSize)
  const metaFont = new Font('Menlo', layout.labelSize)
  const dimColor = new Color(palette.dim)
  const creamColor = new Color(palette.cream, 0.9)

  ctx.setFillColor(ruleColor)
  ctx.fillRect(new Rect(margin, layout.fieldTop - 10, innerWidth, 0.6))

  ctx.setFillColor(new Color(palette.accent, 0.9))
  ctx.fillRect(new Rect(layout.width - margin - 20, layout.fieldTop - 10.5, 20, 1.4))

  drawLabel(ctx, 'SIGNAL  MONASTERY', new Rect(margin, layout.fieldTop - 30, innerWidth, 11), titleFont, creamColor, 'left')
  drawLabel(ctx, `SPECIMEN ${String(seed % 1000).padStart(3, '0')} / ${variant.toUpperCase()}`, new Rect(margin, layout.fieldTop - 19, innerWidth * 0.7, 9), metaFont, dimColor, 'left')
  drawLabel(ctx, formatDate(renderedAt), new Rect(margin, layout.fieldTop - 30, innerWidth, 11), new Font('Menlo', layout.titleSize - 1), creamColor, 'right')
  drawLabel(ctx, `${formatTime(renderedAt)}  CST`, new Rect(margin, layout.fieldTop - 19, innerWidth, 9), metaFont, dimColor, 'right')

  const bottomRule = layout.fieldBottom + 10

  ctx.setFillColor(ruleColor)
  ctx.fillRect(new Rect(margin, bottomRule, innerWidth, 0.6))

  if (!layout.compact) {
    drawLabel(ctx, `FIELD ${grid.cols}×${grid.rows}  ·  PROCEDURAL`, new Rect(margin, bottomRule + 7, innerWidth * 0.62, 9), metaFont, creamColor, 'left')
    drawLabel(ctx, `SEED ${seed}  ·  PHASE ${phase.toFixed(2)}`, new Rect(margin, bottomRule + 18, innerWidth * 0.62, 9), metaFont, dimColor, 'left')
    drawLabel(ctx, 'GRID 34.2 / 118.1', new Rect(margin, bottomRule + 29, innerWidth * 0.62, 9), metaFont, dimColor, 'left')

    paintSwatches(ctx, margin, layout.height - margin - 7, palette)
    ctx.setFillColor(new Color(palette.cream, 0.75))
    drawBarcode(ctx, layout.width - margin - 108, bottomRule + 7, 108, 26, seed)

    drawLabel(ctx, 'A   S T U D Y   O F   S I G N A L   D E C A Y', new Rect(margin, layout.height - margin + 1, innerWidth, 9), new Font('Menlo', layout.labelSize - 0.4), new Color(palette.dim), 'center')
  }
  else {
    drawLabel(ctx, `FIELD ${grid.cols}×${grid.rows}  ·  SEED ${seed}  ·  PROCEDURAL`, new Rect(margin, bottomRule + 5, innerWidth * 0.7, 9), metaFont, dimColor, 'left')
    ctx.setFillColor(new Color(palette.cream, 0.7))
    drawBarcode(ctx, layout.width - margin - 74, bottomRule + 5, 74, 20, seed)
  }

  drawCornerMarks(ctx, layout, palette)

  // 星球观测标注
  const orb = orbFor(layout)
  const orbLabelFont = new Font('Menlo', layout.labelSize)
  const labelX = orb.cx - orb.radius - 60
  const labelY = orb.cy - 16

  ctx.setFillColor(new Color(palette.ink, 0.85))
  ctx.fillRect(new Rect(labelX - 2, labelY - 2, 62, 22))
  drawLabel(ctx, 'OBJ.01', new Rect(labelX, labelY, 52, 9), orbLabelFont, new Color(palette.cream, 0.72), 'left')
  drawLabel(ctx, 'MAG 4.2', new Rect(labelX, labelY + 10, 52, 9), orbLabelFont, new Color(palette.dim), 'left')
  ctx.setFillColor(new Color(palette.accent, 0.55))
  ctx.fillRect(new Rect(labelX + 50, labelY + 12, 8, 0.7))
}

function drawLabel(
  ctx: DrawContext,
  text: string,
  rect: Rect,
  font: Font,
  color: Color,
  align: 'left' | 'center' | 'right',
): void {
  ctx.setFont(font)
  ctx.setTextColor(color)

  if (align === 'left')
    ctx.setTextAlignedLeft()
  else if (align === 'right')
    ctx.setTextAlignedRight()
  else
    ctx.setTextAlignedCenter()

  ctx.drawTextInRect(text, rect)
}

function paintSwatches(ctx: DrawContext, x: number, y: number, palette: Palette): void {
  const colors = [palette.cream, palette.accent, palette.accent2, palette.dim]

  for (let index = 0; index < colors.length; index++) {
    ctx.setFillColor(new Color(colors[index], 0.9))
    ctx.fillRect(new Rect(x + index * 12, y, 7, 7))
  }
}

function drawBarcode(
  ctx: DrawContext,
  x: number,
  y: number,
  width: number,
  height: number,
  seed: number,
): void {
  let cursor = x
  let index = 0

  while (cursor < x + width) {
    const barWidth = 1 + hash(index, 17, seed) * 2.2
    const gap = 0.8 + hash(index, 19, seed) * 1.6

    if (index % 7 !== 3)
      ctx.fillRect(new Rect(cursor, y, barWidth, height))

    cursor += barWidth + gap
    index++
  }
}

function drawCornerMarks(ctx: DrawContext, layout: ArtLayout, palette: Palette): void {
  const offset = 7
  const length = 7
  const marks: [number, number][] = [
    [offset, offset],
    [layout.width - offset, offset],
    [offset, layout.height - offset],
    [layout.width - offset, layout.height - offset],
  ]

  ctx.setFillColor(new Color(palette.cream, 0.32))

  for (const [x, y] of marks) {
    ctx.fillRect(new Rect(x - length / 2, y, length, 0.7))
    ctx.fillRect(new Rect(x, y - length / 2, 0.7, length))
  }
}

// ========================
// 工具
// ========================

function isAccessoryFamily(family: string): boolean {
  return family === 'accessoryInline' || family === 'accessoryCircular' || family === 'accessoryRectangular'
}

function hash(x: number, y: number, seed: number): number {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 0.731) * 43758.5453
  return value - Math.floor(value)
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}.${month}.${day}`
}

function formatTime(date: Date): string {
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${hours}:${minutes}`
}
