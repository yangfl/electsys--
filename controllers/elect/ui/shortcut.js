'use strict'
window.addEventListener('keydown', function (event) {
  if (event.defaultPrevented) {
    return
  }
  switch (event.key) {
    case 'w':
      let input = document.querySelector('.in input[type=search]') ||
        document.querySelector('#block-available input[type=search]')
      input.focus()
      return
    case 's':
      return
    default:
      return
  }

  event.preventDefault()
}, true)

  /*
$(document).bind('keydown', 'd', () =>
  $current_entry.find('.check-arrange').click())
$(document).bind('keydown', 'i', () => doSubmit.call(
  $current_entry.get(0), '#LessonTime1_btnSchedule, [id$=btnLessonInfo]'))

$(document).bind('keydown', 'r', modal_page_action(
  $modal => $modal.find('.refresh-modal').click(),
  () => window.location.reload()))
$(document).bind('keydown', 's', () => $button_submit.click())
$(document).bind('keydown', 'b', modal_page_action(
  $modal => $modal.find('.close-modal').click(), () => window.history.back()))
if (current_page in SEL_BUTTON_PREVIOUS) {
  $(document).bind('keydown', 'a', () =>
    $(SEL_BUTTON_PREVIOUS[current_page]).click())
  $(document).bind('keydown', 'f', () =>
    $(SEL_BUTTON_NEXT[current_page]).click()) } */
