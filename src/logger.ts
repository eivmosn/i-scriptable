import os from 'node:os'
import ansis from 'ansis'
import figlet from 'figlet'
import { config } from './config'

export function printStartup(): void {
  const title = figlet.textSync(config.name, {
    font: 'Small',
    horizontalLayout: 'default',
    verticalLayout: 'default',
  })

  console.log(ansis.cyan(title))
  console.log(ansis.bold(`${config.name} sync server`))
  console.log(ansis.gray('Serving built scripts from dist/widgets and assets from widgets.'))
  console.log('')

  for (const address of lanAddresses()) {
    console.log(`${ansis.green('local')} ${ansis.cyan(`http://${address}:${config.server.port}/manifest.json`)}`)
  }

  console.log('')
}

export function logRequest(method: string, url: string, status: number): void {
  const color = status >= 500 ? ansis.red : status >= 400 ? ansis.yellow : ansis.green
  console.log(`${ansis.gray(new Date().toLocaleTimeString())} ${method.padEnd(4)} ${color(String(status))} ${url}`)
}

export function logError(error: unknown): void {
  console.error(ansis.red(error instanceof Error ? error.stack || error.message : String(error)))
}

export function logNoWidgetsFound(): void {
  console.warn(ansis.yellow('暂未发现任何组件。请先创建 widgets/<name>/index.ts 并运行 pnpm build。'))
}

function lanAddresses(): string[] {
  const interfaces = os.networkInterfaces()
  const addresses: string[] = ['127.0.0.1']

  for (const items of Object.values(interfaces)) {
    for (const item of items || []) {
      if (item.family === 'IPv4' && !item.internal) {
        addresses.push(item.address)
      }
    }
  }

  return addresses
}
