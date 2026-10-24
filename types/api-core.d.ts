export {}

declare global {
  // ========================
  // 图像与数据
  // ========================

  class Image {
    // 图像尺寸（像素），只读
    readonly size: Size
    static fromFile(filePath: string): Image | null
    static fromData(data: Data): Image | null
  }

  class Data {
    static fromString(string: string): Data | null
    static fromFile(filePath: string): Data
    static fromBase64String(base64String: string): Data | null
    static fromJPEG(image: Image): Data
    static fromPNG(image: Image): Data
    static fromBytes(bytes: number[]): Data
    toRawString(): string | null
    toBase64String(): string
    getBytes(): number[]
  }

  // ========================
  // 图形路径
  // ========================

  class Path {
    constructor()
    move(point: Point): void
    addLine(point: Point): void
    addRect(rect: Rect): void
    addEllipse(rect: Rect): void
    addRoundedRect(rect: Rect, cornerWidth: number, cornerHeight: number): void
    addCurve(point: Point, control1: Point, control2: Point): void
    addQuadCurve(point: Point, control: Point): void
    addLines(points: Point[]): void
    addRects(rects: Rect[]): void
    closeSubpath(): void
  }

  // ========================
  // 标识符与 URL
  // ========================

  class UUID {
    static string(): string
  }

  class URLScheme {
    // 已废弃，改用 args.queryParameters
    static allParameters(): Record<string, string>
    // 已废弃，改用 args.queryParameters
    static parameter(name: string): string
    static forOpeningScript(): string
    static forOpeningScriptSettings(): string
    static forRunningScript(): string
  }

  class CallbackURL {
    constructor(baseURL: string)
    addParameter(name: string, value: string): void
    open(): Promise<Record<string, string>>
    getURL(): string
  }

  // ========================
  // 存储与剪贴板
  // ========================

  class Keychain {
    static contains(key: string): boolean
    static set(key: string, value: string): void
    static get(key: string): string
    static remove(key: string): void
  }

  class Pasteboard {
    static copy(string: string): void
    static paste(): string | null
    static copyString(string: string): void
    static pasteString(): string | null
    static copyImage(image: Image): void
    static pasteImage(): Image | null
  }

  // ========================
  // 模块导入
  // ========================

  // 返回导入模块的 module.exports
  function importModule(name: string): any
}
