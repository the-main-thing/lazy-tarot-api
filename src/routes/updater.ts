import { exec } from 'node:child_process'
import { env } from '../env'

const cmd = (command: string) => {
  return new Promise<number>((resolve, reject) => {
    const io = exec(command)
    io.on('exit', (code) => {
      if (code) {
        reject(code)
        return
      }
      resolve(0)
    })
  })
}

export const updater = async (request: Request) => {
  if (request.headers.get('x-api-key') !== env.AUTOMATION_API_KEY) {
    return
  }
  if (request.method !== 'POST') {
    return new Response(null, { status: 404 })
  }
  const url = new URL(request.url)
  if (url.pathname !== '/updater') {
    return new Response(null, { status: 404 })
  }

  try {
    await cmd('git reset --hard origin/main && git pull')
    await cmd('bun install')
    await cmd('bun run migrations-push')
    exec('pm2 restart tarot-api')
  } catch {
    return new Response(null, { status: 500 })
  }
  return new Response(null, { status: 200 })
}
