/** Central runtime config for API/websocket endpoints. */

export const API_BASE = import.meta.env.VITE_API_URL ?? ''

export const WS_BASE = (() => {
  const explicit = import.meta.env.VITE_WS_URL
  if (explicit) return explicit
  const { protocol, host } = window.location
  const wsProto = protocol === 'https:' ? 'wss' : 'ws'
  return `${wsProto}://${host}`
})()
