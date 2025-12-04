# err

A minimal, environment-agnostic enhancement to JavaScript’s native `Error`.

`Err` provides a simple way to attach **runtime context**, **custom properties**,  
and **human-controlled message breadcrumbs**, while preserving the behavior,  
simplicity, and semantics of a standard `Error`.

It does **not** modify prototypes.  
It does **not** wrap stack traces.  
It remains fully compatible with all runtimes (Node, browser, Deno, Bun, Workers).

---

## Why this exists

Native JavaScript `Error` objects intentionally avoid storing application context  
(objects, variables, state snapshots). This keeps the primitive lightweight,  
but in real-world debugging it often leaves out crucial information.

`Err` lets you attach this context ― explicitly and safely.

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


### ✔ `.m()` — append human-readable context during rethrows

```js
throw OnErr(e, { file }).m("failed to load data")
```

Result:

```js
err.msgs === [
  ... previous messages ...,
  "failed to load data"
]
```

### ✔ No dependencies, no environment assumptions

Works in:

* Node.js
* Browsers
* Deno
* Bun
* Cloudflare Workers

---

## Installation

```sh
pnpm add benpptung/err
```

---

## Usage

## Creating an error

```js
import { Err } from "err"

throw Err("invalid payload format", { payload  })
```

Results:

```js
{
  message: "invalid payload format",
  msgs: ["invalid payload format"],
  original: { payload },
  stack: "..."
}
```

---

## Enhancing an error during re-throws

```js
import { Err, OnErr } from "err"

function load_payload(file) {
  try {
    const payload = JSON.parse(fs.readFileSync(file, "utf8"))
    if (Object(payload) !== payload) {
      throw Err("invalid payload", { payload }) // what did we actually receive?
    }
    return payload

  } catch (e) {
    throw OnErr(e, { file })
  }
}
```

Results:
```js
{
  message: <"invalid payload"|other message>, // might be `invalid payload` if Error was thrown by Err
  msgs: [...],  // might have `invalid payload`, if Error was thrown by Err
  original: { payload, file },
  stack: "..."
}
```


`OnErr` preserves:

* existing stack
* existing message
* existing msgs (history)
* existing original
* merges new context
* merges safe custom props



## Using `.m()` — optional message history breadcrumbs

`.m()` is an optional helper for appending human-readable messages into  
`err.msgs[]`. It is **not required**, because `OnErr` has no message input  
parameter — it only merges context and safe props.  
Use `.m()` only when you want to record a specific logical step.

### Example

If the original error came from the runtime or a library:

```js
new Error("invalid payload")
```


You may first rethrow with additional context:

```js
throw OnErr(e, { file })
```

And at another stage, optionally add a breadcrumb message:

```js
throw OnErr(e, { other_variable }).m("load payload failed")
```

Final **message history**:

```js
err.msgs === [
  "invalid payload",
  "load payload failed"
]
```

`.m()` does not modify `err.message`.  
It only appends to `err.msgs[]` (the message history).

---

## API

### `Err(msg?, original?, props?)`

Creates an enhanced `Error` with:

* `msgs: string[]`
* `original: object`
* safe custom properties

### `OnErr(err, original?, props?)`

Enhances an existing error:

* ensures `err` is an `Error`
* merges new context into `original`
* preserves existing message, stack, original, msgs
* merges safe custom properties
* returns the same error instance

### `.m(message: string)`

Appends a breadcrumb message into `err.msgs[]`.

Returns the error instance for chaining.

---

## Philosophy

This library does **not** replace JavaScript’s error system.
It only adds what real-world debugging often needs:

* A place to store contextual debugging data
* A consistent enriched error shape
* Human-readable message history (breadcrumbs)
* Minimalism, no prototypes modified, predictable behavior

The goal is clarity — not complexity.

---

## License

MIT © Ben P.P. Tung