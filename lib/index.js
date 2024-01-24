'use strict'

exports.Err = Err

/**
 * Our own general Error object
 * @param       {string} msg       message
 * @param       {Object} original  debugging information
 * @param       {Object} info       info to be merged to original
 * @return      {Error}
 * @constructor
 */
function Err(msg, original, info) {

  var er = new Error(msg)

  // message array to allow us to add extra message at specific point
  er.msgs = []

  // if info is undefined
  if (typeof info === 'undefined') {
    er.original = Object.assign({}, original)
    return er
  }
 
  // make sure info is an object to be merged into original
  if (Object(info) !== info) {
    info = { info }
  }

  // original tells what happened at this moment
  er.original = Object.assign({}, original, info)
  return er
}

exports.OnErr = OnErr

/**
 * Wrap Error object with helpful information
 * @param       {Error} err
 * @param       {Object} [original]
//  * @param       {Object} [act]
 * @constructor
 */
function OnErr(err, original, info) {


  // 確認一定有 msgs 
  if (Object(err) !== err) {
    //avoid err is undefined
    err = {
      msgs: []
    }
  }
  if (!Array.isArray(err.msgs)) err.msgs = []
  
  // process info & original
  if (typeof info === 'undefined') {
    // 如果 info 是 undefined, 不要綁 info, 
    err.original = Object.assign({}, original, err.original)
  }
  else {

    if (Object(info) !== info) info = { info }
    err.original = Object.assign({}, original, info, err.original)
  }

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
