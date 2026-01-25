// 最上層 - API Handler

import { OnErr } from '../../src/err.js'
import { authenticate } from './auth-service.js'

export function handleRequest(req) {
  try {
    authenticate(req.userId, req.token)
  }
  catch (err) {
    throw OnErr(err, { endpoint: '/api/auth' }).m('Request failed')
  }
}
