export {}

declare global {
  // ========================
  // 通知
  // ========================

  // 计划并管理通知
  class Notification {
    constructor()
    // 通知标识符，重新计划通知时使用
    identifier: string
    title: string
    subtitle: string
    body: string
    // 富通知的偏好高度，仅在 scriptName 不为 null 时生效
    preferredContentHeight: number
    // 应用图标角标，null 表示保持不变
    badge: number | null
    // 用于对通知分组的标识符
    threadIdentifier: string
    // 自定义信息，可在通过通知运行脚本时读取
    userInfo: Record<string, unknown>
    // 通知声音，null 表示静音
    sound: string | null
    // 点击通知时打开的 URL
    openURL: string
    // 已送达通知的送达日期，未送达时为 null，只读
    readonly deliveryDate: Date | null
    // 下一次触发时间，只读
    readonly nextTriggerDate: Date
    // 在富通知中运行的脚本名称，null 表示不运行脚本
    scriptName: string | null
    // 通知上的操作按钮，只读
    readonly actions: { title: string, url: string }[]
    // 已废弃（1.3），请改用 args.notification
    static current(): Notification
    // 计划通知，修改后需重新调用
    schedule(): Promise<void>
    // 移除通知的所有未来触发
    remove(): Promise<void>
    setTriggerDate(date: Date): void
    setDailyTrigger(hour: number, minute: number, repeats?: boolean): void
    setWeeklyTrigger(weekday: number, hour: number, minute: number, repeats?: boolean): void
    addAction(title: string, url: string, destructive?: boolean): void
    static allPending(): Promise<Notification[]>
    static allDelivered(): Promise<Notification[]>
    static removeAllPending(): Promise<void>
    static removeAllDelivered(): Promise<void>
    static removePending(identifiers: string[]): Promise<void>
    static removeDelivered(identifiers: string[]): Promise<void>
    // 将 args.notification 重置为 null
    static resetCurrent(): void
  }

  // ========================
  // 定时器
  // ========================

  // 在指定时间间隔后触发的定时器
  class Timer {
    constructor()
    // 触发频率，单位为毫秒
    timeInterval: number
    // 是否重复触发
    repeats: boolean
    schedule(callback: () => void): void
    // 停止定时器，使其不再触发
    invalidate(): void
    static schedule(timeInterval: number, repeats: boolean, callback: () => void): Timer
  }

  // ========================
  // 日期格式化
  // ========================

  // 生成两个日期之间时间间隔的文本表示
  class RelativeDateTimeFormatter {
    constructor()
    // 格式化时使用的语言区域，例如 "en"、"it"、"da"
    locale: string
    string(date: Date, referenceDate: Date): string
    // 优先使用命名日期时间风格，例如 "yesterday"
    useNamedDateTimeStyle(): void
    // 优先使用数字日期时间风格，例如 "1 day ago"
    useNumericDateTimeStyle(): void
  }

  // ========================
  // 重复规则
  // ========================

  // 用于提醒与日历事件的重复规则
  class RecurrenceRule {
    static daily(interval: number): RecurrenceRule
    static dailyEndDate(interval: number, endDate: Date): RecurrenceRule
    static dailyOccurrenceCount(interval: number, occurrenceCount: number): RecurrenceRule
    static weekly(interval: number): RecurrenceRule
    static weeklyEndDate(interval: number, endDate: Date): RecurrenceRule
    static weeklyOccurrenceCount(interval: number, occurrenceCount: number): RecurrenceRule
    static monthly(interval: number): RecurrenceRule
    static monthlyEndDate(interval: number, endDate: Date): RecurrenceRule
    static monthlyOccurrenceCount(interval: number, occurrenceCount: number): RecurrenceRule
    static yearly(interval: number): RecurrenceRule
    static yearlyEndDate(interval: number, endDate: Date): RecurrenceRule
    static yearlyOccurrenceCount(interval: number, occurrenceCount: number): RecurrenceRule
    // 每周几触发，1 至 7，其中 1 为周日
    static complexWeekly(interval: number, daysOfTheWeek: number[], setPositions: number[]): RecurrenceRule
    static complexWeeklyEndDate(interval: number, daysOfTheWeek: number[], setPositions: number[], endDate: Date): RecurrenceRule
    static complexWeeklyOccurrenceCount(interval: number, daysOfTheWeek: number[], setPositions: number[], occurrenceCount: number): RecurrenceRule
    // daysOfTheMonth 取值 1 至 31，以及 -1 至 -31
    static complexMonthly(interval: number, daysOfTheWeek: number[], daysOfTheMonth: number[], setPositions: number[]): RecurrenceRule
    static complexMonthlyEndDate(interval: number, daysOfTheWeek: number[], daysOfTheMonth: number[], setPositions: number[], endDate: Date): RecurrenceRule
    static complexMonthlyOccurrenceCount(interval: number, daysOfTheWeek: number[], daysOfTheMonth: number[], setPositions: number[], occurrenceCount: number): RecurrenceRule
    static complexYearly(interval: number, daysOfTheWeek: number[], monthsOfTheYear: number[], weeksOfTheYear: number[], daysOfTheYear: number[], setPositions: number[]): RecurrenceRule
    static complexYearlyEndDate(interval: number, daysOfTheWeek: number[], monthsOfTheYear: number[], weeksOfTheYear: number[], daysOfTheYear: number[], setPositions: number[], endDate: Date): RecurrenceRule
    static complexYearlyOccurrenceCount(interval: number, daysOfTheWeek: number[], monthsOfTheYear: number[], weeksOfTheYear: number[], daysOfTheYear: number[], setPositions: number[], occurrenceCount: number): RecurrenceRule
  }

  // ========================
  // 位置
  // ========================

  // 获取设备当前位置
  class Location {
    // 返回纬度、经度、海拔以及水平与垂直精度（米）
    static current(): Promise<{
      latitude: number
      longitude: number
      altitude: number
      horizontalAccuracy: number
      verticalAccuracy: number
    }>
    // 最高精度，默认值
    static setAccuracyToBest(): void
    static setAccuracyToTenMeters(): void
    static setAccuracyToHundredMeters(): void
    static setAccuracyToKilometer(): void
    static setAccuracyToThreeKilometers(): void
    // locale 为 null 时使用设备默认语言区域
    static reverseGeocode(latitude: number, longitude: number, locale?: string | null): Promise<Record<string, unknown>[]>
  }

  // ========================
  // 日历
  // ========================

  // 存放提醒与事件的日历
  class Calendar {
    // 日历标识符，只读
    readonly identifier: string
    title: string
    // 是否为订阅日历，只读
    readonly isSubscribed: boolean
    // 是否允许添加、编辑、删除条目，只读
    readonly allowsContentModifications: boolean
    color: Color
    // availability 支持 busy、free、tentative、unavailable
    supportsAvailability(availability: string): boolean
    save(): void
    remove(): void
    static forReminders(): Promise<Calendar[]>
    static forEvents(): Promise<Calendar[]>
    static forRemindersByTitle(title: string): Promise<Calendar>
    static forEventsByTitle(title: string): Promise<Calendar>
    static createForReminders(title: string): Promise<Calendar>
    static findOrCreateForReminders(title: string): Promise<Calendar>
    static defaultForReminders(): Promise<Calendar>
    static defaultForEvents(): Promise<Calendar>
    static presentPicker(allowMultiple?: boolean): Promise<Calendar[]>
  }

  // ========================
  // 日历事件
  // ========================

  // 管理日历中的事件
  class CalendarEvent {
    constructor()
    // 事件标识符，只读
    readonly identifier: string
    title: string
    location: string
    notes: string
    startDate: Date
    endDate: Date
    isAllDay: boolean
    // 事件参与者，只读
    readonly attendees: { isCurrentUser: boolean, name: string, status: string, type: string, role: string }[]
    // availability 支持 busy、free、tentative、unavailable
    availability: string
    // 时区标识符，例如 "Europe/Copenhagen"
    timeZone: string
    calendar: Calendar
    addRecurrenceRule(recurrenceRule: RecurrenceRule): void
    removeAllRecurrenceRules(): void
    // 保存事件，新建时插入日历
    save(): void
    remove(): void
    presentEdit(): Promise<CalendarEvent>
    static presentCreate(): Promise<CalendarEvent>
    // calendars 默认为所有日历
    static today(calendars?: Calendar[]): Promise<CalendarEvent[]>
    static tomorrow(calendars?: Calendar[]): Promise<CalendarEvent[]>
    static yesterday(calendars?: Calendar[]): Promise<CalendarEvent[]>
    static thisWeek(calendars?: Calendar[]): Promise<CalendarEvent[]>
    static nextWeek(calendars?: Calendar[]): Promise<CalendarEvent[]>
    static lastWeek(calendars?: Calendar[]): Promise<CalendarEvent[]>
    static between(startDate: Date, endDate: Date, calendars?: Calendar[]): Promise<CalendarEvent[]>
  }

  // ========================
  // 提醒
  // ========================

  // 管理日历中的提醒
  class Reminder {
    constructor()
    // 提醒标识符，只读
    readonly identifier: string
    title: string
    notes: string
    isCompleted: boolean
    // 是否已过期，只读
    readonly isOverdue: boolean
    // 优先级，0 未定义，1 最高，9 最低
    priority: number
    dueDate: Date
    // dueDate 是否包含时间，默认 true
    dueDateIncludesTime: boolean
    // 完成日期，只读
    readonly completionDate: Date
    // 创建日期，只读
    readonly creationDate: Date
    calendar: Calendar
    addRecurrenceRule(recurrenceRule: RecurrenceRule): void
    removeAllRecurrenceRules(): void
    // 保存提醒，新建时插入日历
    save(): void
    remove(): void
    // calendars 默认为所有日历
    static scheduled(calendars?: Calendar[]): Promise<Reminder[]>
    static all(calendars?: Calendar[]): Promise<Reminder[]>
    static allCompleted(calendars?: Calendar[]): Promise<Reminder[]>
    static allIncomplete(calendars?: Calendar[]): Promise<Reminder[]>
    static allDueToday(calendars?: Calendar[]): Promise<Reminder[]>
    static completedDueToday(calendars?: Calendar[]): Promise<Reminder[]>
    static incompleteDueToday(calendars?: Calendar[]): Promise<Reminder[]>
    static allDueTomorrow(calendars?: Calendar[]): Promise<Reminder[]>
    static completedDueTomorrow(calendars?: Calendar[]): Promise<Reminder[]>
    static incompleteDueTomorrow(calendars?: Calendar[]): Promise<Reminder[]>
    static allDueYesterday(calendars?: Calendar[]): Promise<Reminder[]>
    static completedDueYesterday(calendars?: Calendar[]): Promise<Reminder[]>
    static incompleteDueYesterday(calendars?: Calendar[]): Promise<Reminder[]>
    static allDueThisWeek(calendars?: Calendar[]): Promise<Reminder[]>
    static completedDueThisWeek(calendars?: Calendar[]): Promise<Reminder[]>
    static incompleteDueThisWeek(calendars?: Calendar[]): Promise<Reminder[]>
    static allDueNextWeek(calendars?: Calendar[]): Promise<Reminder[]>
    static completedDueNextWeek(calendars?: Calendar[]): Promise<Reminder[]>
    static incompleteDueNextWeek(calendars?: Calendar[]): Promise<Reminder[]>
    static allDueLastWeek(calendars?: Calendar[]): Promise<Reminder[]>
    static completedDueLastWeek(calendars?: Calendar[]): Promise<Reminder[]>
    static incompleteDueLastWeek(calendars?: Calendar[]): Promise<Reminder[]>
    static completedToday(calendars?: Calendar[]): Promise<Reminder[]>
    static completedThisWeek(calendars?: Calendar[]): Promise<Reminder[]>
    static completedLastWeek(calendars?: Calendar[]): Promise<Reminder[]>
    static allDueBetween(startDate: Date, endDate: Date, calendars?: Calendar[]): Promise<Reminder[]>
    static completedDueBetween(startDate: Date, endDate: Date, calendars?: Calendar[]): Promise<Reminder[]>
    static incompleteDueBetween(startDate: Date, endDate: Date, calendars?: Calendar[]): Promise<Reminder[]>
    static completedBetween(startDate: Date, endDate: Date, calendars?: Calendar[]): Promise<Reminder[]>
  }
}
