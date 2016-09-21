'use strict'
let dataTable_available
let dataTable_arrange
{
  const SUBMIT_ALERT_CLOSE_DELAY = 1500


  deferredPool.tasks.datatable = deferredPool.start.then(() => {
    const DATATABLE_LANGUAGE_URL =
      chrome.i18n.getMessage('dataTable_language_url')

    /* table_available */
    const table_available = document.getElementById('table-available')
    dataTable_available = $(table_available).DataTable({
      autoWidth: false,
      columns: [
        {
          data: 'name',
          render (data, type, row) {
            if (row.grade) {
              return row.name + ' @ ' + row.grade +
                '<a class="glyphicon glyphicon-info-sign" ' +
                'data-toggle="tooltip" title="' + row.school + '"></a>'
            } else {
              return row.name
            }
          },
          createdCell (cell, cellData, rowData) {
            if (rowData.grade) {
              $('a', cell).tooltip()
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
      language: {url: DATATABLE_LANGUAGE_URL},
    })

    // available row event listener
    let tbody_available = table_available.tBodies[0]
    tbody_available.addEventListener('click', event => {
      let entryData = dataTable_available.row(event.target.closest('tr')).data()
      if (entryData) {
        $waiting_modal.modal()
        entryData.parent.entry(entryData.ref).then(openArrangeModal)
      }
    })
    tbody_available.addEventListener('mouseover', event => {
      let entryData = dataTable_available.row(event.target.closest('tr')).data()
      if (entryData) {
        // TODO
        console.info(entryData)
      }
    })

    let div_available_header = document.getElementById('table-available_filter')
    // refresh button for available
    let btn_available_refresh = refreshButton()
    btn_available_refresh.addEventListener(
      'click', refreshAvailable.bind(undefined, true))
    div_available_header.insertBefore(
      btn_available_refresh, div_available_header.firstElementChild)
    // upload button for available
    let div_temp = document.createElement('div')
    div_temp.innerHTML = `
<button type="button" id="btn-submit" class="btn btn-default" title="Upload">
  <span class="glyphicon glyphicon-open"></span>
</button>`
    let btn_available_submit = div_temp.firstElementChild
    btn_available_submit.addEventListener('click', () => rootTab.submit().then(
      () => {
        loggerInit(
          'submit', 'Successfully submit', 'info', SUBMIT_ALERT_CLOSE_DELAY)
      },
      e => {
        if (e instanceof TypeError) {
          loggerInit('submit', e.message, 'warn', SUBMIT_ALERT_CLOSE_DELAY)
          return
        }
      }
    ))
    div_available_header.insertBefore(
      btn_available_submit, div_available_header.firstElementChild)

    /* table_arrange */
    const table_arrange = document.getElementById('table-arrange')
    dataTable_arrange = $(table_arrange).DataTable({
      autoWidth: false,
      columns: [
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
              '<span class="glyphicon glyphicon-chevron-up"></span><br />' +
              '<span class="td-confirmed" title="Confirmed">' + row.confirmed + '</span>' +
              '<span class="glyphicon glyphicon-dashed-arrow-left"></span>' +
              '<span class="td-pending" title="Pending">' + row.pending + '</span><br />' +
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

    // arrange row event listener
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
        console.info(entryData)
      }
    })

    let div_arrange_header = document.getElementById('table-arrange_filter')
    // refresh button for arrange
    let btn_refresh_arrange = refreshButton()
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
  }).then(
    () => loggerInit('init.datatable', 'table initialisation complete'),
    loggerError('init.datatable', 'Table error during init', true))


  /* helpers */
  const $waiting_modal = $('#wait-arrange')
  const $arrange_modal = $('#select-arrange')
  function openArrangeModal (arrangeTab) {
    $waiting_modal.modal('hide')
    dataTable_arrange.clear()
    dataTable_arrange.rows.add(Object.values(arrangeTab.entryData))
    dataTable_arrange.draw()
    $arrange_modal.modal()
  }

  function refreshButton () {
    let template = document.createElement('template')
    template.innerHTML = `
<button type="button" class="btn btn-default btn-refresh spinning-onhover" title="Refresh">
  <span class="glyphicon glyphicon-refresh"></span>
</button>`
    return template.content.firstElementChild
  }
}


/**
 * @param {(boolen|Event)} reload
 */
function refreshAvailable (reload) {
  dataTable_available.clear()
  if (reload) {
    dataTable_available.draw()
  }
  Promise.all(selectedType().map(typeDesc => {
    let p = rootTab.type(typeDesc)
    if (reload && rootTab.isLoaded(typeDesc)) {
      p = p.then(tab => tab.load(true))
    }
    return p.then(
      tab => {
        if (tab.entries) {
          dataTable_available.rows.add(Object.values(tab.entries))
        }
        showScheduleTable(tab.scheduleTable)
      })
  })).then(() => dataTable_available.draw())
}

deferredPool.finished.then(() =>
  window.addEventListener('login', refreshAvailable))
