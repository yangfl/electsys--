'use strict'
let current_stage
{
  this.findElectStage = async function () {
    for (let test_stage of ELECT.list.stage) {
      loggerInit('elect_stage', 'trying ' + test_stage)
      if (await testElectConfirmPage(ELECT.stage(test_stage))) {
        current_stage = test_stage
        return test_stage
      }
    }
  }

  async function testElectConfirmPage (url, options) {
    let response = await fetch(url, options || {credentials: 'include'})
      .then(handleResponseError)
    let responseURL = response.url
    if (responseURL.includes('messagePage.aspx')) {
      return false
    }
    let data = await response.text()
    let node = document.createElement('div')
    node.innerHTML = data.match(/<form[^]*<\/form>/i)[0]
      .replace(/src=/gi, 'tempsrc=')
    let form = node.firstElementChild
    let submit = form.querySelector('input[value="继续"]')
    if (submit) {
      node.querySelector('input[type=checkbox]').click()
      let form_data = Array.from(new FormData(form).entries())
      form_data.push([submit.name, submit.value])
      return testElectConfirmPage(responseURL, postOptions(form_data))
    } else if (data.includes('arrowdown.gif')) {
      return true
    }
  }
}
