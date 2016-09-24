'use strict'
{
  /* handler */
  const div_handler_schedule = document.getElementById('handler-schedule')
  div_handler_schedule.addEventListener('click', function () {
    // since display status will be changed soon
    sessionStorage.showLessontable =
      this.previousElementSibling.offsetParent === null
    $(this.previousElementSibling).slideToggle({
      complete: () => this.classList.toggle('expand')
    })
  })

  if (sessionStorage.showLessontable == 'true') {
    div_handler_schedule.click()
  }

  document.getElementById('container-schedule')
    .addEventListener('click', event => {
      if (event.target.classList.contains('classtit') ||
          event.target.classList.contains('classtit2') ||
          event.target.nodeName === 'TH') {
        // hide table when click th
        div_handler_schedule.click()
      } else if (event.target.nodeName === 'TD') {
        // click inner a if only one a in td
        let l_a = event.target.getElementsByTagName('a')
        if (l_a.length === 1) {
          l_a[0].click()
        }
      } else if (event.target.nodeName === 'A') {
        // remove lesson when click a
        Lesson.from(Number(event.target.dataset.bsid)).then(l => l.remove())
        // prevent redirect
        event.preventDefault()
      }
    })
}


let scheduleTable
{
  /* container */
  const div_schedule = document.getElementById('container-schedule')

  scheduleTable = {
    _node: undefined,
    generate () {
      if (table_schedule === undefined) {
        let table_schedule = '<table id="table-schedule"><thead>'
        table_schedule += '<tr>'
        for (let i_dow = 0; i_dow < 8; i_dow++) {
          table_schedule += '<th>'
          table_schedule += chrome.i18n.getMessage('scheduletable_' + i_dow)
          table_schedule += '</th>'
        }
        table_schedule += '</tr></thead><tbody>'
        for (let i_lesson = 1; i_lesson <= 14; i_lesson++) {
          table_schedule += '<tr><th>'
          table_schedule += i_lesson
          table_schedule += '</th>'
          for (let i_dow = 0; i_dow < 7; i_dow++) {
            table_schedule += '<td></td>'
          }
          table_schedule += '</tr>'
        }
        table_schedule += '</tbody></table>'
        let div = document.createElement('div')
        div.innerHTML = table_schedule
        scheduleTable._node = div.firstElementChild
      }
      return scheduleTable._node.cloneNode(true)
    },

    preview: {
      clear () {
        let l_preview = div_schedule.getElementsByClassName('preview')
        let i = l_preview.length
        while (i--) {
          l_preview.remove()
        }
      },

      draw (lesson) {
      },
    },

    show (table = scheduleTable.generate()) {
      // remove old schedule table
      while (div_schedule.lastElementChild) {
        div_schedule.removeChild(div_schedule.lastElementChild)
      }
      // append new
      div_schedule.appendChild(table)
    },
  }
}


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
