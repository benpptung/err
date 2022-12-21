'use strict'

exports.Err = Err

/**
 * Our own general Error object
 * @param       {String} msg       message
 * @param       {Object} original  debugging information
 * @param       {*} act       action code or object
 * @constructor
 */
function Err(msg, original, act) {

  var er = new Error(msg)

  // message array to collect messages
  er.messages = [ msg ]

  // original tells what happened at this moment
  er.original = Object.assign({}, original)

  // act store the value what we should act,
  // in context, we can loop the arror to find the act object, if necessary
  er.actions = typeof act === 'undefined' ? [] : [ act ]
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
      messages: ['undefined err'],
      actions: []
    }
  }

  if (!Array.isArray(err.actions)) err.actions = []
  if (Object(act) === act) err.actions.push(act)

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
