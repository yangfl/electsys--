'use strict'
let scheduleTable = {
  handler: document.getElementById('handler-schedule'),

  toggle () {
    // since display status will be changed soon
    sessionStorage.showLessontable = !scheduleTable.isVisible()
    $(scheduleTable.table.container).slideToggle({
      complete: () => scheduleTable.handler.classList.toggle('expand')
    })
  },

  isVisible () {
    return !!this.table.container.offsetParent
  },

  table: {
    container: document.getElementById('container-schedule'),

    _empty_table: undefined,
    generate () {
      if (this._empty_table === undefined) {
        let table_schedule = '<table id="table-schedule"><thead>'
        table_schedule += '<tr>'
        for (let i_dow = 0; i_dow < 8; i_dow++) {
          table_schedule += '<th>'
          table_schedule += chrome.i18n.getMessage('scheduletable_' + i_dow)
          table_schedule += '</th>'
        }
        table_schedule += '</tr></thead><tbody>'
        for (let i_lesson = 1; i_lesson <= 14; i_lesson++) {
          table_schedule += '<tr><th>'
          table_schedule += i_lesson
          table_schedule += '</th>'
          for (let i_dow = 0; i_dow < 7; i_dow++) {
            table_schedule += '<td></td>'
          }
          table_schedule += '</tr>'
        }
        table_schedule += '</tbody></table>'
        let div = document.createElement('div')
        div.innerHTML = table_schedule
        this._empty_table = div.firstElementChild
      }
      return this._empty_table.cloneNode(true)
    },

    clear () {
      while (this.container.lastElementChild) {
        this.container.removeChild(this.container.lastElementChild)
      }
    },

    fill (nodeTable = this.generate()) {
      this.clear()
      this.container.appendChild(nodeTable)
    },

    isFilled () {
      return !!this.getNode()
    },

    getNode () {
      return this.container.getElementsByTagName('table')[0]
    }
  },

  preview: {
    curDisplay: [],

    clear () {
      let l_preview = scheduleTable.table.container
        .getElementsByClassName('preview')
      let i = l_preview.length
      while (i--) {
        l_preview[i].remove()
      }
      scheduleTable.preview.curDisplay = []
    },

    draw (lesson, exclusive = true) {
      if (!lesson.schedule) {
        return
      }
      if (!scheduleTable.isVisible()) {
        return
      }
      let nodeTable = scheduleTable.table.getNode()
      if (!nodeTable) {
        return
      }

      if (exclusive) {
        scheduleTable.preview.clear()
      }

      for (let [week_skip, week_start, week_end,
                dow, lesson_start, lesson_end] of lesson.schedule) {
        let $tr_start = $(nodeTable).find('tr').eq(1 + lesson_start)
        let $tr_end = $(nodeTable).find('tr').eq(lesson_end)
        let $td_dow = $(nodeTable).find('tr:first').children().eq(dow)
        let div_preview = document.createElement('div')
        div_preview.classList.add('preview')
        div_preview.style.top =
          $tr_start.offset().top - $tr_start.offsetParent().offset().top +
          parseInt($td_dow.css('border-top-width')) + 'px'
        div_preview.style.left =
          $td_dow.offset().left - $tr_start.offsetParent().offset().left +
          parseInt($td_dow.css('border-left-width')) + 'px'
        div_preview.style.width = $td_dow.innerWidth() +
          parseInt($td_dow.css('border-left-width')) + 'px'
        div_preview.style.height =
          $tr_end.offset().top - $tr_start.offset().top + $tr_end.innerHeight() -
          parseInt($td_dow.css('border-top-width')) + 'px'
        scheduleTable.table.container.appendChild(div_preview)
      }
    },

    drawEntries (obj_lesson) {
      if (!scheduleTable.isVisible() || !scheduleTable.table.isFilled()) {
        return
      }

      scheduleTable.preview.clear()
      for (let fake_bsid in obj_lesson) {
        scheduleTable.preview.draw(obj_lesson[fake_bsid], false)
      }
    },
  },
}

scheduleTable.handler.addEventListener('click', scheduleTable.toggle)

if (sessionStorage.showLessontable == 'true') {
  scheduleTable.handler.click()
}

scheduleTable.table.container.addEventListener('click', event => {
  if (event.target.classList.contains('classtit') ||
      event.target.classList.contains('classtit2') ||
      event.target.nodeName === 'TH') {
    // hide table when click th
    scheduleTable.handler.click()
  } else if (event.target.nodeName === 'TD') {
    // click inner a if only one a in td
    let l_a = event.target.getElementsByTagName('a')
    if (l_a.length === 1) {
      l_a[0].click()
    }
  } else if (event.target.nodeName === 'A') {
    // remove lesson when click a
    Lesson.from(Number(event.target.dataset.bsid)).then(l => l.remove())
    // prevent redirect
    event.preventDefault()
  }
})

Array.prototype.forEach.call(
  document.getElementsByClassName('table-entry'),
  table => table.addEventListener('mouseout', scheduleTable.preview.clear))
