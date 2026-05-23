// Scriptable 小组件：本月收入招财猫
export {}

const widget = new ListWidget()
widget.setPadding(18, 12, 0, 12)
widget.spacing = 0
widget.backgroundImage = await loadBackground('moneycat/money-cat.png')
widget.refreshAfterDate = new Date(Date.now() + 1000 * 60 * 60 * 6)

const title = widget.addText('本月收入')
title.font = Font.heavySystemFont(28)
title.textColor = new Color('#fff133')
title.centerAlignText()
title.lineLimit = 1
title.minimumScaleFactor = 0.75

widget.addSpacer(2)

const amount = widget.addText('3502')
amount.font = Font.heavySystemFont(72)
amount.textColor = new Color('#fff133')
amount.centerAlignText()
amount.lineLimit = 1
amount.minimumScaleFactor = 0.65

if (config.runsInWidget) {
  Script.setWidget(widget)
}
else {
  await widget.presentSmall()
}

Script.complete()

async function loadBackground(name: string): Promise<ScriptableImage> {
  const fm = FileManager.iCloud()
  const dir = fm.documentsDirectory()
  const path = fm.joinPath(dir, name)

  if (!fm.fileExists(path)) {
    throw new Error(`Missing background image: ${name}`)
  }

  await fm.downloadFileFromiCloud(path)
  const image = fm.readImage(path)
  if (image)
    return image

  throw new Error(`Cannot read background image: ${name}`)
}
