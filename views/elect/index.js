'use strict'
loggerInit('init', 'libraries loaded')

{
  const select_fetch = document.getElementById('lesson-fetch-abssemester')
  const span_loading = document.getElementById('lesson-fetch-loading')
  const span_loaded = document.getElementById('lesson-fetch-loaded')

  sdtleft.loaded

  document.getElementById('lesson-fetch-load').addEventListener('click', function () {
    this.disabled = true
    span_loading.style.display = 'inline'
    Lesson.fetch().then(() => {
      span_loading.style.display = 'none'
      this.disabled = false
      span_loaded.style.display = 'inline'
      setTimeout(() => {
        span_loaded.style.display = 'none'
      }, 3000)
    }, () => {
      span_loading.style.display = 'none'
      this.disabled = false
    })
  })
}
