'use strict'
const MSG_HIDE_TIMEOUT = 1500

/* info */
var fillInfo = () => {
  var info = parseInfo($sdtleft)
  if (info.name) {
    for (var key in info) {
      $('.userinfo-' + key).text(info[key]) }
    $('#navbar-login').hide()
    $('#navbar-logout').show() }
  else {
    $('#navbar-logout').hide()
    $('#navbar-login').show() }}
/* info */


/* menu */
var toggleSubmenu = function () {
  $(this).parent().next().slideToggle() }


var editEntry = function () {
  var $li_entry = $(this).closest('li')
  var type = $li_entry.data('type')
  BootstrapDialog.show({
    title: chrome.i18n.getMessage('config_looks_navbar_edit_title'),
    message: () => {
      var $outer = $('<span />')
      var info = $li_entry.data('info')
      switch (type) {
        case 'url':
          var [name, url, blank_p] = info
          var $input_blank = $('<input type="checkbox" \
class="form-control input-blank" />')
          $outer
            .append($('<div class="checkbox" />').append(
              $('<input type="text" class="form-control input-name" />')
                .attr('placeholder',
                      chrome.i18n.getMessage('config_looks_navbar_edit_name'))
                .val(name)))
            .append($('<div class="checkbox" />').append(
              $('<input type="text" class="form-control input-url" />')
                .attr('placeholder',
                      chrome.i18n.getMessage('config_looks_navbar_edit_url'))
                .val(url)))
            .append($('<div class="checkbox" />').append($input_blank).append(
              $('<label style="font-weight: normal;" />').text(
                chrome.i18n.getMessage('config_looks_navbar_edit_blank'))))
          $input_blank.bootstrapSwitch('state', blank_p)
          break
        case 'group':
          var [name, l_entry] = info
          $outer
            .append($('<div class="checkbox" />').append(
              $('<input type="text" class="form-control input-name" />')
            .attr('placeholder',
                  chrome.i18n.getMessage('config_looks_navbar_edit_name'))
            .val(name))) }
      return $outer },
    buttons: [
      {
        // Cancel
        label: chrome.i18n.getMessage('dialog_cancel'),
        cssClass: 'btn-default',
        action: dialogRef => dialogRef.close() },
      {
        // OK
        label: chrome.i18n.getMessage('dialog_ok'),
        cssClass: 'btn-primary',
        hotkey: 13, // Enter.
        action: dialogRef => {
          var $dialog_body = dialogRef.getModalBody()
          for (var input_field of ['name', 'url', 'blank']) {
            var $input_field = $dialog_body.find('.input-' + input_field)
              if ($input_field.length && !$input_field.val()) {
                $input_field.focus()
                return false }}
          switch (type) {
            case 'url':
              var info = [
                $dialog_body.find('.input-name').val(),
                $dialog_body.find('.input-url').val(),
                $dialog_body.find('.input-blank').prop('checked'), ]
              break
            case 'group':
              var info = [
                $dialog_body.find('.input-name').val(), ] }
          $li_entry.data('info', info)
          $li_entry.children(':first').children('span').text(
            $dialog_body.find('.input-name').val())
          dialogRef.close() }, }, ], }) }


var removeEntry = function () {
  $(this).closest('li').remove() }


var buildEntry = (type, info) => {
  var $li_entry = $('<li class="list-group-item" />')
  $li_entry.data('type', type)
  $li_entry.data('info', info)

  var $div_label = $('<div class="entry-label" />')
  $li_entry.append($div_label)

  var $span_name = $('<span />')
  $div_label.append($span_name)

  var $div_action = $('<div class="entry-action" />')
  $div_action.append(
    $('<span class="entry-edit glyphicon glyphicon-pencil" />')
      .click(editEntry))
  $div_action.append(
    $('<span class="entry-remove glyphicon glyphicon-remove" />')
      .click(removeEntry))
  $div_label.append($div_action)

  switch (type) {
    case 'url':
      var [name, url, blank_p] = info
      $span_name.text(name)
      break

    case 'group':
      var [name, l_entry] = info
      $li_entry.data('info', [name])
      $span_name.text(name)
      $span_name.addClass('submenu-title')
      $span_name.click(toggleSubmenu)
      $span_name.after('<span class="caret"></span>')
      $li_entry.append(buildMenu(l_entry).hide())
      break

    case 'divider':
      $span_name.text(chrome.i18n.getMessage('config_looks_navbar_divider'))
      $li_entry.find('.entry-edit').remove()
      $li_entry.data('info', [])
      $li_entry.addClass('disabled') }

  return $li_entry }


var initSortable = $ul => Sortable.create($ul[0], {
  group: 'list',
  animation: 100, })


var buildMenu = l_entry => {
  var $container = $('<ul class="list-group" />')
  if (l_entry) {
    l_entry.forEach(([type, info]) =>
      $container.append(buildEntry(type, info))) }
  initSortable($container)
  return $container }


var addDefaultMenu = () => {
  $('#list-available .list-default').remove()
  $('#list-available').append(
    buildEntry('group', [
      chrome.i18n.getMessage('config_looks_navbar_default'), sdtleft_menu])
        .addClass('list-default')) }


var getMenu = $container =>
  $container.children().map(function () {
    var type = $(this).data('type')
    var info = $(this).data('info')
    if (info) {
      info = info.slice() }
    else {
      info = [] }
    if (type == 'group') {
      info.push(getMenu($(this).children('ul'))) }
    return [[type, info]] }).toArray()


loadSdtleft(() => {
  loadSdtleftMenu()
  $(document).ready(() => {
    fillInfo()
    $('#reload-default').prop('disabled', false)
    addDefaultMenu()
    if (window.location.hash == '#welcome') {
      chrome.storage.sync.get('sdtMain_menu', item => {
        if (!item.sdtMain_menu || !item.sdtMain_menu.length) {
          item.sdtMain_menu = getMenu($('#list-available'))
          chrome.storage.sync.set(item) }
        $('#welcome .modal-body').html(
          chrome.i18n.getMessage('config_welcome_body')) }) }}) })
/* menu */


/* tab */
var showTab = tab => {
  if (!$(tab).length) {
    tab = $('li.active > a').attr('href') }
  $('.navbar-tabs > li.active').removeClass('active')
  $('.navbar-tabs > li > a[href="' + tab + '"]').parent().addClass('active')
  $('.tab-content').not(tab).hide()
  $(tab).fadeIn()
  if (window.scrollX || window.scrollY) {
    window.scrollTo(0, 0) }}


window.onhashchange = () => {
  var tab = window.location.hash
  if (tab) {
    showTab(tab) }}
/* tab */


/* config */
var setConfig = (key, value, callback) => {
  var item = {}
  item[key] = value
  chrome.storage.sync.set(item, callback) }


var loadConfig = () => chrome.storage.sync.get(item => {
  // settings
  $('.config-sync').each(function () {
    switch (this.type) {
      case 'checkbox':
        $(this).bootstrapSwitch('state', item[this.id] || false)
        break
      case 'number':
        this.value = item[this.id] || 0
        break
      default:
        if (this.classList.contains('config-list')) {
          this.value = item[this.id].join(', ') }
        else {
          this.value = item[this.id] || ''  }}})
  $('.config-color').each(function () {
    $(this).css('background-color', this.value) })
  // menu
  $('#menu-left').children('ul').remove()
  $('#menu-left').append(buildMenu(item.sdtMain_menu).attr('id', 'list-left'))
  $('#menu-right').children('ul').remove()
  $('#menu-right').append(
    buildMenu(item.sdtMain_menu_right).attr('id', 'list-right'))
  $('#menu-popup').children('ul').remove()
  $('#menu-popup').append(
    buildMenu(item.popup_menu).attr('id', 'list-popup')) })


chrome.storage.onChanged.addListener(loadConfig)
/* config */


/* lessons */
var s_choosen = new Set


var updateLessons = () => {
  updateLessontable(s_choosen)
  Array.prototype.forEach.call(
    $('#table-lessons').DataTable().rows().nodes(),
    tr => {
      var fullref = tr.children[FULLREF].innerHTML
      if (s_choosen.has(fullref)) {
        tr.classList.add('choosen')
        tr.classList.remove('confilcted') }
      else {
        tr.classList.remove('choosen')
        for (var other_fullref of s_choosen) {
          if (isLessonIntersect(fullref, other_fullref)) {
            tr.classList.add('confilcted')
            return }}
        tr.classList.remove('confilcted') }}) }


var toggleLesson = function () {
  var row = this.parentElement
  if (row.classList.contains('confilcted')) {
    return }
  var fullref = tr.children[FULLREF].innerHTML
  if (s_choosen.has(fullref)) {
    s_choosen.delete(fullref) }
  else {
    s_choosen.add(fullref) }
  updateLessons() }


var previewLesson = function () {
  updateLessontable(s_choosen, this.children[FULLREF].innerHTML) }


var loadLessons = ($table = $('#table-lessons')) => {
  var load_start = Date.now()
  initTableColor($('#lessons').get(0))
  initLessontable($('#lessons'))
  $table.mouseout(() => updateLessontable(s_choosen))
  loadArranges(() => {
    $table.dataTable({
      data: Array.from(d_arrange.values()),
      language: {url: chrome.i18n.getMessage('dataTable_language_url')},
      pageLength: 100,
      drawCallback: function () {
        Array.prototype.forEach.call(
          this.get(0).getElementsByTagName('tbody')[0].children,
          tr => {
            if (tr.children.length > 1 && !tr.attributes.rendered) {
              for (var i_td = 2, td; td = tr.children[i_td]; i_td++) {
                td.onclick = toggleLesson }
              tr.children[1].innerHTML =
                renderTeacherCell(tr.children[1].innerHTML)
              tr.onmouseover = previewLesson
              tr.attributes.rendered = true }} ) },
      columns: [
        {title: chrome.i18n.getMessage('config_lesson_yxmc'), },
        {title: chrome.i18n.getMessage('config_lesson_xm'), },
        {title: chrome.i18n.getMessage('config_lesson_zcmc'), },
        {title: chrome.i18n.getMessage('config_lesson_kcmc'), },
        {title: chrome.i18n.getMessage('config_lesson_kcbm'), },
        {title: chrome.i18n.getMessage('config_lesson_xqxs'), },
        {title: chrome.i18n.getMessage('config_lesson_xqxf'), },
        {title: chrome.i18n.getMessage('config_lesson_sjms'), },
        {title: chrome.i18n.getMessage('config_lesson_bz'), },
        {title: chrome.i18n.getMessage('config_lesson_nj'), },
        {title: chrome.i18n.getMessage('config_lesson_xn'), },
        {title: chrome.i18n.getMessage('config_lesson_xq'), },
        {title: chrome.i18n.getMessage('config_lesson_yqdrs'), },
        {title: chrome.i18n.getMessage('config_lesson_jsdm'), },
        {title: chrome.i18n.getMessage('config_lesson_jxlmc'), },
        {
          title: chrome.i18n.getMessage('elect_available_status'),
          defaultContent: '',
          orderDataType: 'dom-priority', }, ], })
    console.debug('table rendered in:', Date.now() - load_start, 'ms') }) }
/* lessons */


/* i18n */
$.fn.bootstrapSwitch.defaults.onText =
  chrome.i18n.getMessage('bootstrapSwitch_onText')
$.fn.bootstrapSwitch.defaults.offText =
  chrome.i18n.getMessage('bootstrapSwitch_offText')


var i18nInit = ($root = $('html')) => {
  $root.find('[data-i18n]').each(function () {
    $(this).data('i18n').split(', ').map(k_v => {
      var [attr, i18n_name] = k_v.split(':')
      this[attr] = chrome.i18n.getMessage('config_' + i18n_name) }) })
  return $root }
/* i18n */


/* dynamic components */
$(document).ready(() => {
  i18nInit()


  /* navbar */
  showTab(window.location.hash)

  $('a').click(function () {
    if ($(this).attr('href') == window.location.hash) {
      return false }})
  /* navbar */


  /* config */
  loadConfig()

  $('.config-sync[type=checkbox]').on(
    'switchChange.bootstrapSwitch', function (event, state) {
      setConfig(this.id, state) })

  $('.config-sync[type=number]').change(function () {
    setConfig(this.id, Number(this.value)) })

  $('.config-sync.config-list').change(function () {setConfig(
    this.id, this.value.split(',').map(i => i.trim()).filter(i => i)) })

  $('.config-sync[type=text]:not(.config-list)').change(function () {
    setConfig(this.id, this.value) })
  /* config */


  /* looks and feel */
  initSortable($('#list-available'))

  $('#add-entry').click(() => {
    var $new_entry = buildEntry('url', ['New entry', '#'])
    $('#list-available').append($new_entry)
    $new_entry.find('.entry-edit').click() })

  $('#reload-default').click(addDefaultMenu)

  $('#add-divider').click(() => {
    $('#list-available').append(buildEntry('divider'))
    return false })

  $('.save-list').click(function () {
    chrome.storage.sync.set(
      {sdtMain_menu: getMenu($('#list-left')),
       sdtMain_menu_right: getMenu($('#list-right')),
       popup_menu: getMenu($('#list-popup')), },
      () => {
        $(this).children(':first').removeClass('glyphicon-save')
        $(this).children(':first').addClass('glyphicon-saved')
        $(this).children(':last').text('Saved!')
        setTimeout(() => {
          $(this).children(':first').removeClass('glyphicon-saved')
          $(this).children(':first').addClass('glyphicon-save')
          $(this).children(':last').text('Save') }, MSG_HIDE_TIMEOUT) }) })

  $('.config-color').on('input', function () {
    $(this).css('background-color', this.value) })
  /* looks and feel */


  /* info */
  loadLessons()

  $('#lessons-year').val(quickInfo().year)
  $('#lessons-semester').val(quickInfo().semester)

  $('#prepare-lessons').click(() => prepareArranges(
    $('#lessons-year').val(),
    $('#lessons-semester').val(),
    '',
    () => console.info('ok') ))

  $('[data-toggle=popover]').each(function () {
    $(this).popover({
      content: i18nInit(
        $('<div />').append($($(this).data('raw-content')))).html(),
      html: true, }) })

  $('#btn-clear-session').click(function () {
      chrome.storage.local.set({clear_localStorage: true})
      setTimeout(() => $(this).popover('hide'), MSG_HIDE_TIMEOUT) })

  $('#btn-clear-cache').click(function () {
    initLocalStorage(() => {
      $('#result-clear-cache').text('Done!')
      setTimeout(() => $(this).popover('hide'), MSG_HIDE_TIMEOUT) }) })

  $('#btn-reset').on('shown.bs.popover', function () {
    $('#confirm-reset').click(() => {
      initStorage(() => {
        $('#confirm-reset').replaceWith('Done!')
        setTimeout(() => $(this).popover('hide'), MSG_HIDE_TIMEOUT) })
      return false }) })

  $('#btn-dump-settings').click(
    () => chrome.storage.sync.get(item => console.info(item)))

  $('#btn-check-cachesize').click(() =>
    chrome.storage.local.getBytesInUse(
     bytesInUse => $('#result-check-cachesize').text(bytesInUse)))
  /* info */


  /* about */
  var manifest = chrome.runtime.getManifest()
  $('.info-version').text(manifest.version)
  $('.info-homepage').attr('href', manifest.homepage_url)
  $('.info-bug').attr('href', manifest.homepage_url + '/issues')
  /* about */


  /* welcome */
  if (window.location.hash == '#welcome') {
    $("#welcome").modal() }
  /* welcome */ })
