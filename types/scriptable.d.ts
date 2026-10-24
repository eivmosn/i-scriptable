export {}

declare global {
  // ========================
  // 运行环境
  // ========================

  const args: {
    readonly length: number
    readonly all: unknown[]
    readonly plainTexts: string[]
    readonly urls: string[]
    readonly fileURLs: string[]
    readonly images: ScriptableImage[]
    readonly queryParameters: Record<string, string>
    readonly siriShortcutArguments: Record<string, string>
    readonly shortcutParameter: unknown
    readonly widgetParameter: string | null
    readonly notification: Notification
  }

  const config: {
    readonly runsInApp: boolean
    readonly runsInActionExtension: boolean
    readonly runsWithSiri: boolean
    readonly runsInWidget: boolean
    readonly runsInAccessoryWidget: boolean
    readonly runsInNotification: boolean
    readonly runsFromHomeScreen: boolean
    readonly widgetFamily: string | null
  }

  const Script: {
    name: () => string
    complete: () => void
    setShortcutOutput: (value: unknown) => void
    setWidget: (widget: ListWidget) => void
  }

  // ========================
  // 基础数据类型
  // ========================

  class Color {
    constructor(hex: string, alpha?: number)
    readonly hex: string
    readonly red: number
    readonly green: number
    readonly blue: number
    readonly alpha: number
    static black(): Color
    static darkGray(): Color
    static lightGray(): Color
    static white(): Color
    static gray(): Color
    static red(): Color
    static green(): Color
    static blue(): Color
    static cyan(): Color
    static yellow(): Color
    static magenta(): Color
    static orange(): Color
    static purple(): Color
    static brown(): Color
    static clear(): Color
    static dynamic(lightColor: Color, darkColor: Color): Color
  }

  class LinearGradient {
    constructor()
    colors: Color[]
    locations: number[]
    startPoint: Point
    endPoint: Point
  }

  class Point {
    constructor(x: number, y: number)
    x: number
    y: number
  }

  class Size {
    constructor(width: number, height: number)
    width: number
    height: number
  }

  class Rect {
    constructor(x: number, y: number, width: number, height: number)
    readonly minX: number
    readonly minY: number
    readonly maxX: number
    readonly maxY: number
    x: number
    y: number
    width: number
    height: number
    origin: Point
    size: Size
  }

  // ========================
  // 文本
  // ========================

  class Font {
    constructor(name: string, size: number)
    static largeTitle(): Font
    static title1(): Font
    static title2(): Font
    static title3(): Font
    static headline(): Font
    static subheadline(): Font
    static body(): Font
    static callout(): Font
    static footnote(): Font
    static caption1(): Font
    static caption2(): Font
    static systemFont(size: number): Font
    static ultraLightSystemFont(size: number): Font
    static thinSystemFont(size: number): Font
    static lightSystemFont(size: number): Font
    static regularSystemFont(size: number): Font
    static mediumSystemFont(size: number): Font
    static semiboldSystemFont(size: number): Font
    static boldSystemFont(size: number): Font
    static heavySystemFont(size: number): Font
    static blackSystemFont(size: number): Font
    static italicSystemFont(size: number): Font
    static ultraLightMonospacedSystemFont(size: number): Font
    static thinMonospacedSystemFont(size: number): Font
    static lightMonospacedSystemFont(size: number): Font
    static regularMonospacedSystemFont(size: number): Font
    static mediumMonospacedSystemFont(size: number): Font
    static semiboldMonospacedSystemFont(size: number): Font
    static boldMonospacedSystemFont(size: number): Font
    static heavyMonospacedSystemFont(size: number): Font
    static blackMonospacedSystemFont(size: number): Font
    static ultraLightRoundedSystemFont(size: number): Font
    static thinRoundedSystemFont(size: number): Font
    static lightRoundedSystemFont(size: number): Font
    static regularRoundedSystemFont(size: number): Font
    static mediumRoundedSystemFont(size: number): Font
    static semiboldRoundedSystemFont(size: number): Font
    static boldRoundedSystemFont(size: number): Font
    static heavyRoundedSystemFont(size: number): Font
    static blackRoundedSystemFont(size: number): Font
  }

  class DateFormatter {
    constructor()
    dateFormat: string
    locale: string
    string(date: Date): string
    date(str: string): Date | null
    useNoDateStyle(): void
    useShortDateStyle(): void
    useMediumDateStyle(): void
    useLongDateStyle(): void
    useFullDateStyle(): void
    useNoTimeStyle(): void
    useShortTimeStyle(): void
    useMediumTimeStyle(): void
    useLongTimeStyle(): void
    useFullTimeStyle(): void
  }

  // ========================
  // 文件与网络
  // ========================

  class FileManager {
    static iCloud(): FileManager
    static local(): FileManager
    documentsDirectory(): string
    libraryDirectory(): string
    temporaryDirectory(): string
    // 兼容旧命名（官方为 temporaryDirectory）
    tempDirectory(): string
    cacheDirectory(): string
    joinPath(lhsPath: string, rhsPath: string): string
    fileName(filePath: string, includeFileExtension?: boolean): string
    fileExtension(filePath: string): string
    fileExists(filePath: string): boolean
    isDirectory(path: string): boolean
    createDirectory(path: string, intermediateDirectories?: boolean): void
    read(filePath: string): Data
    readString(filePath: string): string
    readImage(filePath: string): ScriptableImage | null
    write(filePath: string, content: Data): void
    writeString(filePath: string, content: string): void
    writeImage(filePath: string, image: Image): void
    remove(filePath: string): void
    copy(sourceFilePath: string, destinationFilePath: string): void
    move(sourceFilePath: string, destinationFilePath: string): void
    listContents(directoryPath: string): string[]
    downloadFileFromiCloud(filePath: string): Promise<void>
    isFileStoredIniCloud(filePath: string): boolean
    isFileDownloaded(filePath: string): boolean
    allTags(filePath: string): string[]
    addTag(filePath: string, tag: string): void
    removeTag(filePath: string, tag: string): void
    readExtendedAttribute(filePath: string, name: string): string | null
    writeExtendedAttribute(filePath: string, value: string, name: string): void
    removeExtendedAttribute(filePath: string, name: string): void
    allExtendedAttributes(filePath: string): string[]
    getUTI(filePath: string): string
    bookmarkedPath(name: string): string
    bookmarkExists(name: string): boolean
    creationDate(filePath: string): Date
    modificationDate(filePath: string): Date
    fileSize(filePath: string): number
    allFileBookmarks(): { name: string, source: string }[]
  }

  class Request {
    constructor(url: string)
    url: string
    headers: Record<string, string>
    method: string
    body: string | Data
    timeoutInterval: number
    onRedirect: ((request: Request) => Request | null) | null
    readonly response: Record<string, unknown>
    allowInsecureRequest: boolean
    load(): Promise<Data>
    loadJSON(): Promise<unknown>
    loadString(): Promise<string>
    loadImage(): Promise<ScriptableImage>
    addParameterToMultipart(name: string, value: string): void
    addFileDataToMultipart(data: Data, mimeType: string, name: string, filename: string): void
    addFileToMultipart(filePath: string, name: string, filename?: string): void
    addImageToMultipart(image: Image, name: string, filename?: string): void
  }

  // ========================
  // 设备与系统
  // ========================

  class Device {
    static name(): string
    static systemName(): string
    static systemVersion(): string
    static model(): string
    static isPhone(): boolean
    static isPad(): boolean
    static screenSize(): Size
    static screenResolution(): Size
    static screenScale(): number
    static screenBrightness(): number
    static isInPortrait(): boolean
    static isInPortraitUpsideDown(): boolean
    static isInLandscapeLeft(): boolean
    static isInLandscapeRight(): boolean
    static isFaceUp(): boolean
    static isFaceDown(): boolean
    static batteryLevel(): number
    static isDischarging(): boolean
    static isCharging(): boolean
    static isFullyCharged(): boolean
    static preferredLanguages(): string[]
    static locale(): string
    static language(): string
    static isUsingDarkAppearance(): boolean
    static volume(): number
    static setScreenBrightness(percentage: number): void
  }

  class Alert {
    constructor()
    title: string
    message: string
    addAction(title: string): void
    addDestructiveAction(title: string): void
    addCancelAction(title: string): void
    addTextField(placeholder?: string, text?: string): TextField
    addSecureTextField(placeholder?: string, text?: string): TextField
    textFieldValue(index: number): string
    present(): Promise<number>
    presentAlert(): Promise<number>
    presentSheet(): Promise<number>
  }

  class SFSymbol {
    readonly image: ScriptableImage
    static named(symbolName: string): SFSymbol | null
    applyFont(font: Font): void
    applyUltraLightWeight(): void
    applyThinWeight(): void
    applyLightWeight(): void
    applyRegularWeight(): void
    applyMediumWeight(): void
    applySemiboldWeight(): void
    applyBoldWeight(): void
    applyHeavyWeight(): void
    applyBlackWeight(): void
  }

  // ========================
  // 绘制
  // ========================

  class DrawContext {
    constructor()
    size: Size
    respectScreenScale: boolean
    opaque: boolean
    getImage(): ScriptableImage
    drawImageInRect(image: ScriptableImage, rect: Rect): void
    drawImageAtPoint(image: ScriptableImage, point: Point): void
    setFillColor(color: Color): void
    setStrokeColor(color: Color): void
    setLineWidth(width: number): void
    fill(rect: Rect): void
    fillRect(rect: Rect): void
    fillEllipse(rect: Rect): void
    stroke(rect: Rect): void
    strokeRect(rect: Rect): void
    strokeEllipse(rect: Rect): void
    addPath(path: Path): void
    strokePath(): void
    fillPath(): void
    drawText(text: string, pos: Point): void
    drawTextInRect(text: string, rect: Rect): void
    setFontSize(size: number): void
    setFont(font: Font): void
    setTextColor(color: Color): void
    setTextAlignedLeft(): void
    setTextAlignedCenter(): void
    setTextAlignedRight(): void
  }

  // ========================
  // 小组件
  // ========================

  class ListWidget {
    constructor()
    backgroundColor: Color
    backgroundImage: ScriptableImage
    backgroundGradient: LinearGradient
    addAccessoryWidgetBackground: boolean
    spacing: number
    url: string
    refreshAfterDate: Date | null
    addText(text: string): WidgetText
    addDate(date: Date): WidgetDate
    addImage(image: ScriptableImage): WidgetImage
    addSpacer(length?: number | null): WidgetSpacer
    addStack(): WidgetStack
    setPadding(top: number, leading: number, bottom: number, trailing: number): void
    useDefaultPadding(): void
    presentSmall(): Promise<void>
    presentMedium(): Promise<void>
    presentLarge(): Promise<void>
    presentExtraLarge(): Promise<void>
    presentAccessoryInline(): Promise<void>
    presentAccessoryCircular(): Promise<void>
    presentAccessoryRectangular(): Promise<void>
  }

  class WidgetText {
    text: string
    textColor: Color
    font: Font
    textOpacity: number
    lineLimit: number
    minimumScaleFactor: number
    shadowColor: Color
    shadowRadius: number
    shadowOffset: Point
    url: string
    leftAlignText(): void
    centerAlignText(): void
    rightAlignText(): void
  }

  class WidgetDate {
    date: Date
    textColor: Color
    font: Font
    textOpacity: number
    lineLimit: number
    minimumScaleFactor: number
    shadowColor: Color
    shadowRadius: number
    shadowOffset: Point
    url: string
    leftAlignText(): void
    centerAlignText(): void
    rightAlignText(): void
    applyTimeStyle(): void
    applyDateStyle(): void
    applyRelativeStyle(): void
    applyOffsetStyle(): void
    applyTimerStyle(): void
  }

  class WidgetImage {
    image: ScriptableImage
    resizable: boolean
    imageSize: Size | null
    imageOpacity: number
    cornerRadius: number
    borderWidth: number
    borderColor: Color
    containerRelativeShape: boolean
    tintColor: Color | null
    url: string
    leftAlignImage(): void
    centerAlignImage(): void
    rightAlignImage(): void
    applyFittingContentMode(): void
    applyFillingContentMode(): void
  }

  class WidgetSpacer {
    length: number
  }

  class WidgetStack {
    backgroundColor: Color
    backgroundImage: ScriptableImage
    backgroundGradient: LinearGradient
    spacing: number
    size: Size
    cornerRadius: number
    borderWidth: number
    borderColor: Color
    url: string
    addText(text: string): WidgetText
    addDate(date: Date): WidgetDate
    addImage(image: ScriptableImage): WidgetImage
    addSpacer(length?: number | null): WidgetSpacer
    addStack(): WidgetStack
    setPadding(top: number, leading: number, bottom: number, trailing: number): void
    useDefaultPadding(): void
    topAlignContent(): void
    centerAlignContent(): void
    bottomAlignContent(): void
    layoutHorizontally(): void
    layoutVertically(): void
  }

  // ========================
  // 应用内界面
  // ========================

  class UITable {
    constructor()
    showSeparators: boolean
    addRow(row: UITableRow): void
    removeRow(row: UITableRow): void
    removeAllRows(): void
    reload(): void
    present(fullscreen?: boolean): Promise<void>
  }

  class UITableRow {
    constructor()
    cellSpacing: number
    height: number
    isHeader: boolean
    dismissOnSelect: boolean
    onSelect: (() => void) | null
    backgroundColor: Color
    addCell(cell: UITableCell): void
    addText(title?: string, subtitle?: string): UITableCell
    addImage(image: ScriptableImage): UITableCell
    addImageAtURL(url: string): UITableCell
    addButton(title: string): UITableCell
  }

  class UITableCell {
    widthWeight: number
    onTap: (() => void) | null
    dismissOnTap: boolean
    titleColor: Color | null
    subtitleColor: Color | null
    titleFont: Font
    subtitleFont: Font
    static text(title?: string, subtitle?: string): UITableCell
    static image(image: ScriptableImage): UITableCell
    static imageAtURL(url: string): UITableCell
    static button(title: string): UITableCell
    leftAligned(): void
    centerAligned(): void
    rightAligned(): void
  }

  // ========================
  // 内部辅助
  // ========================

  // 全局 Image 的别名，保留项目内既有命名
  type ScriptableImage = Image

  interface ScriptableRequest {
    headers: Record<string, string>
    loadJSON: () => Promise<unknown>
    loadString: () => Promise<string>
    loadImage: () => Promise<ScriptableImage>
  }
}
