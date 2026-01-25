// 上層 - Auth Service

import { findUser } from './user-repo.js'

export function authenticate(userId, token) {
  try {
    findUser(userId)
  } catch (err) {
    throw new Error('Authentication failed', { cause: err })
  }
}
