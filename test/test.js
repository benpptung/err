import expect from "expect.js"
import { Err, OnErr } from "../src/err.js"

/* eslint-disable no-undef */

describe("Err", function() {

  it("creates an Error instance", function() {
    const e = Err("fail")
    expect(e).to.be.an(Error)
  })

  it("stores message into msgs[]", function() {
    const e = Err("invalid data")
    expect(e.msgs).to.eql(["invalid data"])
  })

  it("clones original context", function() {
    const ctx = { a: 1 }
    const e = Err("x", ctx)
    expect(e.original).to.eql({ a: 1 })
    expect(e.original).not.to.be(ctx) // cloned
  })

  it("attaches safe props", function() {
    const e = Err("x", null, { code: 123, detail: "abc" })
    expect(e.code).to.be(123)
    expect(e.detail).to.be("abc")
  })

})


describe("OnErr", function() {

  it("wraps non-Error inputs into Error", function() {
    const e = OnErr({ a: 1 }, { b: 2 })
    expect(e).to.be.an(Error)
    expect(e.original).to.eql({ b: 2 })
  })

  it("preserves and merges original context", function() {
    const e1 = Err("fail", { a: 1 })
    const e2 = OnErr(e1, { b: 2 })
    expect(e2.original).to.eql({ b: 2, a: 1 }) // new fills, old keeps
  })

  it("preserves msgs array", function() {
    const e1 = Err("fail")
    e1.msgs.push("layer 2")

    const e2 = OnErr(e1, { step: 3 })
    expect(e2.msgs).to.eql(["fail", "layer 2"])
  })

  it("adds safe props", function() {
    const e1 = Err("x")
    const e2 = OnErr(e1, null, { code: "E_X", retry: 1 })
    expect(e2.code).to.be("E_X")
    expect(e2.retry).to.be(1)
  })

})

describe("Err.m()", function() {

  it("appends new messages without overwriting previous ones", function() {
    const e = Err("first")
    e.m("second").m("third")

    expect(e.msgs).to.eql(["first", "second", "third"])
  })

  it("works after wrapping with OnErr", function() {
    const e1 = Err("initial")
    const e2 = OnErr(e1, { step: 1 }).m("more context")

    expect(e2.msgs).to.eql(["initial", "more context"])
  })

  it("does not accept non-string or empty message", function() {
    const e = Err("base")
    e.m("").m(null).m(undefined).m(123).m({}) // all ignored

    expect(e.msgs).to.eql(["base"])
  })

  it("keeps msgs array identity after OnErr", function() {
    const e1 = Err("m1")
    const msgs_old = e1.msgs

    const e2 = OnErr(e1, { a: 1 })
    e2.m("m2")

    // still same array, but extended
    expect(e2.msgs).to.be(msgs_old)
    expect(e2.msgs).to.eql(["m1", "m2"])
  })

  it("converts a plain Error into an Err-style msgs history", function() {
    const plain = new Error("plain failure")

    const e = OnErr(plain, { file: "x.json" })

    expect(e.msgs).to.eql(["plain failure"])
  })

  it("preserves message history when wrapping a plain Error and then appending", function() {
    const plain = new Error("invalid payload")

    const e1 = OnErr(plain, { file: "1.json" })
    const e2 = OnErr(e1, { step: 2 }).m("load payload failed")

    expect(e2.msgs).to.eql([
      "invalid payload",
      "load payload failed"
    ])
  })

  it("does not duplicate the message if msgs already exists", function() {
    const e1 = Err("invalid payload")   // msgs = ["invalid payload"]

    const e2 = OnErr(e1, { file: "x" }) // should NOT push message again

    expect(e2.msgs).to.eql(["invalid payload"])
  })

})

describe("OnErr.m() binding", function () {

  it("binds m only once, even after multiple OnErr calls", function () {
    const e1 = Err("fail")

    const first_m = e1.m

    // multiple wrapping
    const e2 = OnErr(e1, { step: 1 })
    const second_m = e2.m

    const e3 = OnErr(e2, { step: 2 })
    const third_m = e3.m

    // all must be same function reference
    expect(second_m).to.be(first_m)
    expect(third_m).to.be(first_m)
  })

  it("binds m when error was plain Error, but only once", function () {
    const plain = new Error("boom")

    const e1 = OnErr(plain, { a: 1 })
    const m1 = e1.m

    const e2 = OnErr(e1, { b: 2 })
    const m2 = e2.m

    expect(typeof m1).to.be("function")
    expect(m2).to.be(m1)  // same closure
  })

})

describe("safe props protection", function () {

  it("does NOT allow overwriting core props via Err props", function () {
    const e = Err("x", null, {
      message: "overwritten",
      stack: "fake stack",
      original: { fake: true },
      msgs: ["fake"],
      m: "not a function",
      response: "fake",
      name: "NewError",
      cause: "fake"
    })

    expect(e.message).to.be("x")          // preserved
    expect(e.msgs).to.eql(["x"])          // preserved
    expect(typeof e.m).to.be("function")  // preserved
    expect(e.original).to.eql({})         // preserved
    expect(e.name).to.be("Error")         // native
    expect(e.stack).to.be.a("string")     // native
    expect(e.response).to.be(undefined)   // stripped
  })

  it("does NOT allow overwriting core props via OnErr props", function () {
    const e0 = Err("base", { a: 1 })

    const e = OnErr(e0, { b: 2 }, {
      message: "fake",
      stack: "fake",
      msgs: ["bad"],
      m: "danger",
      original: { c: 3 },
      name: "Overwritten",
      response: "bad-response"
    })

    expect(e.message).to.be("base")
    expect(e.msgs).to.eql(["base"])
    expect(typeof e.m).to.be("function")
    expect(e.original).to.eql({ b: 2, a: 1 })
    expect(e.name).to.be("Error")
    expect(e.response).to.be(undefined)
  })

})
