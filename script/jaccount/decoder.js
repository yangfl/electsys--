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


var testResult = result =>
  4 <= result.length && result.length <= 5 &&
  Array.prototype.every.call(result, char => 'a' <= char && char <= 'z')


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
  image_data.binarizate = function (index, threshold) {
    threshold = typeof threshold !== 'undefined' ? threshold : 128
    for (var i = index; i < index + 3; i++) {
      if (this.data[i] < threshold) {
        return false }}
    return true }

  /* ocrad.js
  document.documentElement.appendChild(canvas)
  for (var i = 0; i < image_data.data.length; i += 4) {
    image_data.data[i] = image_data.data[i + 1] = image_data.data[i + 2] =
      image_data.binarizate(i) * 255 }
  context.putImageData(image_data, 0, 0)

  var new_image_data = context.getImageData(0, 0, img.width, img.height)
  for (var x = 7; x < img.width - 8; x++) {
    for (var y = 7; y < img.height - 8; y++) {
      if (image_data[img.index(x, y)] == 0) {
        for (var dx = -7; dx < 8; dx++) {
          for (var dy = -7; dy < 8; dy++) {
            if (dx || dy) {
              var target_pix = img.index(x + dx, y + dy)
              if (new_image_data.data[target_pix] == 255) {
                for (var i = 0; i < 4; i++) {
                  new_image_data.data[target_pix + i] = 0 }}}}}}}}
  context.putImageData(new_image_data, 0, 0)

  image_data = context.getImageData(0, 0, img.width, img.height)
  var result =  OCRAD(image_data).split('').map(char => {
    if ('a' <= char && char <= 'z') {
      return char }
    switch (char) {
      case ' ':
        return ''
      case '(':
      case '<':
        return 'c'
      case '5':
        return 's'
      case '9':
        return 'q'
      case '|':
      case 'I':
        return 'l' }}).join('') */

  /* math.js
  var l_l_img = []
  var l_sum_x_img = []
  for (var i = 0; i < image_data.data.length;) {
    var l_x_img = []
    var sum_x_img = 0
    for (var x = 0; x < img.width; i += 4, x++) {
      var pix_i_img = image_data.binarizate(i)
      l_x_img.push(pix_i_img)
      sum_x_img += !pix_i_img }
    // strip start
    if (l_l_img.length || sum_x_img) {
      l_l_img.push(l_x_img)
      l_sum_x_img.push(sum_x_img) }}
  // strip end
  while (l_sum_x_img[l_l_img.length - 1] == 0) {
    l_l_img.pop()
    l_sum_x_img.pop() }
  // console.info(l_sum_x_img)
  var matrix_img = math.matrix(l_l_img)
  */

  /* a method */
  var l_sum_y_img = []
  for (var x = 0; x < img.width; x++) {
    var sum_y_img = 0
    for (var y = 0; y < img.height; y++) {
      sum_y_img += !image_data.binarizate(img.index(x, y)) }
    l_sum_y_img.push(sum_y_img) }

  var result = ''
  for (var char_wave of splitWave(l_sum_y_img)) {
   result += findChar(char_wave) }

  return (debug_p || testResult(result)) ? result : '' }
