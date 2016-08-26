'use strict'
var equal = (a, b) => {
  if (a !== undefined && a !== null && typeof a.equal === 'function') {
    return a.equal(b) }
  else {
    return a === b }}


Array.prototype.equal = function (other) {
  if (this === other) {
    return true }
  if (other === undefined || other === null) {
    return false }
  if (this.length != other.length) {
    return false }
  for (var i = 0; i < this.length; i++) {
    if ((i in this) && (i in other) && equal(this[i], other[i]) ||
        (!(i in this) && !(i in other))) {
      continue }
    return false }
  return true }


Array.prototype.add = function (elem) {
  if (!this.some(equal.bind(this, elem))) {
    return this.push(elem) }}


const QUERY_DOMAIN = 'http://electsysq.sjtu.edu.cn'
const REPORT_URL = QUERY_DOMAIN + '/ReportServer/Pages/ReportViewer.aspx?\
%2fExamArrange%2fLessonArrangeForOthers&rs:Command=Render'
const SCHEDULE_RULE = `
Schedule
  = '行课安排为第' _ block:Block+
    { return Array.prototype.concat.apply([], block) }

Block
  = week_skip:$( '单周'  _? / '双周'  _? / '' ) entry:Entry+
    {
      week_skip = ['', '单周', '双周'].indexOf(week_skip.substr(0, 2))
      entry = Array.prototype.concat.apply([], entry)
      entry.forEach(e => e.unshift(week_skip))
      return entry }

Entry
  = '星期' dow:[一二三四五六日] '  第' lesson_start:Integer '节--第' lesson_end:Integer '节' _ teacher:Teacher+
    {
      dow = '一二三四五六日'.indexOf(dow)
      lesson_start--
      return teacher.map(([week_start, week_end, classroom, teacher]) =>
        [week_start, week_end, dow, lesson_start, lesson_end]) }

Teacher
  = classroom:$[^.(\\r\\n]* '.'? '(' week_start:Integer '-' week_end:Integer '周)' ' '? '.'? teacher:$[^\\r\\n]* _
    {
      week_start--
      return [week_start, week_end, classroom, teacher] }

Integer
  = [0-9]+
    { return parseInt(text(), 10) }

_
  = $[^\\r\\n]* '\\r'? '\\n'
`
const STRUCT_DETAIL = [
  ['academy', 'yxmc', String],
  ['teacher', 'xm', String],
  ['title', 'zcmc', String],
  ['name', 'kcmc', String],
  ['fullref', 'kcbm', String],
  ['period', 'xqxs', Number],
  ['credit', 'xqxf', Number],
  ['rawschedule', 'sjms', String],
  ['note', 'bz', String],
  ['grade', 'nj', Number],
  ['year', 'xn', String],
  ['semester', 'xq', Number],
  ['choosen', 'yqdrs', Number],
  ['classroom', 'jsdm', String],
  ['building', 'jxlmc', String], ]
const FULLREF = 4
const RAWSCHEDULE = 7


if (PEG) {
  var schedule_parser = PEG.buildParser(SCHEDULE_RULE) }


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


var prepareArranges = (year, semester, grade = '', callback, force_p) =>
  loadArranges(() => {
    if (!force_p && l_timestamp.includes([year, semester, grade].join(' '))) {
      return callback && callback() }
    getArranges(year, semester, grade, l_new_arrange => {
      l_new_arrange.forEach(addArrange)
      l_timestamp.push([year, semester, grade].join('-'))
      chrome.storage.local.set({
        arrange: Array.from(d_arrange.values()),
        schedule: obj_lesson_schedule,
        timestamp: l_timestamp, })
      return callback && callback() }) })
