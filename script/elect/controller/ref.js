'use strict'
var obj_ref_fullref
var s_ref_filtered
var l_exclude_word


var parseRef = fullref => fullref.match(/\)(.*)\(/)[1]


var initRef = () => {
  obj_ref_fullref = {}
  s_ref_filtered = new Set
  for (var fullref in obj_lesson_schedule) {
    var ref = parseRef(fullref)
    if (!(ref in obj_ref_fullref)) {
      obj_ref_fullref[ref] = [] }
    obj_ref_fullref[ref].push(fullref) }}


var localStorageRefName = ref => ref + ' ' + current_page


var hasFullrefList = ref => localStorageRefName(ref) in localStorage


var getFullrefList = value => {
  if (isNaN(value)) {
    // ref
    var s_l_fullref = localStorage[localStorageRefName(value)]
    if (s_l_fullref !== undefined) {
      if (s_l_fullref) {
        return s_l_fullref.split(' ') }
      else {
        return [] }}
    else if (value in obj_ref_fullref) {
      if (!(s_ref_filtered.has(value))) {
        obj_ref_fullref[value] = filterFullrefList(obj_ref_fullref[value])
        s_ref_filtered.add(value) }
      return obj_ref_fullref[value] }}
  else {
    // bsid
    value = Number(value)
    if (value in obj_bsid_fullref) {
      return [obj_bsid_fullref[value]] }}}


var isNoteVaild = note => {
  if (current_page == 'ShortSessionLesson' && !note.includes('夏季学期')) {
    return false }
  return !l_exclude_word.some(exclude_word => note.includes(exclude_word)) }


var isFullrefVaild = fullref => isNoteVaild(d_arrange.get(fullref)[8])


var filterFullrefList = l_fullref => l_fullref.filter(isFullrefVaild)


var setFullrefList = (ref, l_fullref) => localStorage.setItem(
  localStorageRefName(ref), filterFullrefList(l_fullref).join(' '))
