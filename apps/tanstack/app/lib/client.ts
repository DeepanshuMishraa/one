import { hc } from 'hono/client'
import type { AppType } from 'server/calendar'

export const client = hc<AppType>('http://localhost:8787/')
