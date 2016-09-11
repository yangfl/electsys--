'use strict'
var getArranges = (year, semester, grade, callback) =>
  $.get(REPORT_URL, data => {
    var $report = $(data.match(/<form[^]*<\/form>/i)[0])
    ;[['03', year], ['05', semester], ['07', grade]].forEach(
      ([key, value]) => {
        var $select = $report
          .find('#ReportViewerControl_ctl00_ctl' + key + '_ddValue').children()
          .filter(function () {return $(this).html() == value })
        if (!$select.length) {
          throw 'no matched value found: '  + value }
        $select.prop('selected', true) })
    var form_data = $report.serializeArray()
    var $button = $report.find('#ReportViewerControl_ctl00_ctl00')
    form_data.push({name: $button.attr('name'), value: $button.val()})
    $.post(REPORT_URL, form_data, data => $.get(
      QUERY_DOMAIN + JSON.parse(
        data.match(/new RSClientController\((.*)\)/)[1].split(',')[14]) + 'XML',
      node_root => callback(Array.prototype.map.call(
        node_root.getElementsByTagName('Detail'),
        node_detail => STRUCT_DETAIL.map(([field, attr, fn]) =>
          fn((node_detail.getAttribute(attr) || '').trim())))))) })


var fixWeekSkip =
    ([week_skip, week_start, week_end, dow, lesson_start, lesson_end]) => {
  if (week_skip == 1) {
    if (week_start & 1) {
      week_start++ }
    if (!(week_end & 1)) {
      week_end-- }}
  else if (week_skip == 2) {
    if (!(week_start & 1)) {
      week_start++ }
    if (week_end & 1) {
      week_end-- }}
  return [week_skip, week_start, week_end, dow, lesson_start, lesson_end] }


var addArrange = arrange => {
  if (d_arrange.has(arrange[FULLREF])) {
    var old_arrange = d_arrange.get(arrange[FULLREF])
    if (old_arrange[RAWSCHEDULE] != arrange[RAWSCHEDULE]) {
      console.warn(old_arrange, arrange) }}
  d_arrange.set(arrange[FULLREF], arrange)
  var l_schedule = []
  if (!arrange[RAWSCHEDULE].includes('不安排教室')) {
    try {
      schedule_parser.parse(arrange[RAWSCHEDULE] + '\n')
        .map(fixWeekSkip).forEach(l_schedule.add.bind(l_schedule)) }
    catch (e) {
      console.error(arrange)
      throw e }}
  obj_lesson_schedule[arrange[FULLREF]] = l_schedule }
