'use strict'
let schedule_table


function getEmptyScheduletable () {
  if (schedule_table === undefined) {
    schedule_table = '<table id="table-schedule">'
    schedule_table += '<tr>'
    for (let i_dow = 0; i_dow < 8; i_dow++) {
      schedule_table += '<th>'
      schedule_table += chrome.i18n.getMessage('scheduletable_' + i_dow)
      schedule_table += '</th>'
    }
    schedule_table += '</tr>'
    for (let i_lesson = 1; i_lesson <= 14; i_lesson++) {
      schedule_table += '<tr><th>'
      schedule_table += i_lesson
      schedule_table += '</th>'
      for (let i_dow = 0; i_dow < 7; i_dow++) {
        schedule_table += '<td></td>'
      }
      schedule_table += '</tr>'
    }
    schedule_table += '</table>'
  }
  return schedule_table
}


document.getElementById('handler-schedule')
  .addEventListener('click', function onclickHandlerSchedule () {
    // since display status will be changed soon
    sessionStorage.showLessontable =
      this.previousElementSibling.offsetParent === null
    $(this.previousElementSibling).slideToggle({
      complete: () => this.classList.toggle('expand')
    })
  })


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


var updateschedule = (s_fullref, test_fullref) => {
  var $tr = $('#table-schedule > tbody > tr:not(:first)')
  $tr.children('td').text('').removeAttr('rowspan').removeAttr('class')
  s_fullref.forEach(fullref => drawLessonEntry($tr, fullref))
  if (test_fullref) {
    drawLessonEntry($tr, test_fullref, $td => $td.addClass('preview')) }}


var clearPreviewLesson = () => $('.preview', $container_schedule).remove()


var previewLesson = (fullref) => {
  if (!$container_schedule || !$container_schedule.is(':visible')) {
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
    $container_schedule.append($('<div class="alltab preview" />').css({
      top: $tr_start.offset().top - $tr_start.offsetParent().offset().top +
           'px',
      left: $td_dow.offset().left - $tr_start.offsetParent().offset().left +
            'px',
      width: $td_dow.innerWidth() +
             parseInt($td_dow.css('border-left-width')) + 'px',
      height: $tr_end.offset().top - $tr_start.offset().top +
              $tr_end.innerHeight() -
              parseInt($td_dow.css('border-top-width')) + 'px', })) }}
