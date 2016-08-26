'use strict'
var getAvailable =
    ($table = $table_available, pathname = current_page,
     without_struct = false) => {
  var l_available = $table.children('tbody').children().toArray()
    .map(tr => Array.prototype.map.call(tr.children, td => td.innerHTML.trim()))
  var struct_l_available = l_available.shift()
  if (without_struct) {
    return l_available }
  if (pathname.includes('viewLessonArrange')) {
    var bindClickColumn = cell => $(cell).click(openToggle) }
  else {
    var bindClickColumn = cell => $(cell).click(viewArrange) }
  struct_l_available = struct_l_available.map(title => {
    switch (title) {
      case '&nbsp;':
        return {
          title: title,
          formatter: data => data.match(/value="(.*?)"/)[1],
          createdRow: (row, data) => {
            $(row).data('value', data)
            if ($('input[value=' + data + ']').prop('checked')) {
              $(row).addClass('choosen') }},
          visible: false, }
      case '选择':
        return {
          title: title,
          formatter: data => data.match(/value="(.*?)"/)[1],
          createdRow: (row, data) => $(row).data('value', data),
          visible: false, }
      case '提示':
        return {
          title: title,
          createdRow: (row, data) =>
            row.classList.add(data == '人数满' ? 'full': 'not-full'),
          visible: false, }
      case '是否已选课程':
        return {
          title: title,
          createdRow: (row, data) => {
            if (data.includes('√')) {
              row.classList.add('choosen') }},
          visible: false, }
      case '教师姓名':
        return {
          title: title,
          render: renderTeacherCell, }
      case '备注':
        if (pathname.includes('viewLessonArrange')) {
          return {
            title: title,
            clickable: true,
            createdCell: bindClickColumn,
            createdRow: (row, data) => {
              if (!isNoteVaild(data)) {
                row.classList.add('unavailable') }}, } }
        break
      case '课程性质':
        if (!pathname.includes('ShortSessionLesson')) {
          return {
            title: title,
            visible: false, } }
        break }
    return {
      title: title.startsWith('课程') ? title.substr(2) :
        title.endsWith('人数') ? title.substr(0, title.length - 2) : title,
      clickable: true,
      // smallFont: ['课号', '周安排', '备注'].includes(title),
      createdCell: bindClickColumn, } })
  if (pathname.includes('speltyCommonCourse')) {
    struct_l_available.push({
      title: chrome.i18n.getMessage('elect_available_as'),
      factory: row =>
        $('input[checked]').closest('tr').children(':last').text(),
      clickable: true,
      createdCell: bindClickColumn, }) }
  if (pathname.includes('outSpeltyEP') ||
      pathname.includes('freshmanLesson')) {
    struct_l_available.push({
      title: chrome.i18n.getMessage('elect_available_as'),
      factory: getCourseAs,
      clickable: true,
      createdCell: bindClickColumn, }) }
  if (pathname.includes('outSpeltyEP')) {
    struct_l_available.push({
      title: chrome.i18n.getMessage('elect_available_school'),
      factory: row => $('option[selected]:first').text(),
      clickable: true,
      createdCell: bindClickColumn, }) }
  struct_l_available.push({
    title: chrome.i18n.getMessage('elect_available_status'),
    defaultContent: '\
<a class="open-arrange" href="#">A</a>\
<a class="check-arrange" href="#">C</a>\
<a class="open-info" href="#">I</a>',
    createdCell: pathname.includes('viewLessonArrange') ?
      (cell => {
        $('.open-arrange', cell).click(openSchedule)
        $('.check-arrange', cell).click(openPerLesson)
        $('.open-info', cell).click(openTeacherInfo) }) :
      (cell => {
        $('.open-arrange', cell).click(openArrange)
        $('.check-arrange', cell).click(checkArrange)
        $('.open-info', cell).click(openInfo) }),
    orderDataType: 'dom-priority', })
  return [struct_l_available, l_available] }


var $current_entry = null
var check_on_hover = false
var onmouseoverEntry = function () {
  $current_entry = $(this)

  var value = $(this).data('value')
  if (check_on_hover && isNaN(value) && !this.classList.contains('choosen') &&
      !this.classList.contains('confilcted') &&
      !this.classList.contains('unavailable')) {
    addAutoFetchArrange.call(this) }

  if (!this.classList.contains('choosen') &&
      !this.classList.contains('unavailable')) {
    var l_fullref = getFullrefList(value)
    if (l_fullref) {
      clearPreviewLesson()
      l_fullref.forEach(previewLesson) }}}


var updateEntry = function (force) {
  if (this.classList.contains('choosen') ||
      this.classList.contains('unavailable')) {
    return }
  var ref = $(this).data('value')
  var l_fullref = getFullrefList(ref)
  if (!l_fullref) {
    return }
  // unavailable
  if (!l_fullref.length) {
    this.classList.add('unavailable')
    return }
  // confilcted
  if (s_choosen_fullref && (!this.classList.contains('confilcted') &&
      !this.classList.contains('not-confilcted') || force)) {
    for (var fullref of l_fullref) {
      var is_intersect = false
      for (var choosen_fullref of s_choosen_fullref) {
        if (isLessonIntersect(choosen_fullref, fullref)) {
          is_intersect = true
          break }}
      if (!is_intersect) {
        this.classList.add('not-confilcted')
        break }}
    if (!this.classList.contains('not-confilcted')) {
      this.classList.add('confilcted') }}
  // full
  if (!this.classList.contains('full') &&
      !this.classList.contains('not-full') || force) {
    var $modal_detail = $refModal(ref)
    if ($modal_detail.length) {
      if ($modal_detail.html().includes('人数未满')) {
        this.classList.add('not-full') }
      else {
        this.classList.add('full') }}}}


var initTable =
    ($table = $('#table-lessons'),
     struct_data = struct_l_available, data = l_available) => {
  struct_data.forEach((struct_entry, i_slot) => {
    if ('factory' in struct_entry) {
      data.forEach(entry => entry.push(struct_entry.factory(entry))) }
    else if ('formatter' in struct_entry) {
      data.forEach(entry => {
        entry[i_slot] = struct_entry.formatter(entry[i_slot], entry) }) }})
  $table.DataTable({
    data: data,
    language: {url: chrome.i18n.getMessage('dataTable_language_url')},
    pageLength: 25,
    order: [[struct_data.length - 1, 'asc']],
    columns: struct_data,
    createdRow: (row, data) => {
      struct_data.forEach((column, index) => {
        if (column.createdRow) {
          column.createdRow(row, data[index], data) }})
      $(row).mouseenter(onmouseoverEntry) }, })
  $table.mouseout(clearPreviewLesson) }


var addTableRow = ($table, l_row) => {
  $table.DataTable().rows.add(l_row).draw()
  $table.DataTable().page('last').draw('page') }
