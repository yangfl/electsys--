'use strict'
Lesson.fetch = (
    year = sdtleft.info.year, semester = sdtleft.info.semester, grade) =>
  fetch(ELECTQ.report, {credentials: 'include'})
    .then(responseErrorText).then(function sendQuery (data) {
      let doc = new DOMParser().parseFromString(data, 'text/html')
      // select option
      for (let [key, value] of
          [['03', year], ['05', semester], ['07', grade]]) {
        let select = doc.getElementById(
          'ReportViewerControl_ctl00_ctl' + key + '_ddValue')
        let query = 'not(text())'
        if (value) {
          query = 'text()="' + value + '"'
        }
        let option = doc.evaluate('//option[' + query + ']', select)
          .iterateNext()
        if (!option) {
          throw new RangeError('no matched value found: '  + value)
        }
        option.setAttribute('selected', true)
      }
      // serialize form
      let form_data = Array.from(
        new FormData(doc.getElementsByTagName('form')[0]).entries())
      let button = doc.getElementById('ReportViewerControl_ctl00_ctl00')
      form_data.push([button.name, button.value])
      // send query
      return fetch(ELECTQ.report, postOptions(form_data))
    })
    .then(responseErrorText).then(Lesson.fetch.requestDownload)
    .then(responseErrorText).then(Lesson.fetch.parseArrangesXML)


Lesson.fetch.requestDownload = data => fetch(
  ELECTQ.host + JSON.parse(
    data.match(/new RSClientController\((.*)\)/)[1].split(',')[14]) + 'XML',
  {credentials: 'include'})


Lesson.fetch.fromUrl = url => fetch(url, {credentials: 'include'})
  .then(responseErrorText).then(Lesson.fetch.parseArrangesXML)


Lesson.fetch.parseArrangesXML = data => {
  let l_detail = new DOMParser().parseFromString(data, 'application/xml')
    .getElementsByTagName('Detail_Collection')[0].children
  let i = l_detail.length
  let p = []
  while (i--) {
    let detail = l_detail[i]
    let entry = {}
    for (let attr in Lesson.STRUCT) {
      let value = detail.getAttribute(attr)
      if (typeof value === 'string') {
        value = value.trim()
      }
      if (value !== null && !isNaN(value)) {
        value = Number(value)
      // Lesson.STRUCT[attr] === 'scheduleDesc'
      } else if (attr === 'sjms') {
        value += '\r\n'
      } else if (value === '.') {
        value = null
      }
      entry[Lesson.STRUCT[attr]] = value
    }
    p.push(Lesson.from(entry))
  }

  Lesson.db.groupAssign = true
  return Promise.all(p).then(() => {
    Lesson.db.groupAssign = false
  })
}
