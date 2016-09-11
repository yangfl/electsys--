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
        {
          data: 'major_type',
          render (data, type, row) {
            if (row.as) {
              return row.type + ' (' + row.as + ')'
            }
            return row.type
          },
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
    let btn_available_refresh = refreshButton()
    btn_available_refresh.addEventListener(
      'click', refreshAvailable.bind(undefined, true))
    div_available_header.insertBefore(
      btn_available_refresh, div_available_header.firstElementChild)

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
            return '<span class="glyphicon glyphicon-chevron-up"></span>' +
              '<span class="td-min">' + row.min + '</span><br />' +
              '<span class="td-pending">' + row.pending + '</span>' +
              '<span class="glyphicon glyphicon-dashed-arrow-right"></span>' +
              '<span class="td-confirmed">' + row.confirmed + '</span><br />' +
              '<span class="glyphicon glyphicon-chevron-down"></span>' +
              '<span class="td-max">' + row.max + '</span>'
          },
        },
        {
          data: 'scheduleDesc',
          render (data) {
            return data.replace(/\r/g, '').replace(/\n/g, '<br />')
          },
        },
        {data: 'note'},
      ],
      createdRow (row) {
        row.addEventListener('mouseover', onmouseoverRow)
        row.addEventListener('click', onclickArrangeRow)
      },
      paging: false,
      language: {url: language_url},
    })

    let div_arrange_header = document.getElementById('table-arrange_filter')
    let btn_refresh_arrange = refreshButton()
    btn_refresh_arrange.addEventListener('click', () => {})
    div_arrange_header.insertBefore(
      btn_refresh_arrange, div_arrange_header.firstElementChild)
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

  function onclickAvailableRow (event) {
    let entryData = $(this.closest('table')).DataTable().row(this).data()
    entryData.parent.entry(entryData).then(openArrangeModal)
  }

  const $arrange_modal = $('#select-arrange')

  function onclickArrangeRow (event) {
    if (event.target.nodeName === 'A' ||
        event.target.getElementsByTagName('a').length) {
      return
    }
    let entryData = $(this.closest('table')).DataTable().row(this).data()
    entryData.parent.entry(entryData).then(() => $arrange_modal.modal('hide'))
  }

  function openArrangeModal (arrangeTab) {
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
