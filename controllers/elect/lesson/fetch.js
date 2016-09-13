'use strict'
function fetchArranges (
    year = sdtleft.info.year, semester = sdtleft.info.semester, grade) {
  return fetch(ELECTQ.report, {credentials: 'include'})
    .then(handleResponseError).then(response => response.text()).then(data => {
      let doc = new DOMParser().parseFromString(data, 'text/html')
      // select option
      for (let [key, value] of
          [['03', year], ['05', semester], ['07', grade]]) {
        let select = doc.getElementById(
          'ReportViewerControl_ctl00_ctl' + key + '_ddValue')
        let query = 'not(text())'
        if (value) {
          query = 'text()="' + value + '"'
        }
        let option = doc.evaluate('//option[' + query + ']', select)
          .iterateNext()
        if (!option) {
          throw new RangeError('no matched value found: '  + value)
        }
        option.setAttribute('selected', true)
      }
      // serialize form
      let form_data = Array.from(
        new FormData(doc.getElementsByTagName('form')[0]).entries())
      let button = doc.getElementById('ReportViewerControl_ctl00_ctl00')
      form_data.push([button.name, button.value])
      return fetch(ELECTQ.report, postOptions(form_data))
    }).then(handleResponseError).then(response => response.text())
    .then(data => fetch(ELECTQ.host + JSON.parse(
      data.match(/new RSClientController\((.*)\)/)[1].split(',')[14]) + 'XML',
      {credentials: 'include'})).then(handleResponseError)
    .then(response => response.text()).then(parseArrangesXML)
}


function parseArrangesXML (data) {
  Array.prototype.forEach.call(
    // Detail
    new DOMParser().parseFromString(data, 'application/xml')
      .getElementsByTagName('Detail_Collection')[0].children,
    detail => {
      let entry = {}
      for (let attr in STRUCT_DETAIL) {
        let value = detail.getAttribute(attr).trim()
        if (value && !isNaN(value)) {
          value = Number(value)
        } else if (STRUCT_DETAIL[attr] === 'scheduleDesc') {
          value += '\r\n'
        }
        entry[STRUCT_DETAIL[attr]] = value
      }
      Lesson.from(entry)
    })
}


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
