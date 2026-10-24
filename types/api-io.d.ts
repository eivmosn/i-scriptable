export {}

declare global {
  // ========================
  // 浏览器
  // ========================

  // 在 App 内或 Safari 中展示网页
  class Safari {
    static openInApp(url: string, fullscreen?: boolean): Promise<void>
    static open(url: string): void
  }

  // ========================
  // 邮件与短信
  // ========================

  // 发送邮件
  class Mail {
    constructor()
    toRecipients: string[]
    ccRecipients: string[]
    bccRecipients: string[]
    subject: string
    body: string
    isBodyHTML: boolean
    preferredSendingEmailAddress: string
    send(): Promise<void>
    addImageAttachment(image: Image): void
    addFileAttachment(filePath: string): void
    addDataAttachment(data: Data, mimeType: string, filename: string): void
  }

  // 发送短信 / iMessage
  class Message {
    constructor()
    recipients: string[]
    body: string
    send(): Promise<void>
    addImageAttachment(image: Image): void
    addFileAttachment(filePath: string): void
    addDataAttachment(data: Data, uti: string, filename: string): void
  }

  // ========================
  // 分享与预览
  // ========================

  // 系统分享面板
  class ShareSheet {
    static present(activityItems: unknown[]): Promise<Record<string, unknown>>
  }

  // 快速预览文件 / 图片 / 文本
  class QuickLook {
    static present(item: unknown, fullscreen?: boolean): Promise<void>
  }

  // 朗读文本
  class Speech {
    static speak(text: string): void
  }

  // ========================
  // 照片与文档
  // ========================

  // 系统相册
  class Photos {
    static fromLibrary(): Promise<Image>
    static fromCamera(): Promise<Image>
    static latestPhoto(): Promise<Image>
    static latestPhotos(count: number): Promise<Image[]>
    static latestScreenshot(): Promise<Image>
    static latestScreenshots(count: number): Promise<Image[]>
    static removeLatestPhoto(): void
    static removeLatestPhotos(count: number): void
    static removeLatestScreenshot(): void
    static removeLatestScreenshots(count: number): void
    static save(image: Image): void
  }

  // 文件选择 / 导出
  class DocumentPicker {
    static open(types?: string[]): Promise<string[]>
    static openFile(): Promise<string>
    static openFolder(): Promise<string>
    static export(path: string): Promise<string[]>
    static exportString(content: string, name?: string): Promise<string[]>
    static exportImage(image: Image, name?: string): Promise<string[]>
    static exportData(data: Data, name?: string): Promise<string[]>
  }
}
