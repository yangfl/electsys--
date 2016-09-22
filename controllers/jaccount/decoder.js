'use strict'
var sq_distance = (a, b, shift = 0) => {
  var max_len = Math.max(a.length, b.length)
  var result = 0
  for (var i = 0; i < max_len; i++) {
    result += Math.pow((a[shift + i] || 0) - (b[i] || 0), 2) }
  return result }


var findChar = char_wave => {
  var min_sq_dist = 10
  var min_char = undefined
  for (var char in d_std_char_wave) {
    for (var std_char_wave of d_std_char_wave[char]) {
      for (var shift of [0, 1, -1, 2, -2]) {
        var sq_dist = sq_distance(std_char_wave, char_wave, shift)
        if (sq_dist < min_sq_dist) {
          min_sq_dist = sq_dist
          min_char = char }}}}
  return min_char }


var splitWave = function* (wave) {
  var char_wave = []
  for (var amplitude of wave) {
    if (amplitude) {
      char_wave.push(amplitude) }
    else {
      if (char_wave.length) {
        yield char_wave
        char_wave = [] }}}}


function isValidResult (result) {
  return ( result.length == 4 || result.length == 5 ) &&
    Array.prototype.every.call(result, char => 'a' <= char && char <= 'z')
}


var decodeCaptcha = (img, debug_p) => {
  var canvas = document.createElement('canvas')

  if (typeof img.index == 'undefined') {
    img.index = function (x, y) {
      return 4 * (x + y * this.width) }}

  // put image into canvas
  var context = canvas.getContext('2d')
  context.drawImage(img, 0, 0)

  // get image data
  var image_data = context.getImageData(0, 0, img.width, img.height)
  image_data.threshold = function (index, threshold) {
    threshold = typeof threshold !== 'undefined' ? threshold : 128
    for (var i = index; i < index + 3; i++) {
      if (this.data[i] < threshold) {
        return false }}
    return true }

  var l_sum_y_img = []
  for (var x = 0; x < img.width; x++) {
    var sum_y_img = 0
    for (var y = 0; y < img.height; y++) {
      sum_y_img += !image_data.threshold(img.index(x, y)) }
    l_sum_y_img.push(sum_y_img) }

  var result = ''
  for (var char_wave of splitWave(l_sum_y_img)) {
    result += findChar(char_wave) }

  return (debug_p || isValidResult(result)) ? result : '' }
