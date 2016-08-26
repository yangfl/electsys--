'use strict'
var d_arrange = new Map
var obj_lesson_schedule = null
var l_timestamp = null


var loadArranges = callback => {
  if (obj_lesson_schedule) {
    return callback && callback() }
  return chrome.storage.local.get(
    ['arrange', 'schedule', 'timestamp'], item => {
      item.arrange.forEach(arrange => d_arrange.set(arrange[4], arrange))
      obj_lesson_schedule = item.schedule
      l_timestamp = item.timestamp
      return callback && callback() }) }


var isEntryIntersect =
    ([this_week_skip, this_week_start, this_week_end,
      this_dow, this_lesson_start, this_lesson_end],
     [other_week_skip, other_week_start, other_week_end,
      other_dow, other_lesson_start, other_lesson_end]) => {
  if (this_dow != other_dow) {
    return false }
  if (this_lesson_end <= other_lesson_start ||
      other_lesson_end <= this_lesson_start) {
    return false }
  if ((this_week_skip == 1 && other_week_skip == 2) ||
      (this_week_skip == 2 && other_week_skip == 1)) {
    return false }
  if (this_week_end <= other_week_start || other_week_end <= this_week_start) {
    return false }
  return true }


var isScheduleIntersect = (this_schedule, other_schedule) =>
  this_schedule.some(this_entry => other_schedule.some(other_entry =>
    isEntryIntersect(this_entry, other_entry)))


var isLessonIntersect = (this_fullref, other_fullref) => isScheduleIntersect(
  obj_lesson_schedule[this_fullref], obj_lesson_schedule[other_fullref])
