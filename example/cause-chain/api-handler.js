// 最上層 - API Handler

import { authenticate } from './auth-service.js'

export function handleRequest(req) {
  try {
    authenticate(req.userId, req.token)
  }
  catch (err) {
    throw new Error('Request failed', { cause: err })
  }
}
