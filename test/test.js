'use strict'

const Err = require('../lib/index').Err
const expect = require('expect.js')

describe('Err()', function() {

  it('return a wrapped Error object', function() {

    var res
    var need = 'blah'
    var act = 3
    var err = Err('no message', {res, need}, act)

    expect(err).to.be.a(Error)
    expect(err.message).to.be('no message')
    expect(err.messages[0]).to.be('no message')
    expect(err.messages.length).to.be(1)
    expect(err.original.res).to.be(res)
    expect(err.original.need).to.be(need)
    expect(err.actions.length).to.be(1)
    expect(err.actions[0]).to.be(act)
  })
})
