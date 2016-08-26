'use strict'
var toggleSubmenu = function () {
  $(this).next().slideToggle()
  return false }


var buildEntry = (type, info) => {
  switch (type) {
    case 'url':
      var [name, url, blank_p] = info
      var $a_entry = $('<a class="list-group-item" target="_blank" />')
      $a_entry.attr('href', url)
      $a_entry.text(name)
      return $a_entry

    case 'group':
      var [name, l_entry] = info

      var $li_entry = $('<li class="list-group-item" />')

      var $span_name = $('<span href="#" />')
      $li_entry.append($span_name)

      $span_name.text(name)
      $span_name.append('<span class="caret"></span>')
      $span_name.click(toggleSubmenu)

      $li_entry.append(buildMenu(l_entry).hide())
      return $li_entry

    case 'divider': }}


var buildMenu = l_entry => {
  var $container = $('<ul class="list-group" />')
  for (var [type, info] of l_entry) {
    $container.append(buildEntry(type, info)) }
  return $container }


chrome.storage.sync.get('popup_menu', item =>
  $(document).ready(() => $('nav').append(buildMenu(item.popup_menu))))
