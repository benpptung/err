// 最底層 - DB 連線錯誤

import { Err } from '../../src/err.js'

export function connect(host, port) {
  throw Err('ECONNREFUSED', { host, port })
}
