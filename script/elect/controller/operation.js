'use strict'
setupResponseURL()
const REMOVE_BASE_URL = 'http://electsys.sjtu.edu.cn/edu/student/elect/\
removeRecommandLesson.aspx?bsid={}&redirectForm=removeLessonFast.aspx'


var removeBsid = function () {
  $.get(
    REMOVE_BASE_URL.replace('{}', $(this).data('bsid')),
    () => window.location.reload())
  return false }


var doSubmit = function ($sel_button, data_return) {
  var $form = $(this).closest('table').data('form')
  $form.find('input[value=' + $(this).closest('tr').data('value') + ']')
    .prop('checked', true)
  if (typeof $sel_button == 'string') {
    $sel_button = $form.find($sel_button) }
  if (data_return) {
    var form_data = $form.serializeArray()
    form_data.push({
      name: $sel_button.attr('name'),
      value: $sel_button.val()})
    return form_data }
  else {
    $sel_button.click()
    return false }}


var doSubmitFactory = $sel_button => function () {
  return doSubmit.call(this, $sel_button) }
var openArrange = doSubmitFactory('[id$=lessonArrange]')
var openInfo = doSubmitFactory('[id$=btnLessonInfo]')
var openSchedule = doSubmitFactory('#LessonTime1_btnSchedule')
var openPerLesson = doSubmitFactory('#LessonTime1_btnPerLesson')
var openTeacherInfo = doSubmitFactory('#LessonTime1_btnTeacherInfo')
var openChoose = doSubmitFactory('#LessonTime1_btnChoose')
var openCancel = doSubmitFactory('#LessonTime1_btnCancel')


var openToggle = function () {
  if (this.parentElement.classList.contains('choosen')) {
    return openCancel.call(this) }
  else {
    return openChoose.call(this) }}


var checkArrange = function () {
  fetchArrange.call(this)
  return false }


var $modal_waiting = null
var $modal_failed = null
var initViewArrange = () => {
  $modal_waiting = $('<div class="modal" id="modal-waiting" />')
  $modal_waiting.hide().appendTo('body')
  $modal_failed = $('<div class="modal" id="modal-failed" />')
  $modal_failed.hide().appendTo('body') }


var getRefModalID = ref => 'modal-' + ref
var $refModal = ref => $('#' + getRefModalID(ref))


var $button_arrange = $('[id$=lessonArrange]')
var fetchArrange = asyncWapper(function* (callback, auto_request) {
  var ref = $(this).closest('tr').data('value')
  $refModal(ref).remove()
  if (!ref.length) debugger

  var [data, textStatus, jqXHR] = yield ajax_queue.applyFor({
    method: 'post',
    url: $form_submit.attr('action'),
    // bug here
    beforeSend: () => console.debug(
      (auto_request ? 'Automatically sending request:' : 'Sending request:') +
      ref),
    data: doSubmit.call(this, $button_arrange, true), }, !auto_request)

  var response_url = URI(jqXHR.getResponseHeader('responseURL'))
  var directory = response_url.directory() + '/'
  var filename = response_url.filename()
  var $form_detail = $(data.match(/<form[^]*<\/form>/i)[0]
    .replace(/src="/gi, 'src="' + directory)
    .replace(/background="/gi, 'background="' + directory)
    .replace(/action="/gi, 'action="' + directory))
  if (filename.includes('messagePage')) {
      $form_detail.find('.button').remove()
      $modal_failed.empty().append($form_detail)
      if (callback) {
        return callback.call(this, $modal_failed) }}

  var $modal_detail = $('<div class="modal" />')
  $modal_detail.attr('id', getRefModalID(ref)).hide().appendTo('body')

  $form_detail.hide().appendTo($modal_detail)

  var $table_detail = $('<table class="table-available table-datail" />')
  $table_detail.data('form', $form_detail).appendTo($modal_detail)
  var [struct_l_detail, l_detail] = getAvailable(
    $form_detail.find('#LessonTime1_gridMain'), filename)
  initTable($table_detail, struct_l_detail, l_detail)
  $table_detail.before(
    $('<a href="#refresh-modal" class="refresh-modal" />')
      .text(chrome.i18n.getMessage('menu_right_refresh'))
      .click(doFetchArrange.bind(this)))

  l_detail.forEach(detail => setBsid(detail[0], detail[3]))
  saveBsids()
  setFullrefList(ref, l_detail.map(detail => detail[3]))
  updateEntry.call(this)

  if (callback) {
    return callback.call(this, $modal_detail) }})


var s_pending_ref = new Set
var fetch_running = false
var autoFetchArrange = () => {
  if (!s_pending_ref.size) {
    fetch_running = false
    return }
  fetch_running = s_pending_ref.values().next().value
  fetchArrange.call(fetch_running, function ($modal_detail) {
    if (($modal_detail.find('#lblMessage').text() || '').includes('达到上限')) {
      check_on_hover = null
      s_pending_ref.clear()
      fetch_running = false
      return $modal_detail.modal() }
    s_pending_ref.delete(this)
    if (fetch_running != this) {
      fetch_running.call(this, $modal_detail) }
    return autoFetchArrange() }, true) }


var addAutoFetchArrange = function () {
  if (s_pending_ref.has(this) ||
      $refModal($(this).closest('tr').data('value')).length) {
    return }
  s_pending_ref.add(this)
  if (!fetch_running) {
    autoFetchArrange() }}


var showDetail = $modal_detail => {
  if ($modal_waiting.is(':visible')) {
    $modal_detail.modal() }}


var doFetchArrange = function () {
  $modal_waiting.modal()
  if (fetch_running == this) {
    fetch_running = showDetail
    return }
  s_pending_ref.delete(this)
  fetchArrange.call(this, showDetail) }


var viewArrange = function () {
  var $tr = $(this).closest('tr')
  var ref = $tr.data('value')
  var $modal_detail = $refModal(ref)
  if ($modal_detail.length) {
    $modal_detail.modal() }
  else {
    doFetchArrange.call($tr.get(0)) }
  return false }
