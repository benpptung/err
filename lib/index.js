'use strict'

exports.Err = Err

/**
 * Our own general Error object
 * @param       {string} msg       message
 * @param       {Object} original  debugging information
 * @param       {*} act       action code or object
 * @return      {Error}
 * @constructor
 */
function Err(msg, original, act) {

  var er = new Error(msg)

  // message array to allow us to add more extra messges
  // Also, we can put in action
  er.messages = [ act ]

  // original tells what happened at this moment
  er.original = Object.assign({}, original)

  return er
}

exports.OnErr = OnErr

/**
 * Wrap Error object with helpful information
 * @param       {Error} err
 * @param       {Object} [original]
 * @param       {Object} [act]
 * @constructor
 */
function OnErr(err, original, act) {

  // avoid err is undefined
  if (Object(err) !== err) {

    err = {
      messages: [act]
      // messages: [],
      // actions: []
    }
  }

  if (!Array.isArray(err.messages)) err.messages = [act]
  // if (!Array.isArray(err.actions)) err.actions = []
  // if (Object(act) === act) err.actions.push(act)

  // avoid original is null or undefined
  err.original = Object.assign({}, original, err.original)

  /************************************************
  /* Handle various possible error properties
   */

  // superagent err response
  if (err.response && err.response.text) {
    var errText = err.response.text
    try {
      errText = JSON.parse(err.response.text)
    }
    catch (er) { /* continue */} // eslint-disable-line
    err.original.errText = errText
  }

  return err
}
