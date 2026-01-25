// 上層 - Auth Service

import { OnErr } from '../../src/err.js'
import { findUser } from './user-repo.js'

export function authenticate(userId, token) {
  try {
    findUser(userId)
  } catch (err) {
    throw OnErr(err, { token }).m('Authentication failed')
  }
}
