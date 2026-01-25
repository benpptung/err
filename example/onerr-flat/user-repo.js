// 中間層 - User Repository

import { OnErr } from '../../src/err.js'
import { connect } from './db.js'

export function findUser(userId) {
  try {
    connect('127.0.0.1', 3306)
  } catch (err) {
    throw OnErr(err, { userId }).m('Cannot find user')
  }
}
