export {}

declare global {
  // ========================
  // 输入
  // ========================

  // 语音输入，返回听写得到的文本
  class Dictation {
    // 弹出听写界面，locale 缺省时使用设备语言
    static start(locale?: string): Promise<string>
  }

  // 文本输入框，实例由 Alert.addTextField() / addSecureTextField() 创建
  class TextField {
    text: string
    placeholder: string
    // 为 true 时隐藏输入内容，默认 false
    isSecure: boolean
    textColor: Color
    font: Font
    setDefaultKeyboard(): void
    setNumberPadKeyboard(): void
    setDecimalPadKeyboard(): void
    setNumbersAndPunctuationKeyboard(): void
    setPhonePadKeyboard(): void
    setWebSearchKeyboard(): void
    setEmailAddressKeyboard(): void
    setURLKeyboard(): void
    setTwitterKeyboard(): void
    // 默认左对齐
    leftAlignText(): void
    centerAlignText(): void
    rightAlignText(): void
  }

  // ========================
  // 日期选择
  // ========================

  // 日期选择器，用 pick* 方法弹出
  class DatePicker {
    constructor()
    // 可选日期范围，min 大于 max 时两者都被忽略
    minimumDate: Date
    maximumDate: Date
    // 倒计时时长（秒），默认 0，最大 86399
    countdownDuration: number
    // 分钟轮盘间隔，默认 1，最大 30
    minuteInterval: number
    // 初始选中的日期，弹窗关闭后不保留选中结果
    initialDate: Date
    // 选择时间，返回当前日期加上选中的时分
    pickTime(): Promise<Date>
    pickDate(): Promise<Date>
    pickDateAndTime(): Promise<Date>
    // 返回选中的倒计时时长（秒）
    pickCountdownDuration(): Promise<number>
  }

  // ========================
  // 网页
  // ========================

  // 网页视图，可展示网页并在页面内执行 JavaScript
  class WebView {
    constructor()
    // 加载请求前调用，返回是否允许该请求；默认允许全部
    shouldAllowRequest: (request: Request) => boolean
    // 静态方法：加载并展示，关闭后 Promise 才完成
    static loadHTML(html: string, baseURL?: string, preferredSize?: Size, fullscreen?: boolean): Promise<void>
    static loadFile(fileURL: string, preferredSize?: Size, fullscreen?: boolean): Promise<void>
    static loadURL(url: string, preferredSize?: Size, fullscreen?: boolean): Promise<void>
    // 实例方法：加载完成后 Promise 完成
    loadURL(url: string): Promise<void>
    loadRequest(request: Request): Promise<void>
    loadHTML(html: string, baseURL?: string): Promise<void>
    loadFile(fileURL: string): Promise<void>
    // useCallback 为 true 时等待页面内全局 completion() 被调用
    evaluateJavaScript(javaScript: string, useCallback?: boolean): Promise<unknown>
    getHTML(): Promise<string>
    present(fullscreen?: boolean): Promise<void>
    // 等待当前加载结束，若加载失败则以错误完成
    waitForLoad(): Promise<unknown>
  }

  // ========================
  // XML
  // ========================

  // 事件驱动的 XML 解析器，解析前需设置回调
  class XMLParser {
    constructor(string: string)
    // 开始 / 结束解析文档
    didStartDocument: () => void
    didEndDocument: () => void
    // 遇到开始标签，attributes 为标签属性
    didStartElement: (elementName: string, attributes: Record<string, string>) => void
    // 遇到结束标签，参数为元素名
    didEndElement: (elementName: string) => void
    // 元素文本，同一元素可能分多次回调
    foundCharacters: (characters: string) => void
    // 遇到阻止继续解析的致命错误时调用
    parseErrorOccurred: () => void
    // 待解析的 XML 字符串
    string: string
    // 开始解析，返回是否成功启动
    parse(): boolean
  }

  // ========================
  // 通讯录
  // ========================

  // 地址簿中的联系人
  class Contact {
    constructor()
    // 设备内唯一标识，只读
    readonly identifier: string
    namePrefix: string
    givenName: string
    middleName: string
    familyName: string
    nickname: string
    birthday: Date
    // 头像
    image: Image
    // 条目形如 { identifier, label, localizedLabel, value }，value 必填
    emailAddresses: Record<string, string>[]
    phoneNumbers: Record<string, string>[]
    // 条目形如 { identifier, label, localizedLabel, street, city, state, postalCode, country }
    postalAddresses: Record<string, string>[]
    // 条目形如 { identifier, label, localizedLabel, service, url, userIdentifier, username }
    socialProfiles: Record<string, string | null>[]
    // 已废弃，1.7.5 起不可用
    note: string
    // 条目形如 { identifier, label, localizedLabel, value }
    urlAddresses: Record<string, string>[]
    // 条目形如 { identifier, label, localizedLabel, date }
    dates: Record<string, unknown>[]
    organizationName: string
    departmentName: string
    jobTitle: string
    // 以下只读属性表示容器是否支持对应字段
    readonly isNamePrefixAvailable: boolean
    readonly isGiveNameAvailable: boolean
    readonly isMiddleNameAvailable: boolean
    readonly isFamilyNameAvailable: boolean
    readonly isNicknameAvailable: boolean
    readonly isBirthdayAvailable: boolean
    readonly isEmailAddressesAvailable: boolean
    readonly isPhoneNumbersAvailable: boolean
    readonly isPostalAddressesAvailable: boolean
    readonly isSocialProfilesAvailable: boolean
    readonly isImageAvailable: boolean
    readonly isNoteAvailable: boolean
    readonly isURLAddressesAvailable: boolean
    readonly isOrganizationNameAvailable: boolean
    readonly isDepartmentNameAvailable: boolean
    readonly isJobTitleAvailable: boolean
    readonly isDatesAvailable: boolean
    static all(containers: ContactsContainer[]): Promise<Contact[]>
    static inGroups(groups: ContactsGroup[]): Promise<Contact[]>
    // 以下静态方法只入队，需调用 persistChanges() 才会写入地址簿
    static add(contact: Contact, containerIdentifier?: string | null): void
    static update(contact: Contact): void
    static delete(contact: Contact): void
    static persistChanges(): Promise<void>
  }

  // 联系人容器，一台设备可能有多个
  class ContactsContainer {
    // 只读
    readonly identifier: string
    readonly name: string
    static default(): Promise<ContactsContainer>
    static all(): Promise<ContactsContainer[]>
    static withIdentifier(identifier: string): Promise<ContactsContainer>
  }

  // 联系人分组，一个联系人可属于多个分组
  class ContactsGroup {
    constructor()
    // 只读
    readonly identifier: string
    name: string
    static all(containers: ContactsContainer[]): Promise<ContactsGroup[]>
    // 只入队，需调用 Contact.persistChanges() 才会写入地址簿
    static add(group: ContactsGroup, containerIdentifier?: string | null): void
    static update(group: ContactsGroup): void
    static delete(group: ContactsGroup): void
    addMember(contact: Contact): void
    removeMember(contact: Contact): void
  }
}
