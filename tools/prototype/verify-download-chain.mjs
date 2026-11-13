import { spawn } from 'node:child_process'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const host = '127.0.0.1'
const port = 4179
const baseUrl = `http://${host}:${port}`
const outputDir = path.join(process.cwd(), 'node_modules', '.prototype-check-dist')
const viteEntry = path.join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js')
const expectedPaths = ['/download', '/app/prototype/', '/pc_client', '/pc_web', '/admin']

const preview = spawn(process.execPath, [
  viteEntry, 'preview', '--config', 'vite.react.config.mjs', '--configLoader', 'runner',
  '--outDir', 'node_modules/.prototype-check-dist', '--host', host, '--port', String(port), '--strictPort',
], { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] })

let output = ''
preview.stdout.on('data', (chunk) => { output += chunk })
preview.stderr.on('data', (chunk) => { output += chunk })

async function waitForServer() {
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) {
    if (preview.exitCode !== null) throw new Error(`Preview exited before startup.\n${output}`)
    try {
      const response = await fetch(baseUrl)
      if (response.ok) return
    } catch { /* still starting */ }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`Preview did not start.\n${output}`)
}

try {
  await waitForServer()
  for (const route of expectedPaths) {
    const response = await fetch(baseUrl + route)
    const html = await response.text()
    const passed = response.status === 200 && html.includes('id="root"')
    console.log(`${passed ? 'PASS' : 'FAIL'} ${route} HTTP ${response.status} application shell`)
    if (!passed) process.exitCode = 1
  }

  const assets = await readdir(path.join(outputDir, 'assets'))
  const js = (await Promise.all(
    assets.filter((file) => file.endsWith('.js')).map((file) => readFile(path.join(outputDir, 'assets', file), 'utf8'))
  )).join('\n')
  const markers = ['/app/prototype/', 'platform=', '/pc_client', '/pc_web']
  for (const marker of markers) {
    const passed = js.includes(marker)
    console.log(`${passed ? 'PASS' : 'FAIL'} built download target ${marker}`)
    if (!passed) process.exitCode = 1
  }
  if (!process.exitCode) console.log('Download navigation chain check passed.')
} catch (error) {
  console.error(`Download navigation chain check failed: ${error.message}`)
  process.exitCode = 1
} finally {
  if (preview.exitCode === null) preview.kill()
}
