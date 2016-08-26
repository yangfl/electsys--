'use strict'
var rnd = () =>
  ((Math.random() + Math.random() + Math.random() +
    Math.random() + Math.random() + Math.random()) - 3) * 1.411089577


/* async */
var asyncWapper = (genertorFactory, callback = () => {}) => function () {
  var generator = genertorFactory.apply(this, arguments)
  var handleResult = result => result && (result.done ?
    callback(result.value) :
    result.value.then(
      function () {return handleResult(generator.next(arguments)) },
      generator.throw.bind(generator)))
  return handleResult(generator.next()) }
/* async */


/* responseURL */
var getAllResponseHeaders = function () {
  return this.constructor.prototype.getAllResponseHeaders.call(this) +
    'responseURL: ' + this.responseURL + '\r\n' }


var setupResponseURL = () => {
  $.ajaxSettings.xhr = () => {
    var xhr = new XMLHttpRequest
    xhr.getAllResponseHeaders = getAllResponseHeaders
    return xhr }}
/* responseURL */


/* scheduler */
var default_interval = null
var interval_penalty = null
chrome.storage.sync.get(['step_base', 'step_penalty'], item => {
  default_interval = item.step_base
  interval_penalty = item.step_penalty })


var testMessagePage = data => {
  if (data.includes('请勿频繁刷新本页面')) {
    return false }
  if (data.includes('<title>请重新登录</title>')) {
    throw 'logout' }
  return true }


class OuterPromise {
  then (onFulfilled, onRejected) {
    this.onFulfilled = onFulfilled
    this.onRejected = onRejected }}


class AjaxQueue extends Array {
  applyFor (settings, jump_queue) {
    if (!('interval' in settings)) {
      settings.interval = default_interval }
    var promise = new OuterPromise
    this[jump_queue ? 'unshift' : 'push']([settings, promise])
    if (!this.isRunning()) {
      this.start() }
    return promise }

  isRunning () {
    return !!this.timer }

  process () {
    this.timer = true
    if (this.length) {
      var [settings, promise] = this.shift()
      $.ajax(settings).then(
        (data, textStatus, jqXHR) => {
          var pass_p = testMessagePage(data)
          if (!pass_p) {
            console.warn(
              'interval doubled from', settings.interval,
              'to', settings.interval *= interval_penalty)
            this.unshift([settings, promise]) }
          if (this.isRunning()) {
            this.start(settings.interval) }
          if (pass_p) {
            return promise.onRejected && promise.onFulfilled.call(
              this, data, textStatus, jqXHR) }},
        () => promise.onRejected && promise.onRejected.call(this)) }
    else {
      this.stop() }}

  start (interval = 0) {
    this.timer = setTimeout(this.process.bind(this), interval) }

  stop () {
    if (typeof this.timer == 'number') {
      clearTimeout(this.timer) }
    delete this.timer }}


var ajax_queue = new AjaxQueue
/* scheduler */
