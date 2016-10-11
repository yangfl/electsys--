'use strict'
let dataTable_available
let dataTable_arrange
{
  const SUBMIT_ALERT_CLOSE_DELAY = 1500

  let template = document.createElement('template')
  template.innerHTML = `
<button type="button" class="btn btn-default btn-refresh spinning-onhover" title="Refresh">
  <span class="glyphicon glyphicon-refresh"></span>
</button>`
  let btn_refresh = template.content.firstElementChild

  deferredPool.tasks.datatable = deferredPool.start.then(() => {
    const DATATABLE_LANGUAGE_URL =
      chrome.i18n.getMessage('dataTable_language_url')

    /* table_available */
    const CLASS_LOADING = [
      'loading', 'progress-bar-striped', 'progress-bar-active'
    ]

    const table_available = document.getElementById('table-available')
    dataTable_available = $(table_available).DataTable({
      autoWidth: false,
      columns: [
        {
          data: null,
          defaultContent: '',
          orderDataType: 'dom-priority',
        },
        {
          data: 'name',
          render (data, type, row) {
            if (row.grade) {
              return row.name +
                '<span data-toggle="tooltip" title="' +
                row.school + ' @ ' + row.grade +
                '"><a class="glyphicon glyphicon-info-sign"></a></span>'
            } else {
              return row.name
            }
          },
        },
        {data: 'ref'},
        {data: 'type'},
        {
          data: 'as',
          defaultContent: '',
          render (data, type, row) {
            let i = data || COMMON_COURSE.map[row.ref]
            if (i) {
              // as in ShortSession
              return COMMON_COURSE.type[i].substr(0, 5)
            }
            return ''
          },
        },
        {data: 'credit'},
        {data: 'hour'},
      ],
      createdRow (row, data, dataIndex) {
        let cachedTab = data.parent.cache(data.ref)
        if (cachedTab) {
          if (cachedTab.status === 'loading') {
            row.classList.add(...CLASS_LOADING)
          }
        }
      },
      language: {url: DATATABLE_LANGUAGE_URL},
    })

    // available row event listener (note the placeholder)
    let tbody_available = table_available.tBodies[0]
    const $arrange_modal = $('#select-arrange')
    tbody_available.addEventListener('click', event => {
      let tr = event.target.closest('tr')
      if (tr.classList.contains('loading')) {
        return
      }
      let entryData = dataTable_available.row(tr).data()
      if (entryData) {
        tr.classList.add(...CLASS_LOADING)
        entryData.parent.type(entryData.ref).then(arrangeTab => {
          tr.classList.remove(...CLASS_LOADING)
          dataTable_arrange.clear()
          dataTable_arrange.rows.add(Object.values(arrangeTab.entries))
          dataTable_arrange.draw()
          $arrange_modal.modal()
        }, e => {
          tr.classList.remove(...CLASS_LOADING)
          return Promise.reject(e)
        })
      }
    })
    tbody_available.addEventListener('mouseover', event => {
      let entryData = dataTable_available.row(event.target.closest('tr')).data()
      if (entryData) {
        entryData.parent.type(entryData.ref, true)
          .then(arrangeTab => arrangeTab.guessEntry())
          .then(scheduleTable.preview.drawEntries)
      }
    })

    let div_available_header = document.getElementById('table-available_filter')
    if (mode.name === 'list') {
      let select_semester = document.createElement('select')
      select_semester.id = 'table-available-semester'
      select_semester.classList.add('form-control')
      select_semester.addEventListener(
        'change', refreshAvailable.bind(undefined, false))
      div_available_header.insertBefore(
        select_semester, div_available_header.firstElementChild)
    } else {
      // refresh button for available
      let btn_available_refresh = btn_refresh.cloneNode(true)
      btn_available_refresh.addEventListener(
        'click', refreshAvailable)
      div_available_header.insertBefore(
        btn_available_refresh, div_available_header.firstElementChild)
      // upload button for available
      div_available_header.insertAdjacentHTML('afterbegin', `
<button type="button" id="btn-submit" class="btn btn-default" title="Upload">
  <span class="glyphicon glyphicon-open"></span>
</button>`)
      let btn_available_submit = div_available_header.firstElementChild
      btn_available_submit.addEventListener('click',
        () => rootTab.submit().then(
          () => {
            loggerInit(
              'submit', 'Successfully submit', 'info', SUBMIT_ALERT_CLOSE_DELAY)
          },
          e => {
            if (e instanceof HttpError) {
              loggerInit('submit', e, 'warn', SUBMIT_ALERT_CLOSE_DELAY)
            } else if (e instanceof TypeError) {
              // nothing to submit
              loggerInit('submit', e, 'warn')
            } else {
              throw e
            }
          }
        ))
    }

    /* table_arrange */
    const table_arrange = document.getElementById('table-arrange')
    dataTable_arrange = $(table_arrange).DataTable({
      autoWidth: false,
      columns: [
        {
          data: null,
          defaultContent: '',
          orderDataType: 'dom-priority',
        },
        {
          data: 'teacher',
          render (data, type, row) {
            return TEACHER.render(row.teacher, row.title)
          },
        },
        {data: 'fullref'},
        {data: 'hour'},
        {
          data: 'max',
          render (data, type, row) {
            return '<span class="td-max" title="Max">' + row.max + '</span>' +
              '<span class="glyphicon glyphicon-chevron-up"></span><br /><p>' +
              '<span class="td-confirmed" title="Confirmed">' + row.confirmed + '</span>' +
              '<span class="glyphicon glyphicon-dashed-arrow-left"></span>' +
              '<span class="td-pending" title="Pending">' + row.pending + '</span></p>' +
              '<span class="td-min" title="Min">' + row.min + '</span>' +
              '<span class="glyphicon glyphicon-chevron-down"></span>'
          },
        },
        {
          data: 'scheduleDesc',
          render (data) {
            return data.replace(/\r/g, '').replace(/\n/g, '<br />')
          },
        },
        {
          data: 'note',
          defaultContent: '',
        },
      ],
      paging: false,
      language: {url: DATATABLE_LANGUAGE_URL},
    })

    // arrange row event listener (note the placeholder)
    let tbody_arrange = table_arrange.tBodies[0]
    tbody_arrange.addEventListener('click', event => {
      // target is a || target contains a
      if (event.target.nodeName === 'A' ||
          event.target.getElementsByTagName('a').length) {
        return
      }
      let entryData = dataTable_arrange.row(event.target.closest('tr')).data()
      if (entryData) {
        entryData.parent.submit(entryData.bsid)
          .then(() => $arrange_modal.modal('hide'))
      }
    })
    tbody_arrange.addEventListener('mouseover', event => {
      let entryData = dataTable_arrange.row(event.target.closest('tr')).data()
      if (entryData) {
        // TODO
      }
    })

    if (mode.name !== 'list') {
      let div_arrange_header = document.getElementById('table-arrange_filter')
      // refresh button for arrange
      let btn_refresh_arrange = btn_refresh.cloneNode(true)
      btn_refresh_arrange.addEventListener('click', () => {})
      div_arrange_header.insertBefore(
        btn_refresh_arrange, div_arrange_header.firstElementChild)
      // adjust width for refresh button and search box
      div_arrange_header.classList.add('col-sm-12')
      div_arrange_header.parentElement.parentElement
        .appendChild(div_arrange_header)
      while (div_arrange_header.previousElementSibling) {
        div_arrange_header.previousElementSibling.remove()
      }
    }
  }).then(
    () => loggerInit('init.datatable', 'table initialisation complete'),
    loggerError('init.datatable', 'Table error during init', true))
}


/**
 * @async
 * @param {(boolen|Event)} [reload=false]
 */
function refreshAvailable (reload) {
  dataTable_available.clear()

  let l_selected_type = selectedType()
  if (l_selected_type.length === 0) {
    dataTable_available.draw()
    return Promise.resolve()
  }

  if (reload) {
    // draw an empty table to indicate reloading
    dataTable_available.draw()
  }

  return Promise.all(l_selected_type.map(reload ?
    typeDesc => rootTab.type(typeDesc).then(tab => tab.load(true)) :
    typeDesc => rootTab.type(typeDesc))
  ).then(l_tab => {
    // add entries to table
    let i = l_tab.length
    while (i--) {
      if (l_tab[i].entries) {
        dataTable_available.rows.add(Object.values(l_tab[i].entries))
      }
    }
    dataTable_available.draw()

    // add schedule table
    let last_tab = l_tab[l_tab.length - 1]
    scheduleTable.table.fill(last_tab.scheduleTable)

    // detect confilcts
    return Promise.all(last_tab.bsids.map(bsid => Lesson.fromBsid(bsid)))
      .then(l_selected_lesson => {
        let q = []
        dataTable_available.rows().every(function () {
          let entryData = this.data()
          let tr = this.node()
          if (entryData.choosen) {
            tr.classList.add('choosen')
            return
          }
          q.push(entryData.parent.type(entryData.ref, true)
            .then(tab => tab.guessEntry().then(obj_ref_lesson => {
              let l_ref_lesson = []
              for (let fake_bsid in obj_ref_lesson) {
                if (obj_ref_lesson[fake_bsid].schedule) {
                  l_ref_lesson.push(obj_ref_lesson[fake_bsid])
                }
              }

              let entryData = this.data()
              let tr = this.node()

              if (l_ref_lesson.length === 0) {
                if (tab.status === 'mismatched') {
                  // no record in db
                } else {
                  tr.classList.add('unavailable')
                }
                return
              }

              if (l_ref_lesson.some(
                  lesson => last_tab.bsids.includes(lesson))) {
                tr.classList.add('choosen')
                return
              }

              for (let i = l_ref_lesson.length; i--;) {
                let ref_lesson = l_ref_lesson[i]
                for (let j = l_selected_lesson.length; j--;) {
                  let selected_lesson = l_selected_lesson[j]
                  if (ref_lesson.conflictsWith(selected_lesson)) {
                    tr.classList.add('confilcted')
                    return
                  }
                }
              }
            })))
        })
        return Promise.all(q)
      }).then(() => dataTable_available.draw()).then(() => l_tab)
  })
}

deferredPool.finished.then(() =>
  window.addEventListener('login', refreshAvailable))
