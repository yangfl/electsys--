'use strict'
if ($('body #lblMsg_top').text().includes('评教成功')) {
  $('#btnReturn').click() }


var myRandom = (a, b, n, k) => {
  if (k + 1 == n) {
    return b }
  var s = []
  for (var i = 0; i < n; i++) {
    s.push(Math.random()) }
  s.sort()
  return a + (b - a) / (s[n - 1] - s[0]) * (s[k] - s[0]) }


chrome.storage.sync.get(
  ['random_a', 'random_b', 'random_n', 'random_k1', 'random_k2', 'random_k3'],
  item => {
    switch (window.location.hash) {
      case '#good-y':
      case '#good':
        var k = item.random_k1
        break
      case '#average':
        var k = item.random_k2
        break
      case '#poor':
        var k = item.random_k3
        break
      default:
        return }

    window.scrollTo(0, document.body.scrollHeight)

    var a = item.random_a
    var b = item.random_b
    var n = item.random_n

    /*
    $('script:last').text().match(/{".*?"}/g).map(JSON.parse).forEach(item => {
      var value = Math.round(myRandom(a, b, n, k) * item.Maximum)
      var input_sBoundControl = document.getElementById(item.BoundControlID)
      input_sBoundControl.value = value
      triggerKeyEvent(input_sBoundControl, 13) })
    */

  var script = document.createElement('script')
  script.textContent = `
var myRandom = ${myRandom}
Sys.Application.add_init(() => Sys.Application.getComponents().forEach(
  component => component.set_Value(
    myRandom(${a}, ${b}, ${n}, ${k}) * component.get_Maximum())))`
  if (window.location.hash == '#good-y') {
    script.textContent += `
Sys.Application.add_init(() => btnSubmit.click())` }
  document.body.appendChild(script) })
