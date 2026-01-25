// Run: npm run example-onerr

import { handleRequest } from './api-handler.js'

try {
  handleRequest({ userId: 123, token: 'abc' })
}
catch (err) {
  const log = {
    level: 50,
    time: Date.now(),
    name: 'onerr-flat',
    msg: 'onerr flat example',
    err: {
      message: err.message,
      name: err.name,
      stack: err.stack,
      msgs: err.msgs,
      original: err.original
    }
  }
  console.log(JSON.stringify(log)) // eslint-disable-line 
}
