'use strict'

var through = require('through2')

module.exports = function (/*streams...*/) {
  var firstTick = true;
  var sources = []
  var output  = through.obj()

  output.setMaxListeners(0)

  output.add = add

  output.on('unpipe', remove)

  Array.prototype.slice.call(arguments).forEach(add)

  return output

  function add (stream_or_arr) {
    var new_sources = stream_or_arr instanceof Array ? stream_or_arr : [stream_or_arr]
    sources = sources.concat(new_sources)
    
    Array.prototype.slice.call(new_sources).forEach(function (source) {
      source.once('end', remove.bind(null, source))
      source.pipe(output, {end: false})
    })
    return this
  }

  function remove (source) {
    sources = sources.filter(function (it) { return it !== source })
    if (!sources.length && output.readable) { output.emit('end') }
  }
}
