// 中間層 - User Repository

import { connect } from './db.js'

export function findUser(userId) {
  try {
    connect()
  } catch (err) {
    throw new Error(`Cannot find user ${userId}`, { cause: err })
  }
}
