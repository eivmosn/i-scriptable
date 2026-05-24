export {}

declare global {
  const args: {
    widgetParameter: string | null
  }

  const config: {
    runsInApp: boolean
    runsInWidget: boolean
  }

  const Script: {
    complete: () => void
    setWidget: (widget: ListWidget) => void
  }

  class Alert {
    title: string
    message: string
    addAction(title: string): void
    present(): Promise<number>
  }

  class Color {
    constructor(hex: string, alpha?: number)
    static white(): Color
    static black(): Color
    static dynamic(lightColor: Color, darkColor: Color): Color
  }

  class DateFormatter {
    dateFormat: string
    locale: string
    string(date: Date): string
  }

  class DrawContext {
    size: Size
    opaque: boolean
    respectScreenScale: boolean
    setFillColor(color: Color): void
    fillRect(rect: Rect): void
    fillEllipse(rect: Rect): void
    setStrokeColor(color: Color): void
    setLineWidth(width: number): void
    strokeRect(rect: Rect): void
    getImage(): ScriptableImage
  }

  class FileManager {
    static iCloud(): FileManager
    static local(): FileManager
    documentsDirectory(): string
    joinPath(lhs: string, rhs: string): string
    fileExists(path: string): boolean
    createDirectory(path: string, intermediateDirectories?: boolean): void
    downloadFileFromiCloud(path: string): Promise<void>
    readImage(path: string): ScriptableImage | null
    readString(path: string): string
    writeImage(path: string, image: ScriptableImage): void
    writeString(path: string, content: string): void
  }

  class Font {
    static heavySystemFont(size: number): Font
    static boldSystemFont(size: number): Font
    static semiboldSystemFont(size: number): Font
    static mediumSystemFont(size: number): Font
    static systemFont(size: number): Font
  }

  class ListWidget {
    spacing: number
    backgroundImage: ScriptableImage
    backgroundColor: Color
    url: string
    refreshAfterDate: Date
    setPadding(top: number, leading: number, bottom: number, trailing: number): void
    addText(text: string): WidgetText
    addDate(date: Date): WidgetDate
    addImage(image: ScriptableImage): WidgetImage
    addStack(): WidgetStack
    addSpacer(length?: number): void
    presentSmall(): Promise<void>
    presentMedium(): Promise<void>
  }

  class Device {
    static batteryLevel(): number
    static isCharging(): boolean
    static model(): string
    static systemName(): string
    static systemVersion(): string
  }

  class SFSymbol {
    image: ScriptableImage
    static named(name: string): SFSymbol | null
  }

  class Request {
    constructor(url: string)
    headers: Record<string, string>
    method: string
    body: string
    timeoutInterval: number
    loadJSON(): Promise<unknown>
    loadString(): Promise<string>
    loadImage(): Promise<ScriptableImage>
  }

  class Point {
    constructor(x: number, y: number)
  }

  class Rect {
    constructor(x: number, y: number, width: number, height: number)
  }

  class Size {
    constructor(width: number, height: number)
    width: number
    height: number
  }

  class WidgetText {
    font: Font
    textColor: Color
    textOpacity: number
    lineLimit: number
    minimumScaleFactor: number
    centerAlignText(): void
    leftAlignText(): void
    rightAlignText(): void
  }

  class WidgetDate extends WidgetText {
    applyTimeStyle(): void
    applyDateStyle(): void
    applyRelativeStyle(): void
    applyOffsetStyle(): void
    applyTimerStyle(): void
  }

  class WidgetImage {
    image: ScriptableImage
    imageSize: Size
    tintColor: Color
    imageOpacity: number
    cornerRadius: number
    url: string
    centerAlignImage(): void
    leftAlignImage(): void
    rightAlignImage(): void
  }

  class WidgetStack {
    spacing: number
    size: Size
    backgroundColor: Color
    backgroundImage: ScriptableImage
    cornerRadius: number
    borderColor: Color
    borderWidth: number
    url: string
    setPadding(top: number, leading: number, bottom: number, trailing: number): void
    addText(text: string): WidgetText
    addDate(date: Date): WidgetDate
    addImage(image: ScriptableImage): WidgetImage
    addStack(): WidgetStack
    addSpacer(length?: number): void
    layoutHorizontally(): void
    layoutVertically(): void
    centerAlignContent(): void
    topAlignContent(): void
    bottomAlignContent(): void
  }

  interface ScriptableImage {}

  interface ScriptableRequest {
    headers: Record<string, string>
    loadJSON: () => Promise<unknown>
    loadString: () => Promise<string>
    loadImage: () => Promise<ScriptableImage>
  }
}
