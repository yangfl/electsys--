'use strict'
const SEL_BUTTON_PREVIOUS = {
  speltyRequiredCourse: '#SpeltyRequiredCourse1_btnXuanXk',
  speltyLimitedCourse: '#btnBxk',
  speltyCommonCourse: '#btnXxk',
  outSpeltyEP: '#OutSpeltyEP1_btnTxk',
  freshmanLesson: '#btnXuanXk',
  secondRoundFP: '#btnXuanXk', }
const SEL_BUTTON_NEXT = {
  speltyRequiredCourse: '#SpeltyRequiredCourse1_btnXxk',
  speltyLimitedCourse: '#btnTxk',
  speltyCommonCourse: '#btnXuanXk',
  outSpeltyEP: '#OutSpeltyEP1_btnBxk',
  freshmanLesson: '#btnBxk',
  secondRoundFP: '#btnBxk', }
var $table_available = $('[id$=gridMain]')


var current_page = window.location.pathname
current_page = current_page.substring(
  current_page.lastIndexOf('/') + 1, current_page.lastIndexOf('.'))


var selectOption = function (seek) {
  if (seek !== undefined) {
    var $cur_option = $('[selected]', this)
    switch (typeof seek) {
      case 'string':
        while (1) {
          $cur_option = $cur_option[seek]()
          if (!$cur_option.length) {
            return false }
          if (!$cur_option.prop('disabled')) {
            break }}}
    $cur_option.prop('selected', true) }
  $('#OutSpeltyEP1_btnQuery').click()
  return false }


switch (current_page) {
  case 'outSpeltyEP':
    $('select')
      .change(() => selectOption())
      .bind('mousewheel', function (e) {return selectOption.call(
        this, e.originalEvent.wheelDelta > 0 ? 'prev' : 'next') })
    break
  case 'speltyCommonCourse':
  case 'speltyLimitedCourse':
    $('[id$=Module] > tbody > tr:not(:first)').click(function () {
      $(this).find('input[type=radio]').get(0)
        .dispatchEvent(new MouseEvent('click')) })
    break }


var $form_submit = $('form:first')
if (current_page != 'viewLessonArrange') {
  $('body').append($form_submit.detach().append(
    $('body').children().detach())) }


var modal_page_action = (modal_handler, page_handler) => () => {
  var $modal = $('.modal').filter(':visible')
  if ($modal.length) {
    modal_handler($modal) }
  else {
    page_handler() }}
switch (current_page) {
  case 'speltyRequiredCourse':
    var $button_submit = $('#SpeltyRequiredCourse1_Button1')
    break
  case 'viewLessonArrange':
    var $button_submit = $('#LessonTime1_btnChoose')
    break
  default:
    var $button_submit = $('[id$=btnSubmit]') }
$(document).bind('keydown', 'r', modal_page_action(
  $modal => $modal.find('.refresh-modal').click(),
  () => window.location.reload()))
$(document).bind('keydown', 's', () => $button_submit.click())
$(document).bind('keydown', 'b', modal_page_action(
  $modal => $modal.find('.close-modal').click(), () => window.history.back()))
if (current_page in SEL_BUTTON_PREVIOUS) {
  $(document).bind('keydown', 'a', () =>
    $(SEL_BUTTON_PREVIOUS[current_page]).click())
  $(document).bind('keydown', 'f', () =>
    $(SEL_BUTTON_NEXT[current_page]).click()) }


$('input[type=submit]').filter(function () {return this.disabled }).hide()


var $table_button = $button_submit.closest('table')
// move buttons up
switch (current_page) {
  case 'removeLessonFast':
    var $tr_prev_button = $('body table tr:first')
    break
  /* case 'viewLessonArrange':
    var $tr_prev_button =
      $('<tr />').insertBefore($('#Table1 tr:first'))
    break
  default: */
  case 'secondRoundFP':
    var $tr_prev_button =
      $tr_prev_button || $('#Table1 tr:first') }
if ($tr_prev_button) {
  $tr_prev_button.after($table_button.closest('tr')) }
