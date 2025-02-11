import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { WsFromServer, WsToServer } from './types'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

const getEndpoint = (endpoint: string) => {
	return `/translations/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`
}

export const getWsEndpointURL = (endpoint: string) => {
	return new URL(getEndpoint(endpoint), window.location.origin)
		.toString()
		.replace('http://', 'ws://')
		.replace('https://', 'wss://')
}

export const sendWs = (ws: WebSocket, message: WsToServer) => {
	ws.send(JSON.stringify(message))
	return
}

export const listenWs = (
	ws: WebSocket,
	onMessage: (message: WsFromServer) => void
) => {
	const onWsMessage = (event: any) => {
		try {
			const message = JSON.parse(event.data)
			onMessage(message)
		} catch {
			console.error('Failed to parse WS message:', event)
		}
	}
	ws.addEventListener('message', onWsMessage)

	return () => {
		ws.removeEventListener('message', onWsMessage)
	}
}
