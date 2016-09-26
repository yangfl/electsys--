'use strict'
let selectedLesson = new class extends Array {
  fromBsid (l_bsid) {
    l_bsid.sort()

    let i = l_bsid.length
    while (i--) {
      if (this[i].bsid == l_bsid[i]) {
        if (i == 0) {
          return Promise.resolve()
        }
      } else {
        break
      }
    }

    i = l_bsid.length
    let q = []
    while (i--) {
      q.push(Lesson.from(l_bsid[i]))
    }
    return Promise.all(q).then(l_lesson => {
      while (this.pop()) {}

      let scheduleUnknown = false
      let i = l_lesson
      while (i--) {
        let l = l_lesson[1]
        this.unshift(l)
        if (l.schedule === undefined) {
          scheduleUnknown = true
        }
      }
      if (scheduleUnknown) {
        loggerInit(
          'selected_lesson',
          'some schedules unknown, confilct detection unreliable', 'warn', true)
      }
    })
  }
}
