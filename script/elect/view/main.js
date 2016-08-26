'use strict'
var $table_choosen = $('.classtit2:first').closest('table')


// cleanup buttons
$button_submit.closest('table').find('input:lt(' +
  (current_page == 'viewLessonArrange' ? 5 : 2) + ')').hide()


// add hotkeys
$(document).bind('keydown', 'w', () => {
  $('input[type=search]').focus()
  return false })
$(document).bind('keydown', 'd', () =>
  $current_entry.find('.check-arrange').click())
$(document).bind('keydown', 'i', () => doSubmit.call(
  $current_entry.get(0), '#LessonTime1_btnSchedule, [id$=btnLessonInfo]'))


initTableColor()


// load classtable
var prepareBsidsForChoosen = () => {}
if (current_page != 'viewLessonArrange') {
  var s_choosen_bsid = parseBsidtable($table_choosen)
  var s_choosen_fullref = null
  var $table_small_choosen = $table_choosen.clone()

  prepareBsidsForChoosen = callback => prepareBsids(s_choosen_bsid, () => {
    s_choosen_fullref = new Set
    s_choosen_bsid.forEach(bsid =>
      s_choosen_fullref.add(obj_bsid_fullref[bsid]))
    var $table_lessons = $('#table-lessons')
    if ($table_lessons.length) {
      $table_lessons.DataTable().rows().nodes().to$().each(updateEntry)
      $table_lessons.DataTable().draw() }
    return callback && callback() })

  var handlerInA = function () {
    $table_small_choosen.find('[href="' + this.href + '"]')
      .addClass('onhover') }
  var handlerOutA = () => $table_small_choosen.find('a').removeClass('onhover')
  $table_small_choosen.find('a').each(function () {
    $(this).data('bsid', this.href.match(/bsid=(\d+)/)[1])
      .attr('href', REMOVE_BASE_URL.replace('{}', $(this).data('bsid'))) })
      .click(removeBsid).hover(handlerInA, handlerOutA)
    .parent().addClass('choosen')
  initLessontable(undefined, $table_small_choosen)

  var $container_lessontable = $('#container-lessontable')
  $('#container-lessontable .classtit').click(
    () => $('#handler-lessontable').click()) }


// load table
if ($table_available.length) {
  initTableIcon()
  initViewArrange()
  var $table_lessons = $('<table class="table-available" id="table-lessons" />')
  $table_lessons.data('form', $form_submit)
  $table_available.hide().after($('<form />').append($table_lessons))
  var [struct_l_available, l_available] = getAvailable()
  initTableCss($table_lessons.get(0), struct_l_available)
  loadArranges(() => {
    if (current_page != 'viewLessonArrange') {
      initRef() }
    initTable()
    chrome.storage.sync.get(
      ['exclude_words', 'check_on_hover', 'eager_check', 'eager_refresh'],
      item => {
        l_exclude_word = item.exclude_words
        if (item.eager_check) {
          $table_lessons.DataTable().rows().nodes().to$()
            .each(addAutoFetchArrange) }
        else {
          check_on_hover = item.check_on_hover }})
    prepareBsidsForChoosen() }) }
