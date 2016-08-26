'use strict'
var dowToNumber = str_dow => '日一二三四五六'.indexOf(str_dow)

var $tr_selected = $('#Orders__ctl0 tr:not(:first)')

if ($tr_selected.length < 7 &&
    !$('#Tip').text().includes('请您在以后时间再选')) {
  if (!$('#ExpeWeekList > option:selected').length) {
    var l_week_selected = $tr_selected.children(':nth-child(3)')
      .map(function () {return $(this).text() }).toArray()
    var this_week = $('#Banner1_lblTip').text().match(/第 (\d+) 周/)[1]
    $('#ExpeWeekList > option').each(function () {
      if ($(this).text() > this_week &&
          !l_week_selected.includes($(this).text())) {
        $(this).prop('selected', true)
        ExpeWeekList.dispatchEvent(new MouseEvent('click'))
        return false }}) }
  else if (!$('#ExpeTimeList > option:selected').length) {
    var this_dow = dowToNumber($('#Banner1_lblTip').text().match(/星期(.)/)[1])
    var l_time_selected = $tr_selected.children(':nth-child(4)')
      .map(function () {return $(this).text() }).toArray()
      .filter(time => dowToNumber(time.substr(2, 1)) > this_dow)
    var preferred_time = l_time_selected[0]
    $('#ExpeTimeList > option').each(function () {
      if ($(this).text() == preferred_time) {
        $(this).prop('selected', true)
        ExpeTimeList.dispatchEvent(new MouseEvent('click'))
        return false }}) }
  else if (!$('#ExpeNameList > option:selected').length) {
    var l_name_selected = $tr_selected.children(':nth-child(2)')
      .map(function () {return $(this).text().substr(0, 5) }).toArray()
    $('#ExpeNameList > option').each(function () {
      if (l_name_selected.every(name => !$(this).text().includes(name))) {
        $(this).prop('selected', true)
        $('#btnAdd').click()
        return false }}) }}
