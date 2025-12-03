import expect from "expect.js"
import { Err, OnErr } from "../src/err.js"

/* eslint-disable no-undef */

describe("Err", function () {

  it("creates an Error instance", function () {
    const e = Err("fail")
    expect(e).to.be.an(Error)
  })

  it("stores message into msgs[]", function () {
    const e = Err("invalid data")
    expect(e.msgs).to.eql(["invalid data"])
  })

  it("clones original context", function () {
    const ctx = { a: 1 }
    const e = Err("x", ctx)
    expect(e.original).to.eql({ a: 1 })
    expect(e.original).not.to.be(ctx) // cloned
  })

  it("attaches safe props", function () {
    const e = Err("x", null, { code: 123, detail: "abc" })
    expect(e.code).to.be(123)
    expect(e.detail).to.be("abc")
  })

})


describe("OnErr", function () {

  it("wraps non-Error inputs into Error", function () {
    const e = OnErr({ a: 1 }, { b: 2 })
    expect(e).to.be.an(Error)
    expect(e.original).to.eql({ b: 2 })
  })

  it("preserves and merges original context", function () {
    const e1 = Err("fail", { a: 1 })
    const e2 = OnErr(e1, { b: 2 })
    expect(e2.original).to.eql({ b: 2, a: 1 }) // new fills, old keeps
  })

  it("preserves msgs array", function () {
    const e1 = Err("fail")
    e1.msgs.push("layer 2")

    const e2 = OnErr(e1, { step: 3 })
    expect(e2.msgs).to.eql(["fail", "layer 2"])
  })

  it("adds safe props", function () {
    const e1 = Err("x")
    const e2 = OnErr(e1, null, { code: "E_X", retry: 1 })
    expect(e2.code).to.be("E_X")
    expect(e2.retry).to.be(1)
  })

})
