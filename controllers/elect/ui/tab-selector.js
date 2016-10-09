'use strict'
/* type */
/**
 * get type desc by dom node
 * @param  {Element} node
 * @returns {Array.<string>}
 */
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


/**
 * @returns {Array.<Array.<string>>}
 */
function selectedType () {
  if (mode.name == 'list') {
    let select_semester = document.getElementById('table-available-semester')
    return [[select_semester.options[select_semester.selectedIndex].value]]
  } else {
    let selectors = ['.btn-type.btn-info']
    if (document.getElementById('btn-limited').classList.contains('btn-info')) {
      selectors.push('#select-limited tr.row-selected')
    }
    if (document.getElementById('btn-out').classList.contains('btn-info')) {
      selectors.push('#select-out li')
    }
    // [].toString happens to generate valid css selector
    return Array.prototype.map.call(
      document.querySelectorAll(selectors.toString()), nodeTypeDesc)
  }
}


{
  /* context menu */
  const contextmenuType = contextMenu.showHandler(
    document.getElementById('menu-type'), (menu, target) => {
      let nodeType = nodeTypeDesc(target)
      nodeType.pop()
      let l_a = menu.getElementsByTagName('a')
      if (rootTab.cacheStauts(nodeType) === 'loaded') {
        l_a[0].style.display = 'block'
        l_a[1].style.display = 'none'
      } else {
        l_a[0].style.display = 'none'
        l_a[1].style.display = 'block'
      }
    }, target => target.closest('[data-minor-type], [data-major-type]'))

  document.getElementById('raw-type').addEventListener('click', event => {
    let nodeType = nodeTypeDesc(contextMenu.getInitiator(event.target))
    let nextType = nodeType.pop()
    openPost(rootTab.cache(nodeType)._nextRequest(nextType))
    contextMenu.close(event.target)
    event.preventDefault()
  })


  /* tab select */
  let button_type = document.querySelectorAll('#list-type .btn-type')
  const CLASS_LOADING = ['progress-bar-striped', 'progress-bar-active']
  function removeSelectedClass (button) {
    button.classList.remove('btn-info')
    button.classList.remove(...CLASS_LOADING)
  }
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
      let cachedTab = rootTab.cache(typeDesc)
      if (cachedTab && cachedTab.status === 'loaded') {
        // cached, draw table
        refreshAvailable()
      } else {
        // prepare for loading
        this.classList.add(...CLASS_LOADING)
        if (!cachedTab || cachedTab.status !== 'loading') {
          rootTab.type(typeDesc).then(tab => {
            // loaded
            this.classList.remove(...CLASS_LOADING)
            updateUI(tab)
          }, e => {
            // failed
            removeSelectedClass(this)
            return loggerError('ajax', 'Error when parsing response', true)(e)
          }).then(refreshAvailable)
        }
      }
    }
  }
  Array.prototype.forEach.call(
    button_type, button => {
      button.addEventListener('click', onclickBtnType)
      button.addEventListener('contextmenu', contextmenuType)
    })


  /* complex-btn */
  let btn_freshman = document.getElementById('btn-freshman')
  let tbody_limited = document.getElementById('table-limited').tBodies[0]
  let modal_limited = document.getElementById('select-limited')
  let modal_out = document.getElementById('select-out')
  /**
   * @param  {Element} tab
   * @param  {bool} [forceOpen=false]
   */
  function updateUI (tab, forceOpen) {
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
        if (!modal_limited.dataset.opened) {
          for (let nextType in tab.types) {
            let obj_row = tab.types[nextType]
            let row = tbody_limited.insertRow()
            row.insertCell().innerText = obj_row.name
            row.insertCell().innerText = obj_row.note
            row.setAttribute('data-minor-type', nextType)
          }
        }
        if (!modal_limited.dataset.opened || forceOpen) {
          modal_limited.dataset.opened = 1
          $(modal_limited).modal()
        }
        break
      case 'outSpeltyEP':
        if (!modal_out.dataset.opened) {
          let l_div_select = document.getElementById('select-out')
            .getElementsByClassName('option-select')[0].children
          Array.from(tab.node.getElementsByTagName('select')).forEach(
            (select, i) => {
              select.classList.add('form-control')
              l_div_select[i].appendChild(select)
            })
          l_div_select[0].firstElementChild.addEventListener('change',
            () => document.getElementById('btn-select-out-add').click())
        }
        if (!modal_out.dataset.opened || forceOpen) {
          modal_out.dataset.opened = 1
          $(modal_out).modal()
        }
        break
    }
  }
  function onclickBtnSelect () {
    rootTab.type(nodeTypeDesc(this.previousElementSibling)).then(
      tab => updateUI(tab, true))
  }
  Array.prototype.forEach.call(
    document.getElementsByClassName('complex-btn'),
    div => div.children[1].addEventListener('click', onclickBtnSelect))

  $(modal_limited).on('hide.bs.modal', refreshAvailable)
  $(modal_out).on('hide.bs.modal', refreshAvailable)


  /* limited */
  tbody_limited.addEventListener('click', event => {
    let tr = event.target.closest('tr')
    if (tr.classList.contains('row-selected')) {
      if (event.ctrlKey) {
        // unselect
        tr.classList.remove('row-selected')
      } else {
        // remove other
        Array.prototype.forEach.call(
          tr.parentElement.children,
          row => row.classList.remove('row-selected'))
        tr.classList.add('row-selected')
      }
    } else {
      // select
      if (event.ctrlKey) {
        //
      } else {
        // unselect other
        Array.prototype.forEach.call(
          tr.parentElement.children,
          row => row.classList.remove('row-selected'))
      }
      tr.classList.add('row-selected')
    }
  })
  tbody_limited.addEventListener('contextmenu', contextmenuType)


  /* out */
  let list_selected = document.getElementById('list-out-selected')
  list_selected.addEventListener('click', event => {
    if (event.target.nodeName === 'SPAN') {
      event.target.closest('li').remove()
    }
  })
  list_selected.addEventListener('contextmenu', contextmenuType)

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
  function addOutSelected (data) {
    for (let option of data) {
      let name = option[0][1] + '@' + option[1][1]
      let id = option[0][0] + '-' + option[1][0]
      if (document.querySelector('[data-minor-type="' + id + '"]')) {
        return
      }
      let li = document.createElement('li')
      li.classList.add('list-group-item')
      li.setAttribute('data-minor-type', id)
      li.innerHTML = name +
        '<span class="pull-right entry-remove glyphicon glyphicon-remove"></span>'
      list_selected.appendChild(li)
    }
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
