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
    getImage(): ScriptableImage
  }

  class FileManager {
    static iCloud(): FileManager
    documentsDirectory(): string
    joinPath(lhs: string, rhs: string): string
    fileExists(path: string): boolean
    createDirectory(path: string, intermediateDirectories?: boolean): void
    downloadFileFromiCloud(path: string): Promise<void>
    readImage(path: string): ScriptableImage | null
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
    refreshAfterDate: Date
    setPadding(top: number, leading: number, bottom: number, trailing: number): void
    addText(text: string): WidgetText
    addSpacer(length?: number): void
    presentSmall(): Promise<void>
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
    lineLimit: number
    minimumScaleFactor: number
    centerAlignText(): void
  }

  interface ScriptableImage {}

  interface ScriptableRequest {
    headers: Record<string, string>
    loadJSON: () => Promise<unknown>
    loadString: () => Promise<string>
    loadImage: () => Promise<ScriptableImage>
  }
}
