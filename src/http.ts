import type { Buffer } from 'node:buffer'
import type { ServerResponse } from 'node:http'

export function sendJson(res: ServerResponse, status: number, value: unknown): void {
  sendText(res, status, JSON.stringify(value, null, 2), 'application/json; charset=utf-8')
}

export function sendBuffer(res: ServerResponse, status: number, value: Buffer, contentType: string): void {
  res.writeHead(status, headers(contentType))
  res.end(value)
}

export function sendText(
  res: ServerResponse,
  status: number,
  value: string,
  contentType = 'text/plain; charset=utf-8',
): void {
  res.writeHead(status, headers(contentType))
  res.end(value)
}

function headers(contentType: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
    'Content-Type': contentType,
  }
}
