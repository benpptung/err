/**
 *
 * @param {string|undefined} msg
 * @param {object} [original]
 * @param {object} [props]
 * @returns {Error & { msgs: string[], original: object }}
 */
function Err(msg, original, props) {

  original = Object(original) === original ? original : {}

  var er = new Error(msg)

  // msgs: keep track of message history
  er.msgs = []
  if (typeof msg === 'string' && msg.length) {
    er.msgs.push(msg)
  }
  er.original = Object.assign({}, original)

  // safe props
  var safe_props = build_safe_props(props)
  Object.assign(er, safe_props)

  return er
}

/**
 * Wrap/enhance an existing error with additional context and props.
 *
 * @param {any} err
 * @param {object} [original]
 * @param {object} [props]
 * @returns {Error & { msgs: string[], original: object }}
 */
function OnErr(err, original, props) {

  original = Object(original) === original ? original : {}

  // ensure Error instance
  if (!(err instanceof Error)) {

    var err_props = {}

    // best-effort: keep original's own enumerable props if it's an object
    if (Object(err) === err) {
      Object.assign(err_props, err)
    }

    err = new Error('Unknown error created by OnErr')
    Object.assign(err, err_props)
  }

  // ensure msgs
  if (!Array.isArray(err.msgs)) {
    err.msgs = []
  }

  // ensure original
  if (!err.original || Object(err.original) !== err.original) {
    err.original = {}
  }

  // merge original: old wins, new fills holes
  err.original = Object.assign({}, original, err.original)

  // merge safe props
  var safe_props = build_safe_props(props)
  Object.assign(err, safe_props)

  return err
}

/**
 * Build safe props that won't overwrite core Error/Err properties.
 *
 * @param {object} [props]
 * @returns {object}
 */
function build_safe_props(props) {

  props = Object(props) === props ? props : {}

  var safe_props = Object.assign({}, props)

  // banned props to overwrite
  delete safe_props.message
  delete safe_props.stack
  delete safe_props.original
  delete safe_props.name
  delete safe_props.response
  delete safe_props.msgs
  delete safe_props.cause

  return safe_props
}

export { Err, OnErr }
