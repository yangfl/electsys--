'use strict'
let current_stage


async function findElectStage () {
  for (let test_stage of ELECT.list.stage) {
    loggerInit('elect_stage', 'trying ' + test_stage)
    if (await testElectConfirmPage(ELECT.stage(test_stage))) {
      current_stage = test_stage
      return test_stage
    }
  }
  return

  async function testElectConfirmPage (url, options) {
    let response = await fetch(url, options || {credentials: 'include'})
    let responseURL = response.url
    if (responseURL.includes('messagePage.aspx')) {
      return false
    }
    let data = await response.text()
    let $form =
      $(data.match(/<form[^]*<\/form>/i)[0].replace(/src=/gi, 'tempsrc='))
    let $submit = $form.find('input[value=继续]')
    if ($submit.length) {
      $form.find('input[type=checkbox]').click()
      let form_data = $form.serializeArray()
      form_data.push({name: $submit.attr('name'), value: $submit.val()})
      return testElectConfirmPage(responseURL, postOptions(form_data))
    }
    else if (data.includes('arrowdown.gif')) {
      return true
    }
  }
}
