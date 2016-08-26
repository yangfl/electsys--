'use strict'
var getDefaultHandler = (factory, propertyTest = () => true) =>
  (target, property) => {
    if (propertyTest(property) && !(property in target)) {
      target[property] = factory(property) }
    return target[property] }


var parseBsidtable = $table => new Set($table.find('a').map(function () {
  return Number(this.href.split('bsid=')[1]) }))


var parseLessontable = $table => {
  var lesson_table = new Proxy([], {
    get: getDefaultHandler(() => [], property => !isNaN(property)), })
  var $tr_row = $table.find('tr:not(:first)')
  for (var i_row = 0; i_row < $tr_row.length; i_row++) {
    var $td_column = $tr_row.eq(i_row).find('td:not(:first)')
    var i_column_shift = 0
    for (var i_column = 0; i_column < $td_column.length; i_column++) {
      while (lesson_table[i_row][i_column + i_column_shift]) {
        i_column_shift++ }
      var $td_lesson = $td_column.eq(i_column)
      var lesson_name = $td_lesson.text().replace(/]/, ']\n').trim()
      var rowspan = $td_lesson.attr('rowspan') || 1
      for (var i_rowspan = 0; i_rowspan < rowspan; i_rowspan++) {
        lesson_table[i_row + i_rowspan][i_column + i_column_shift] =
          lesson_name }}}
  return lesson_table }
