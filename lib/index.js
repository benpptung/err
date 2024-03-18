'use strict'

exports.Err = Err

function Err(msg, original, props) {

  original = Object(original) === original ? original : {}
  props = Object(props) === props ? props : {}

  var er = new Error(msg)
  er.msgs = []
  er.original = Object.assign({}, original)

  var safe_props = Object.assign({}, props)
  delete safe_props.message
  delete safe_props.stack
  delete safe_props.original
  delete safe_props.msgs

  Object.assign(er, safe_props)

  return er
}

// /**
//  * Our own general Error object
//  * @param       {string} msg       message
//  * @param       {Object} original  debugging information
//  * @param       {Object} info       info to be merged to original
//  * @return      {Error}
//  * @constructor
//  */
// function Err(msg, original, info) {

//   var er = new Error(msg)

//   // message array to allow us to add extra message at specific point
//   er.msgs = []

//   // if info is undefined
//   if (typeof info === 'undefined') {
//     er.original = Object.assign({}, original)
//     return er
//   }
 
//   // make sure info is an object to be merged into original
//   if (Object(info) !== info) {
//     info = { info }
//   }

//   // original tells what happened at this moment
//   er.original = Object.assign({}, original, info)
//   return er
// }

exports.OnErr = OnErr

/**
 * Wraps an existing error object with additional debugging information and custom properties.
 * If the error is already shaped by Err, it retains its structure while potentially adding new information.
 * Special handling is included for superagent errors.
 *
 * @param {Error} err The error object to wrap or enhance.
 * @param {Object} [original={}] Additional debugging information to merge into the error's original property.
 * @param {Object} [props={}] Custom properties to add to the error object, except 'name'.
 * @returns {Error} The enhanced error object.
 */
function OnErr(err, original, props) {

  original = Object(original) === original ? original : {}
  props = Object(props) === props ? props : {}

  // Ensure the err is an Error object; if not, convert it
  if (!(err instanceof Error)) {

    let err_props = {}
    if (Object(err) === err) {
      Object.assign(err_props, err) // clone props from the non-Error err
    }

    err = new Error('Unknown Error created by OnErr')
    Object.assign(err, err_props)
    
  }

  if (!Array.isArray(err.msgs)) err.msgs = []

  // Ensure err has an 'original' property
  if (!err.original || Object(err.original) !== err.original) {
    err.original = {}
  }

  // Merge provided 'original' into 'err.original', preserving existing values
  err.original = Object.assign({}, original, err.original)

  var safe_props = Object.assign({}, props)
  delete safe_props.message
  delete safe_props.stack
  delete safe_props.original
  delete safe_props.name
  delete safe_props.response
  delete safe_props.msgs

  // Merge 'safe_props' into the error object
  Object.assign(err, safe_props)

  // Handle superagent error response
  if (err.response && err.response.text) {
    try {
      const parsedText = JSON.parse(err.response.text)
      // Attach parsed response text or raw text to 'err.original'
      err.original.errText = parsedText
    } catch (parseError) { // eslint-disable-line 
      err.original.errText = err.response.text
    }
  }

  return err
}


// /**
//  * Wrap Error object with helpful information
//  * @param       {Error} err
//  * @param       {Object} [original]
// //  * @param       {Object} [act]
//  * @constructor
//  */
// function OnErr(err, original, info) {


//   // 確認一定有 msgs 
//   if (Object(err) !== err) {
//     //avoid err is undefined
//     err = {
//       msgs: []
//     }
//   }
//   if (!Array.isArray(err.msgs)) err.msgs = []
  
//   // process info & original
//   if (typeof info === 'undefined') {
//     // 如果 info 是 undefined, 不要綁 info, 
//     err.original = Object.assign({}, original, err.original)
//   }
//   else {

//     if (Object(info) !== info) info = { info }
//     err.original = Object.assign({}, original, info, err.original)
//   }

//   /************************************************
//   /* Handle various possible error properties
//    */

//   // superagent err response
//   if (err.response && err.response.text) {
//     var errText = err.response.text
//     try {
//       errText = JSON.parse(err.response.text)
//     }
//     catch (er) { /* continue */} // eslint-disable-line
//     err.original.errText = errText
//   }

//   return err
// }
