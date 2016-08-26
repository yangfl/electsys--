'use strict'
const BSID_BASE_URL = 'http://electsys.sjtu.edu.cn/edu/lesson/\
viewLessonArrangeDetail2.aspx?bsid='
var obj_bsid_fullref
var dirty_obj_bsid_fullref


var loadBsids = callback => {
  if (obj_bsid_fullref) {
    return callback && callback() }
  return chrome.storage.local.get('bsid', item => {
    obj_bsid_fullref = item.bsid
    dirty_obj_bsid_fullref = false
    return callback && callback() }) }


var setBsid = (bsid, fullref) => {
  if (!isNaN(bsid) && fullref) {
    bsid = Number(bsid)
    fullref = fullref.trim()
    if (bsid in obj_bsid_fullref) {
      if (fullref != obj_bsid_fullref[bsid]) {
        console.error(bsid, obj_bsid_fullref[bsid], fullref)
        throw 'fullref mismatched' }}
    else {
      obj_bsid_fullref[bsid] = fullref
      dirty_obj_bsid_fullref = true }}}


var setBsidFromHtml =
    (url = window.location.href, data = document.documentElement.innerHTML) =>
  setBsid(url.split('=')[1], (data.match(/课号.*\r?\n(.*)/) || [])[1])


var saveBsids = callback => {
  if (dirty_obj_bsid_fullref) {
    dirty_obj_bsid_fullref = false
    return chrome.storage.local.set({bsid: obj_bsid_fullref}, callback) }
  else {
    return callback && callback() }}


var prepareBsids = (iterable_bsid, callback) =>
  loadBsids(asyncWapper(function* () {
    for (var bsid of iterable_bsid) {
      bsid = Number(bsid)
      if (bsid in obj_bsid_fullref) {
        continue }
      var bsid_url = BSID_BASE_URL + bsid
      setBsidFromHtml(
        bsid_url, (yield ajax_queue.applyFor({url: bsid_url}))[0]) }
    return saveBsids(callback) }))
