import { spawn } from 'node:child_process'
const main = async () => {
  if (process.env.BUILD_TARGET === 'deploy') {
    return
  }
  return await new Promise((resolve, reject) => {
    const ls = spawn('bun run build-client')
    ls.on('error', (error) => {
      reject(error)
    })
    ls.on('exit', (code) => {
      resolve(code)
    })
  })
}

main()
