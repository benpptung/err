# err

A minimal, environment-agnostic enhancement to JavaScript's native `Error`.

`Err` provides a simple way to attach **runtime context**,
**human-controlled message breadcrumbs**, and **error flags for program logic**
(like `err.code`), while preserving the behavior, simplicity,
and semantics of a standard `Error`.

It does **not** modify prototypes.
It does **not** wrap stack traces.
It remains fully compatible with all runtimes (Node, browser, Deno, Bun, Workers).

Designed for **logging** and **debugging** — when you read the log,
you see everything in one place, not scattered across nested layers.

## Installation

```sh
npm install benpptung/err
# or
pnpm add benpptung/err
```

---

## The Three Core Dimensions

This library handles three things:

| Dimension | What it is | How to use | Behavior |
|-----------|-----------|------------|----------|
| **message_history** | How the error bubbled up | Add with `.m()` | append |
| **context_dict** | State at each layer for debugging | Pass as 2nd parameter | merge, old wins |
| **flag_dict** | Flags for program logic | Pass as 3rd parameter | merge, new wins |

**`context_dict`** — for debugging. Any context you need, as key-value pairs.

**`flag_dict`** — for coding. Only use it when the caller needs `if (err.code === ...)` checks. Don't write it just for the sake of writing.

```js
// No context needed, just a flag for the caller to check
throw Err('rate limit exceeded', null, { code: 'E_RATE_LIMIT' })

// Caller can then:
if (err.code === 'E_RATE_LIMIT') {
  await sleep(1000)
  retry()
}
```

### Flat, not chained

ES2022 `cause` creates a **linked chain** — each layer wraps the previous error. To see the full picture, you need to recursively walk through `err.cause.cause.cause...`. Context is scattered.

This library takes a **flat** approach — all three dimensions accumulate into single, accessible structures:

- `msgs[]` — one array, read top to bottom
- `original{}` — one object, all context merged
- `flag_dict` — directly on `err`, latest values ready for checks

**Trade-off:** flat means possible key conflicts when merging. Each dimension handles this differently:

- **message_history** — no conflict, just **append**
- **context_dict** — **old wins**, because the context closer to the error source is more valuable for debugging
- **flag_dict** — **new wins**, because the caller may need to update flags for branching logic

When you `console.log(err)`, everything is right there. No recursion needed.

---

## Quick Start

### Create an error

```js
import { Err } from 'err'

throw Err('Invalid config', { config })
```

### Wrap and rethrow

One line — context, message, done:

```js
import { OnErr } from 'err'

catch (e) {
  throw OnErr(e, { userId, file }).m('Failed to load user data')
}
```

---

## Usage

### Creating an error

```js
import { Err } from 'err'

throw Err('invalid payload format', { payload })
```

Result:

```js
{
  message: 'invalid payload format',
  msgs: ['invalid payload format'],
  original: { payload },
  stack: '...'
}
```

### Enhancing an error during rethrows

```js
import { Err, OnErr } from 'err'

function loadPayload(file) {
  try {
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (Object(payload) !== payload) {
      throw Err('invalid payload', { payload })
    }
    return payload

  } catch (e) {
    throw OnErr(e, { file }).m('load payload failed')
  }
}
```

Result:

```js
{
  message: 'invalid payload',
  msgs: ['invalid payload', 'load payload failed'],
  original: { payload, file },
  stack: '...'
}
```

`OnErr` preserves:

- existing `message`
- existing `stack`
- existing `msgs` (appends new ones)
- existing `original` (merges new context, old values win)

### Using `.m()` for message breadcrumbs

`.m()` appends a message to `err.msgs[]` without changing `err.message`.

```js
// Deep in the call stack
throw Err('ENOENT: file not found')

// Middle layer
catch (e) {
  throw OnErr(e, { configPath }).m('failed to read config')
}

// Top layer
catch (e) {
  throw OnErr(e).m('app initialization failed')
}
```

Final `msgs`:

```js
['ENOENT: file not found', 'failed to read config', 'app initialization failed']
```

---

## API

### `Err(message, [context_dict], [flag_dict])`

Creates an enhanced `Error`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `message` | `string` | Error message |
| `context_dict` | `object` | Debugging context (key-value pairs) |
| `flag_dict` | `object` | Rarely needed. Only when caller checks `err.code` |

**`context_dict` must be an object** — it's a map of key-value pairs, not just values:

```js
// Correct — key tells you what the value means
throw Err('load failed', { file, userId })
// → context: { file: '/data/x.json', userId: 123 }

// Wrong — just a value, no key
throw Err('load failed', file)
// → context: '/data/x.json'  ← what is this? no one knows when logging
```

Returns: `Error` with `msgs`, `original`, and `.m()` method.

### `OnErr(err, [context_dict], [flag_dict])`

Wraps/enhances an existing error.

| Parameter | Type | Description |
|-----------|------|-------------|
| `err` | `any` | The error to wrap (will be converted to Err) |
| `context_dict` | `object` | Additional context to merge (key-value pairs) |
| `flag_dict` | `object` | Rarely needed. Only when caller checks `err.code` |

Returns: The same error instance, enhanced.

- If `err` is not an `Error`, it becomes one
- `msgs` is initialized from `err.message` if not present
- `.m()` method is added if not present

### `.m(message)`

Appends a message to `err.msgs[]`.

Returns: The error instance (for chaining).

```js
throw OnErr(e, { file }).m('load failed')
```

---

## Protected Properties

These properties cannot be overwritten via `flag_dict`:

| Property | Reason |
|----------|--------|
| `name`, `message`, `stack`, `cause` | Standard Error properties |
| `msgs`, `original`, `m` | Core functionality of this library |
| `response` | Protected for compatibility with HTTP libraries (superagent, axios) |

---

## Philosophy

This library does **not** replace JavaScript's error system.
It adds what real-world debugging needs:

- **Flat, not nested** — everything in one place for easy logging
- **Message history** — see how the error bubbled up
- **Context accumulation** — see the state at each layer
- **Coding-friendly** — `if (err.code === 'E_TIMEOUT')` just works
- **Minimal and predictable** — no prototype hacks, no magic

The goal is **clarity** — not complexity.

---

## License

MIT © Ben P.P. Tung
