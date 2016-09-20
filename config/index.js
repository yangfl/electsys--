'use strict'
const MSG_HIDE_TIMEOUT = 1500


/* menu */
var toggleSubmenu = function () {
  $(this).parent().next().slideToggle() }


var editEntry = function () {
  var $li_entry = $(this.closest('li'))
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


function buildEntry (type, info) {
  let li_entry = document.createElement('li')
  li_entry.classList.add('list-group-item')
  $(li_entry).data('type', type).data('info', info)

  let div_label = document.createElement('div')
  div_label.classList.add('entry-label')
  li_entry.appendChild(div_label)

  let span_name = document.createElement('span')
  div_label.appendChild(span_name)

  let div_action = document.createElement('div')
  div_action.classList.add('entry-action')
  let span_edit = document.createElement('span')
  span_edit.classList.add('entry-edit', 'glyphicon', 'glyphicon-pencil')
  span_edit.addEventListener('click', editEntry)
  div_action.appendChild(span_edit)
  let span_remove = document.createElement('span')
  span_remove.classList.add('entry-remove', 'glyphicon', 'glyphicon-remove')
  span_remove.addEventListener('click', removeEntry)
  div_action.appendChild(span_remove)
  div_label.appendChild(div_action)

  switch (type) {
    case 'url':
      var [name, url, blank_p] = info
      span_name.innerText = name
      break

    case 'group':
      var [name, l_entry] = info
      $(li_entry).data('info', [name])
      span_name.innerText = name
      span_name.classList.add('submenu-title')
      span_name.addEventListener('click', toggleSubmenu)
      let span_caret = document.createElement('span')
      span_caret.classList.add('caret')
      div_label.insertBefore(span_caret, span_name.nextSibling)
      li_entry.appendChild(buildMenu(l_entry).hide()[0])
      break

    case 'divider':
      span_name.innerText =
        chrome.i18n.getMessage('config_looks_navbar_divider')
      span_edit.remove()
      $(li_entry).data('info', [])
      li_entry.classList.add('disabled')
  }

  return li_entry
}


function initSortable (ul) {
  Sortable.create(ul, {
    group: 'list',
    animation: 100,
  })
}


function buildMenu (l_entry) {
  let container = document.createElement('ul')
  container.classList.add('list-group')
  if (l_entry) {
    l_entry.forEach(([type, info]) =>
      container.appendChild(buildEntry(type, info)))
  }
  initSortable(container)
  return $(container)
}


function addDefaultMenu () {
  let old_entry = document.querySelector('#list-available .list-default')
  if (old_entry) {
    old_entry.remove()
  }
  let new_entry = buildEntry('group', [
    chrome.i18n.getMessage('config_looks_navbar_default'), sdtleft.menu])
  new_entry.classList.add('list-default')
  document.getElementById('list-available').appendChild(new_entry)
}


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


sdtleft.load().then(() => {
  $(document).ready(() => {
    // fillInfo
    if (sdtleft.info.isVaild()) {
      for (let key in sdtleft.info) {
        $('.userinfo-' + key).text(sdtleft.info[key])
      }
      $('.userinfo-year').text(sdtleft.info.yearString)
      $('#navbar-login').hide()
      $('#navbar-logout').show()
    }
    else {
      $('#navbar-logout').hide()
      $('#navbar-login').show()
    }
    // menu
    $('#reload-default').prop('disabled', false)
    addDefaultMenu()
    // first run
    if (window.location.hash == '#welcome') {
      initStorage().then(() => chrome.storage.sync.get('sdtMain_menu', item => {
        if (!item.sdtMain_menu || !item.sdtMain_menu.length) {
          item.sdtMain_menu = getMenu($('#list-available'))
          chrome.storage.sync.set(item) }
        $('#welcome .modal-body').html(
          chrome.i18n.getMessage('config_welcome_body')) })) }}) })
/* menu */


/* tab */
function showTab (withFallback) {
  let section_target_tab = document.getElementById(
    window.location.hash.substr(1))
  if (!section_target_tab) {
    if (withFallback === true) {
      section_target_tab = document.getElementById('general')
    } else {
      return
    }
  }

  let nav = document.getElementsByTagName('nav')[0]
  let li_active = nav.getElementsByClassName('active')[0]
  if (li_active) {
    li_active.classList.remove('active')
  }
  let a_tab = nav.querySelector(
    '.navbar-tabs > li > a[href="#' + section_target_tab.id + '"]')
  if (a_tab) {
    a_tab.parentElement.classList.add('active')
  }

  let section_prev_tab = document.getElementsByClassName('tab-active')[0]
  if (section_prev_tab) {
    section_prev_tab.classList.remove('tab-active')
  }
  section_target_tab.classList.add('tab-active')
  window.scrollTo(0, 0)
}


window.addEventListener('hashchange', showTab)
/* tab */


/* config */
config.loaders.push(item => {
  // menu
  if (item.sdtMain_menu) {
    $('#menu-left').children('ul').remove()
    $('#menu-left').append(buildMenu(item.sdtMain_menu).attr('id', 'list-left'))
  }
  if (item.sdtMain_menu_right) {
    $('#menu-right').children('ul').remove()
    $('#menu-right').append(
      buildMenu(item.sdtMain_menu_right).attr('id', 'list-right'))
  }
  if (item.popup_menu) {
    $('#menu-popup').children('ul').remove()
    $('#menu-popup').append(
      buildMenu(item.popup_menu).attr('id', 'list-popup'))
  }
})
/* config */


/* i18n */
$.fn.bootstrapSwitch.defaults.onText =
  chrome.i18n.getMessage('bootstrapSwitch_onText')
$.fn.bootstrapSwitch.defaults.offText =
  chrome.i18n.getMessage('bootstrapSwitch_offText')

const I18N_PREFIX = 'config_'
/* i18n */


/* dynamic components */
$(document).ready(() => {
  i18n(I18N_PREFIX)


  /* navbar */
  showTab(true)

  $('a').click(function () {
    if ($(this).attr('href') == window.location.hash) {
      return false }})
  /* navbar */


  /* config */
  config.init()

  $('input[type=checkbox]').bootstrapSwitch()
  /* config */


  /* looks and feel */
  initSortable(document.getElementById('list-available'))

  document.getElementById('add-entry').addEventListener('click', () => {
    var new_entry = buildEntry('url', ['New entry', '#'])
    document.getElementById('list-available').appendChild(new_entry)
    new_entry.getElementsByClassName('entry-edit')[0].click()
  })

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
  $('[data-toggle=popover]').each(function () {
    $(this).popover({
      content: $(i18n(I18N_PREFIX,
        $('<div />').append($($(this).data('raw-content')))[0])).html(),
      html: true, }) })

  $('#btn-clear-cache').click(function () {
    initLocalStorage().then(() => {
      $('#result-clear-cache').text('Done!')
      setTimeout(() => $(this).popover('hide'), MSG_HIDE_TIMEOUT) }) })

  $('#btn-reset').on('shown.bs.popover', function () {
    $('#confirm-reset').click(() => {
      $('#confirm-reset').replaceWith('Waiting...')
      initSyncStorage().then(() => {
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
    $('#welcome').on('hide.bs.modal', function () {
      window.location.hash = '#general'
    }).modal() }
  /* welcome */ })
