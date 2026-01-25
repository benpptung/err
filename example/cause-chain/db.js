// 最底層 - DB 連線錯誤

export function connect() {
  throw new Error('ECONNREFUSED 127.0.0.1:3306')
}
