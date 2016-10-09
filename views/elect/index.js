'use strict'
loggerInit('init', 'libraries loaded')

{
  const select_fetch = document.getElementById('lesson-fetch-abssemester')
  const span_loading = document.getElementById('lesson-fetch-loading')
  const span_loaded = document.getElementById('lesson-fetch-loaded')

  sdtleft.loaded.then(() => {
    select_fetch.value = sdtleft.info.toString()
  })

  document.getElementById('lesson-fetch-load')
    .addEventListener('click', function () {
      this.disabled = true
      span_loading.style.display = 'inline'
      let [yaerStart, yearEnd, semester] =
        select_fetch.options[select_fetch.selectedIndex].value.split('-')
      Lesson.fetch(yaerStart + '-' + yearEnd, semester).then(() => {
        span_loading.style.display = 'none'
        this.disabled = false
        span_loaded.style.display = 'inline'
        setTimeout(() => {
          span_loaded.style.display = 'none'
        }, 3000)
      }, e => {
        span_loading.style.display = 'none'
        this.disabled = false
        loggerError('ajax.query')(e)
      })
    })
}
