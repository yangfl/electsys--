'use strict'
var getEmptyLessontable = () => {
  var table = '<table id="table-lessontable">'
  table += '<tr>'
  for (var i_dow = 0; i_dow < 8; i_dow++) {
    table += '<th>'
    table += chrome.i18n.getMessage('lessontable_' + i_dow)
    table += '</th>' }
  table += '</tr>'
  for (var i_lesson = 1; i_lesson <= 14; i_lesson++) {
    table += '<tr><th>'
    table += i_lesson
    table += '</th>'
    for (var i_dow = 0; i_dow < 7; i_dow++) {
      table += '<td></td>' }
    table += '</tr>' }
  table += '</table>'
  return table }


var initLessontable = ($root = $('body'), table = getEmptyLessontable()) => {
  $('<div id="topbar-lessontable" />').prependTo($root)
    .append($('<div id="container-lessontable" />').append(table))
    .append($('<div id="handler-lessontable" />').click(function () {
      sessionStorage.show_lessontable = !$(this).prev().is(":visible")
      $(this).prev().slideToggle({
        complete: () => $(this).toggleClass('expand')}) }))
  if (sessionStorage.show_lessontable == 'true') {
    $('#handler-lessontable').click() }}


var drawLessonEntry = ($tr, fullref, styler = () => {}) => {
  var arrange = d_arrange.get(fullref)
  var name = arrange[3] + '（' +
    arrange[7].match(/\d+/g).slice(0, 2).join('-') + '周）[' +
    (arrange[13].length > 2 ? arrange[13] : '教室未定') + ']'
  obj_lesson_schedule[fullref].forEach(schedule => {
    styler($tr.eq(schedule[4]).children().eq(schedule[3] + 1)
      .attr('rowspan', schedule[5] - schedule[4])
      .text(name + (schedule[0] == 1 ? '单周' : schedule[0] == 2 ? '双周' : '')))
    for (var i_lesson = schedule[4] + 1; i_lesson < schedule[5]; i_lesson++) {
      $tr.eq(i_lesson).children().eq(schedule[3]).hide() }}) }


var updateLessontable = (s_fullref, test_fullref) => {
  var $tr = $('#table-lessontable > tbody > tr:not(:first)')
  $tr.children('td').text('').removeAttr('rowspan').removeAttr('class')
  s_fullref.forEach(fullref => drawLessonEntry($tr, fullref))
  if (test_fullref) {
    drawLessonEntry($tr, test_fullref, $td => $td.addClass('preview')) }}


var clearPreviewLesson = () => $('.preview', $container_lessontable).remove()


var previewLesson = (fullref) => {
  if (!$container_lessontable || !$container_lessontable.is(':visible')) {
    return }
  var l_schedule = obj_lesson_schedule[fullref]
  if (!l_schedule) {
    return }
  for (var [week_skip, week_start, week_end,
            dow, lesson_start, lesson_end] of l_schedule) {
    var $tr_start = $table_small_choosen.find('tr').eq(1 + lesson_start)
    var $tr_end = $table_small_choosen.find('tr').eq(lesson_end)
    var $td_dow =
      $table_small_choosen.find('tr:first').children().eq(1 + dow)
    $container_lessontable.append($('<div class="alltab preview" />').css({
      top: $tr_start.offset().top - $tr_start.offsetParent().offset().top +
           'px',
      left: $td_dow.offset().left - $tr_start.offsetParent().offset().left +
            'px',
      width: $td_dow.innerWidth() +
             parseInt($td_dow.css('border-left-width')) + 'px',
      height: $tr_end.offset().top - $tr_start.offset().top +
              $tr_end.innerHeight() -
              parseInt($td_dow.css('border-top-width')) + 'px', })) }}
