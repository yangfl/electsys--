'use strict'
let dataTable_available
let dataTable_arrange
{
  deferredPool.tasks.datatable = deferredPool.start.then(() => {
    let language_url = chrome.i18n.getMessage('dataTable_language_url')
    dataTable_available = $('#table-available').DataTable({
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
        },
        {data: 'credit'},
        {data: 'hour'},
      ],
      createdRow (row) {
        row.addEventListener('mouseover', onmouseoverRow)
        row.addEventListener('click', onclickAvailableRow)
      },
      language: {url: language_url},
    })

    let div_available_header = document.getElementById('table-available_filter')
    // refresh
    let btn_available_refresh = refreshButton()
    btn_available_refresh.addEventListener(
      'click', refreshAvailable.bind(undefined, true))
    div_available_header.insertBefore(
      btn_available_refresh, div_available_header.firstElementChild)
    // upload
    let div_temp = document.createElement('div')
    div_temp.innerHTML = `
<button type="button" class="btn btn-default btn-submit" title="Upload">
  <span class="glyphicon glyphicon-open"></span>
</button>`
    let btn_available_submit = div_temp.firstElementChild
    btn_available_submit.addEventListener(
      'click', () => rootTab.submit().then(
        () => {
          // success
        },
        () => {
          // failed
        }
      ))
    div_available_header.insertBefore(
      btn_available_submit, div_available_header.firstElementChild)

    dataTable_arrange = $('#table-arrange').DataTable({
      autoWidth: false,
      columns: [
        {
          data: 'teacher',
          render (data, type, row) {
            return teacher.render(row.teacher, row.title)
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
      createdRow (row) {
        row.addEventListener('mouseover', onmouseoverRow)
        row.addEventListener('click', onclickArrangeRow)
      },
      paging: false,
      language: {url: language_url},
    })

    let div_arrange_header = document.getElementById('table-arrange_filter')
    // refresh btn
    let btn_refresh_arrange = refreshButton()
    btn_refresh_arrange.addEventListener('click', () => {})
    div_arrange_header.insertBefore(
      btn_refresh_arrange, div_arrange_header.firstElementChild)
    // adjust width
    div_arrange_header.classList.add('col-sm-12')
    div_arrange_header.parentElement.parentElement
      .appendChild(div_arrange_header)
    while (div_arrange_header.previousElementSibling) {
      div_arrange_header.previousElementSibling.remove()
    }
  }).then(
    () => loggerInit('init.datatable', 'table initialisation complete'),
    loggerError('init.datatable', 'Table error during init', true))

  function onmouseoverRow () {
    //console.info(dataTable_available.row(this).data())
  }

  const $waiting_modal = $('#wait-arrange')

  function onclickAvailableRow (event) {
    let entryData = $(this.closest('table')).DataTable().row(this).data()
    $waiting_modal.modal()
    entryData.parent.entry(entryData).then(openArrangeModal)
  }

  const $arrange_modal = $('#select-arrange')

  function openArrangeModal (arrangeTab) {
    $waiting_modal.modal('hide')
    dataTable_arrange.clear()
    dataTable_arrange.rows.add(Object.values(arrangeTab.entryData))
    dataTable_arrange.draw()
    $arrange_modal.modal()
  }

  function onclickArrangeRow (event) {
    if (event.target.nodeName === 'A' ||
        event.target.getElementsByTagName('a').length) {
      return
    }
    let entryData = $(this.closest('table')).DataTable().row(this).data()
    entryData.parent.entry(entryData).then(() => $arrange_modal.modal('hide'))
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
