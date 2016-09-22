'use strict'
function openPost (request, target = '_blank') {
  if (request.method === 'GET') {
    return open(request.url, target)
  }
  return request.text().then(data => {
    let form = document.createElement('form')
    form.action = request.url
    form.method = request.method
    form.target = target
    let l_query = data.split('&')
    for (let i = 0, k = l_query.length; i < k; i++) {
      let values = l_query[i].split('=').map(decodeURIComponent)
      let input = document.createElement('input')
      input.type = 'text'
      input.name = values[0]
      // NOTE: input.value may not work
      input.setAttribute('value', values[1] || '')
      form.appendChild(input)
    }
    form.submit()
  })
}
