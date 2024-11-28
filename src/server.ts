import type { Server } from 'bun'

const getServerGetter = () => {
  let server: Server | null = null
  return {
    get: () => server,
    set: (s: Server) => {
      server = s
    },
  }
}

export const server = getServerGetter()
