'use strict'

const Err = require('../lib/index').Err

var res
var need = 'blah'

var er = new Err('no response', {res, need})

console.log((er instanceof Error)) // true
