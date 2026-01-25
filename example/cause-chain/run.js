// Run: npm run example-cause

import { handleRequest } from './api-handler.js'

try {
  handleRequest({ userId: 123, token: 'abc' })
}
catch (err) {
  const log = {
    level: 50,
    time: Date.now(),
    name: 'cause-chain',
    msg: 'cause chain example',
    err: {
      message: err.message,
      name: err.name,
      stack: err.stack,
      cause: err.cause ? {
        message: err.cause.message,
        name: err.cause.name,
        stack: err.cause.stack,
        cause: err.cause.cause ? {
          message: err.cause.cause.message,
          name: err.cause.cause.name,
          stack: err.cause.cause.stack,
          cause: err.cause.cause.cause ? {
            message: err.cause.cause.cause.message,
            name: err.cause.cause.cause.name,
            stack: err.cause.cause.cause.stack
          } : undefined
        } : undefined
      } : undefined
    }
  }
  console.log(JSON.stringify(log)) // eslint-disable-line 
}
