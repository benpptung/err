# err

A minimal, environment-agnostic enhancement to JavaScript’s native `Error`.

`Err` provides a simple way to attach **runtime context**, **custom properties**,  
and **human-readable message breadcrumbs**, while preserving the behavior,  
simplicity, and semantics of a standard `Error`.

It does not modify prototypes.  
It does not wrap stack traces.  
It remains fully compatible with all runtimes (Node, browser, Deno, Bun, Workers).

---

## Why this exists

Native JavaScript `Error` objects intentionally avoid storing application context  
(objects, variables, state snapshots). This keeps the core error primitive  
lightweight and memory-safe, but in real-world debugging it often leaves out  
important information.

`Err` lets you add the context yourself — explicitly, safely, and only when you need it.

---

## Features

### ✔ Drop-in replacement for `new Error()`
```js
throw Err("invalid config")
````

### ✔ Attach runtime context

```js
throw Err("invalid config", { config })
```

### ✔ Add safe custom properties

```js
throw Err("request failed", null, { code: "E_HTTP", status: 400 })
```

### ✔ Chain-friendly error enrichment

```js
catch (e) {
  throw OnErr(e, { filename })
}
```

### ✔ Human-controlled message breadcrumbs

```js
err.msgs.push("passed validation step 2")
```

### ✔ No dependencies, no environment assumptions

* Node.js
* Browsers
* Deno
* Bun
* Cloudflare Workers

All supported natively.

---

## Installation

```sh
pnpm add err

```

---

## Usage

### Creating an error

```js
import { Err } from "err"

throw Err("invalid cast format", { cast })
```

Result:

```js
{
  message: "invalid cast format",
  msgs: ["invalid cast format"],
  original: { cast },
  stack: "...",
}
```

---

### Enhancing an error during re-throws

```js
import { Err, OnErr } from "err"

function loadCast(file) {
  try {
    const payload = JSON.parse(fs.readFileSync(file, "utf8"))
    if (Object(payload) !== payload) {
      throw Err('invalid payload', { payload }) // what the payload we got???
    }
    return payload

  } catch (e) {
    throw OnErr(e, { file })
  }
}
```

`OnErr` preserves:

* existing stack
* existing message
* existing original
* existing msgs
* adds new context & props

---

### Adding breadcrumb messages

```js
err.msgs.push("retrying with fallback config")
```

Breadcrumbs help you understand the logical path the error traveled.

---

## API

### `Err(msg?, original?, props?)`

Creates an enhanced `Error` with:

* `msgs: string[]`
* `original: object`
* safe custom properties

---

### `OnErr(err, original?, props?)`

Enhances an existing error:

* ensures it is an `Error`
* merges new context into `original`
* preserves existing fields
* merges safe properties (e.g. code, status)
* does **not** alter message or stack

---

## Philosophy

This library is not a replacement for JS’s error system.
It simply provides what many practical applications need:

* A way to store context for debugging
* A consistent shape for enriched errors
* A safe container for metadata
* A clean alternative to deeply nested “wrapped errors”

The goal is clarity — not complexity.

---

## License

MIT © Ben P.P. Tung

```