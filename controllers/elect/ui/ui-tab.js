'use strict'
/* type */
function nodeTypeDesc (node) {
  if (node.dataset.majorType) {
    // button
    if (node.dataset.minorType) {
      return [node.dataset.majorType, node.dataset.minorType]
    } else {
      return [node.dataset.majorType]
    }
  } else {
    // list
    return [
      node.closest('.complex-btn').firstElementChild.dataset.majorType,
      node.dataset.minorType
    ]
  }
}


function selectedType () {
  let selectors = ['.btn-type.btn-info']
  if (document.getElementById('btn-limited').classList.contains('btn-info')) {
    selectors.push('#select-limited tr.row-selected')
  }
  if (document.getElementById('btn-out').classList.contains('btn-info')) {
    selectors.push('#select-out li')
  }
  // [].toString happens to generate vaild css selector
  return Array.prototype.map.call(
    document.querySelectorAll(selectors.toString()), nodeTypeDesc)
}


{
  /* tab select */
  let button_type = document.querySelectorAll('#list-type .btn-type')
  const CLASS_LOADING = [
    'progress-bar', 'progress-bar-info',
    'progress-bar-striped', 'progress-bar-active'
  ]

  Array.prototype.forEach.call(
    button_type, button => button.addEventListener('click', onclickBtnType))

  function onclickBtnType (event) {
    if (this.classList.contains('btn-info')) {
      if (event.ctrlKey) {
        // unselect
        removeSelectedClass(this)
      } else {
        // remove other
        Array.prototype.forEach.call(button_type, removeSelectedClass)
        this.classList.add('btn-info')
      }
    } else {
      // select
      if (event.ctrlKey) {
        //
      } else {
        // unselect other
        Array.prototype.forEach.call(button_type, removeSelectedClass)
      }
      this.classList.add('btn-info')
      let typeDesc = nodeTypeDesc(this)
      if (rootTab.isLoaded(typeDesc)) {
        refreshAvailable()
      } else {
        this.classList.add(...CLASS_LOADING)
        rootTab.type(typeDesc).then(
          tab => {
            this.classList.remove(...CLASS_LOADING)
            updateUI(tab)
          },
          e => {
            removeSelectedClass(this)
            return loggerError('ajax', 'Error when parsing response', true)(e)
          }).then(refreshAvailable)
      }
    }
  }

  function removeSelectedClass (button) {
    button.classList.remove('btn-info')
    button.classList.remove(...CLASS_LOADING)
  }


  /* modal */
  Array.prototype.forEach.call(
    document.getElementsByClassName('complex-btn'),
    div => div.children[1].addEventListener('click', onclickBtnSelect))

  function onclickBtnSelect () {
    rootTab.type(nodeTypeDesc(this.previousElementSibling)).then(tab => {
      updateUI(tab)
      $(this.nextElementSibling).modal()
    })
  }

  let btn_freshman = document.getElementById('btn-freshman')
  let tbody_limited = document.getElementById('table-limited')
    .getElementsByTagName('tbody')[0]

  function updateUI (tab) {
    // detectFreshman
    if (btn_freshman) {
      let input_freshman = tab.node.querySelector('[value="新生研讨课"]')
      if (input_freshman && input_freshman.disabled) {
        btn_freshman.remove()
        btn_freshman = undefined
      }
    }

    // fillSelectModal
    switch (tab.typeDesc) {
      case 'speltyLimitedCourse':
        for (let nextType in tab.types) {
          let obj_row = tab.types[nextType]
          let row = tbody_limited.insertRow()
          row.insertCell().innerText = obj_row.name
          row.insertCell().innerText = obj_row.note
          row.setAttribute('data-minor-type', nextType)
          row.addEventListener('click', selectOptionRow)
        }
        break
      case 'outSpeltyEP':
        let l_div_select = document.getElementById('select-out')
          .getElementsByClassName('option-select')[0].children
        Array.from(tab.node.getElementsByTagName('select')).forEach(
          (select, i) => {
            select.classList.add('form-control')
            l_div_select[i].appendChild(select)
          })
        break
    }
  }


  /* limited */
  function selectOptionRow () {
    if (this.classList.contains('row-selected')) {
      if (event.ctrlKey) {
        // unselect
        this.classList.remove('row-selected')
      } else {
        // remove other
        Array.prototype.forEach.call(
          this.parentElement.children,
          row => row.classList.remove('row-selected'))
        this.classList.add('row-selected')
      }
    } else {
      // select
      if (event.ctrlKey) {
        //
      } else {
        // unselect other
        Array.prototype.forEach.call(
          this.parentElement.children,
          row => row.classList.remove('row-selected'))
      }
      this.classList.add('row-selected')
    }
  }
}


{
  /* out */
  function* iterSelect (select, selectAny) {
    for (let option of
        selectAny ? select.options : [select.options[select.selectedIndex]]) {
      yield [option.value, option.innerText]
    }
  }

  function* getOutOnselect (...any_options) {
    let [options_school, options_year] = Array.prototype.map.call(
      document.querySelectorAll('#select-out select'),
      (select, i) => Array.from(iterSelect(select, any_options[i])))
    for (let option_year of options_year) {
      for (let option_school of options_school) {
        yield [option_school, option_year]
      }
    }
  }

  let list_selected = document.getElementById('list-out-selected')

  function addOutSelected (data) {
    for (let option of data) {
      addOutSelected_for(option)
    }
  }

  function addOutSelected_for (option) {
    let name = option[0][1] + '@' + option[1][1]
    let id = option[0][0] + '-' + option[1][0]
    if (document.querySelector('[data-id="' + id + '"]')) {
      return
    }
    let li = document.createElement('li')
    li.classList.add('list-group-item')
    li.setAttribute('data-minor-type', id)
    li.innerHTML = name +
      '<span class="pull-right entry-remove glyphicon glyphicon-remove"></span>'
    li.getElementsByTagName('span')[0]
      .addEventListener('click', removeOutSeleced)
    list_selected.appendChild(li)
  }

  function removeOutSeleced () {
    this.closest('li').remove()
  }

  document.getElementById('btn-select-out-add').addEventListener('click',
    () => addOutSelected(getOutOnselect()))
  document.getElementById('btn-select-out-add-all').addEventListener('click',
    () => addOutSelected(getOutOnselect(true)))
  document.getElementById('btn-select-out-remove-all').addEventListener('click',
    () => {
      while (list_selected.lastChild) {
        list_selected.removeChild(list_selected.lastChild)
      }
    })
}


{
  const div_schedule = document.getElementById('container-schedule')
  /**
   * @param {(boolen|Event)} reload
   */
  this.refreshAvailable = function refreshAvailable (reload) {
    dataTable_available.clear()
    if (reload) {
      dataTable_available.draw()
    }
    Promise.all(selectedType().map(typeDesc => {
      let p = rootTab.type(typeDesc)
      if (reload && rootTab.typeCached(typeDesc)) {
        p = p.then(tab => tab.load(true))
      }
      return p.then(
        tab => {
          if (tab.entries) {
            dataTable_available.rows.add(Object.values(tab.entries))
          }
          // remove old schedule table
          while (div_schedule.lastElementChild) {
            div_schedule.removeChild(div_schedule.lastElementChild)
          }
          div_schedule.appendChild(tab.scheduleTable)
        })
    })).then(() => dataTable_available.draw())
  }
}


deferredPool.finished.then(() =>
  window.addEventListener('login', refreshAvailable))
