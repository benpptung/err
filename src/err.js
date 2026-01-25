/**
 *
 * @param {string|undefined} msg
 * @param {object} [context_dict]
 * @param {object|string} [flag_dict]
 * @returns {Error & { msgs: string[], original: object }}
 */
function Err(msg, context_dict, flag_dict) {

  context_dict = Object(context_dict) === context_dict ? context_dict : {}

  var er = new Error(msg)

  // msgs: keep track of message history
  er.msgs = []
  if (typeof msg === 'string' && msg.length) {
    er.msgs.push(msg)
  }

  er.m = bind_message_setter(er)
  er.f = bind_flag_setter(er)
  er.c = bind_context_setter(er)

  er.original = Object.assign({}, context_dict)

  // flag_dict
  var safe_flags = build_safe_flags(flag_dict)
  Object.assign(er, safe_flags)

  return er
}

/**
 * Wrap/enhance an existing error with additional context and flag_dict.
 *
 * @param {any} err
 * @param {object} [context_dict]
 * @param {object|string} [flag_dict]
 * @returns {Error & { msgs: string[], original: object }}
 */
function OnErr(err, context_dict, flag_dict) {

  context_dict = Object(context_dict) === context_dict ? context_dict : {}

  // ensure Error instance
  if (!(err instanceof Error)) {

    var err_flags = {}

    // best-effort: keep original's own enumerable props if it's an object
    if (Object(err) === err) {
      Object.assign(err_flags, err)
    }

    err = new Error('Unknown error created by OnErr')
    Object.assign(err, err_flags)
  }

  // ensure msgs
  if (!Array.isArray(err.msgs)) {
    err.msgs = []
    if (typeof err.message === "string" && err.message.length) {
      err.msgs.push(err.message)
    }
  }

  // ensure err.original
  if (!err.original || Object(err.original) !== err.original) {
    err.original = {}
  }

  // merge context_dict: old wins, new fills holes
  err.original = Object.assign({}, context_dict, err.original)

  // ensure err.m is function
  if (typeof err.m !== 'function') {
    if (err.hasOwnProperty('m')) err.original['err.m'] = err.m // reserve the err.m
    err.m = bind_message_setter(err)
  }

  if (typeof err.f !== 'function') {
    if (err.hasOwnProperty('f')) err.original['err.f'] = err.f 
    err.f = bind_flag_setter(err)
  }

  if (typeof err.c !== 'function') {
    if (err.hasOwnProperty('c')) err.original['err.c'] = err.c
    err.c = bind_context_setter(err)
  }


  // merge flag_dict
  var safe_flags = build_safe_flags(flag_dict)
  Object.assign(err, safe_flags)

  return err
}

/**
 * Build safe flags that won't overwrite core Error/Err properties.
 *
 * @param {object} [flag_dict]
 * @returns {object}
 */
function build_safe_flags(flag_dict) {

  if (typeof flag_dict === 'string' && flag_dict.length) {
    flag_dict = { [flag_dict]: flag_dict }
  }

  flag_dict = Object(flag_dict) === flag_dict ? flag_dict : {}

  var safe_flags = Object.assign({}, flag_dict)

  // banned flags to overwrite
  delete safe_flags.name
  delete safe_flags.message
  delete safe_flags.stack
  delete safe_flags.cause
  delete safe_flags.original
  delete safe_flags.response
  delete safe_flags.msgs
  delete safe_flags.m
  delete safe_flags.f
  delete safe_flags.c

  return safe_flags
}

export { Err, OnErr }

function bind_message_setter(er) {
  return function(message) {
    if (typeof message === 'string' && message.length) {
      er.msgs.push(message)
    }
    return er
  }
}

function bind_flag_setter(er) {
  return function(flag_dict) {
    const safe_flags = build_safe_flags(flag_dict)
    return Object.assign(er,safe_flags)
  }
}

function bind_context_setter(er) {
  return function(context_dict) {
    context_dict = Object(context_dict) === context_dict ? context_dict : {}
      // merge context_dict: old wins, new fills holes
    er.original = Object.assign({}, context_dict, er.original)
    return er
  }
}