'use strict'
var clickThis = function () {this.click() }


var buildMenu = (l_entry, prefix = '', level = 0) => {
  var $ul_dropdown = $('<ul class="dropdown-menu" />')
  for (var index in l_entry) {
    var [type, info] = l_entry[index]
    switch (type) {
      case 'url':
        var [name, url, blank_p] = info
        var $a_link = $('<a />')
        $a_link.attr('data-href', url)
        $a_link.attr('data-blank_p', blank_p)
        $a_link.attr('href', '#' + prefix + index)
        $a_link.text(name)
        $ul_dropdown.append($('<li />').append($a_link))
        break
      case 'group':
        var [name, l_sub_entry] = info
        var $li_dropdown = $('<li />')
        if (level) {
          $li_dropdown.addClass('dropdown-submenu') }
        else {
          $li_dropdown.addClass('dropdown') }
        var $a_dropdown = $('<a href="#" />').text(name)
        if (!level) {
          $a_dropdown.attr('data-toggle', 'dropdown')
          $a_dropdown.append('<span class="caret"></span>') }
        else {
          $a_dropdown.mouseenter(clickThis) }
        $li_dropdown.append($a_dropdown)
        $li_dropdown.append(buildMenu(
          l_sub_entry, prefix + index + '-', level + 1))
        $ul_dropdown.append($li_dropdown)
        break
      case 'seperator':
        $ul_dropdown.append('<li role="separator" class="divider"></li>') }}
  return $ul_dropdown }


var openLink = function () {
  var url = $(this).data('href')
  if (url && url.startsWith('javascript:')) {
    document.getElementById('main').contentWindow.eval(url.substr(12))
    return false }
  if ($(this).data('blank_p')) {
    window.open(url)
    return false }
  $('#main').attr('src', url) }


var event_bulid = new Event('build')


var load = () =>
  document.addEventListener('readystatechange', () => {
    if (document.readyState == 'interactive') {
      chrome.storage.sync.get(['sdtMain_menu', 'sdtMain_menu_right'], item => {
        $('#navbar')
          .append(buildMenu(item.sdtMain_menu)
            .attr('class', 'nav navbar-nav'))
          .append(buildMenu(item.sdtMain_menu_right, 'r-')
            .attr('class', 'nav navbar-nav navbar-right'))
      document.dispatchEvent(event_bulid) }) }})


document.addEventListener('build', () => {
  $('#navbar').find('a').click(openLink)
  $('#main').css('padding-bottom', $('header').css('height'))
  $('#navbar > ul > li > ul').prev().submenupicker()
  $('a[href="' + window.location.hash + '"]').click() })


if (window.location.protocol == 'chrome-extension:') {
  load() }
