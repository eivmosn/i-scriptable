// @env node
import fs from 'node:fs/promises'
import http from 'node:http'
import process from 'node:process'
import { config } from './config'
import { contentType } from './content-type'
import { createManifest, resolveSyncFile } from './file-scan'
import { sendBuffer, sendJson, sendText } from './http'
import { logError, logNoWidgetsFound, logRequest, printStartup } from './logger'

const server = http.createServer(async (req, res) => {
  const method = req.method || 'GET'
  let status = 200

  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`)

    if (url.pathname === '/' || url.pathname === '/manifest.json') {
      status = 200
      const manifest = await createManifest()
      if (manifest.scripts.length === 0)
        logNoWidgetsFound()
      sendJson(res, status, manifest)
      return
    }

    if (url.pathname.startsWith('/files/')) {
      const name = decodeURIComponent(url.pathname.slice('/files/'.length))
      const entry = await resolveSyncFile(name)

      if (!entry) {
        status = 404
        sendText(res, status, 'Not found')
        return
      }

      status = 200
      sendBuffer(res, status, await fs.readFile(entry.path), contentType(entry.name))
      return
    }

    status = 404
    sendText(res, status, 'Not found')
  }
  catch (error) {
    status = 500
    logError(error)
    sendText(res, status, error instanceof Error ? error.message : String(error))
  }
  finally {
    logRequest(method, req.url || '/', status)
  }
})

server.on('error', (error) => {
  if ('code' in error && error.code === 'EADDRINUSE') {
    console.error(`Port ${config.server.port} is already in use. Stop the existing server or run with another port, for example: PORT=8788 pnpm serve`)
    process.exitCode = 1
    return
  }

  logError(error)
  process.exitCode = 1
})

server.listen(config.server.port, config.server.host, printStartup)
