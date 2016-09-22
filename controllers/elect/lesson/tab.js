'use strict'
let rootTab
{
  class Tab {
    constructor (parent, typeDesc) {
      /** @type {Array.<string>} */
      this.parent = parent
      this.typeDesc = typeDesc

      //               pending --> preloading --> preloaded
      //                  |---------------------------|
      //  failed <--> loading --> loaded
      this.status = 'pending'
      this.preloaded = undefined
      this.loaded = undefined
      this._clear()
    }

    get typeDescPath () {
      if (this.parent) {
        return this.parent.TypeDescPath.concat(this.typeDesc)
      } else {
        return []
      }
    }

    _clear () {
      this.node = undefined

      /** @type {Object.<string, Object>} */
      this.entries = undefined
      /** @type {Object.<string, Object>} */
      this.types = undefined
      let tabGenerator =
        nextType => new (this._nextTabClass(nextType))(this, nextType)
      /** @type {Object.<string, Tab>} */
      this._tabCache = new Proxy({}, {
        get (target, key, receiver) {
          if (!(key in target)) {
            target[key] = tabGenerator(key)
          }
          return Reflect.get(target, key, receiver)
        },
      })

      this.scheduleTable = undefined
      this.bsids = undefined

      this._formData = undefined
    }

    preload () {
      if (this.preloaded === undefined) {
        if (this.status === 'pending') {
          this.status = 'preloading'
          this.preloaded = new Promise(resolve => {
            db_tab.transaction(cur_tab_store_name)
              .objectStore(cur_tab_store_name).index('from').get(typeDesc)
              .onsuccess = event => {
                // TODO
                this.status = 'preloaded'
                return resolve(this)
              }
          })
        } else {
          return Promise.resolve(this)
        }
      }
      return this.preloaded
    }

    load (reload) {
      if (this.loaded === undefined || this.status === 'failed') {
        if (this.status !== 'loaded') {
          this.status = 'loading'
          this.loaded = this.parent.load()
            .then(() => refetch(this.parent._nextRequest(this.typeDesc)))
            .then(response => response.text()
              .then(data => this._parse(data, response)))
            .then(() => this)
          this.loaded.catch(e => {
            this.status = 'failed'
          })
        } else {
          return Promise.resolve(this)
        }
      }
      return this.loaded
    }

    _parse (data, response) {
      this.status = 'loaded'
      this._clear()

      // this.node
      this.node = document.createElement('div')
      this.node.innerHTML = data.replace('src', 'tempsrc').substring(
        data.indexOf('>', data.indexOf('<body')) + 1, data.indexOf('</body'))
      // fix buggy form label
      {
        let form = this.node.getElementsByTagName('form')[0]
        form.setAttribute('action', URI(form.getAttribute('action').trim())
          .absoluteTo(response.url).toString())
        form.remove()
        // note: this.node.childNodes will be changed on iteration
        Array.from(this.node.childNodes).forEach(n => form.appendChild(n))
        this.node = form
      }

      this._formData = {}
      for (let [name, value] of new FormData(this.node).entries()) {
        this._formData[name] = value
      }

      // this.types
      let first_type = this.node.querySelector('input[onclick][type="radio"]')
      if (first_type) {
        this.types = tableSerialize.call(this, first_type.closest('table'))
      }

      // this.entries
      let first_entry = this.node.querySelector('span > input')
      if (first_entry) {
        this.entries = tableSerialize.call(this, first_entry.closest('table'))
      }

      // this.scheduleTable
      let first_classtit = this.node.getElementsByClassName('classtit')[0]
      if (first_classtit) {
        this.scheduleTable = first_classtit.closest('table')
        this.bsids = []
        Array.prototype.forEach.call(
          this.scheduleTable.querySelectorAll('a'), a => {
            let td = a.parentNode
            if (td.classList.contains('occupied')) {
              td.classList.add('multiple')
              if (td.innerHTML.includes('有冲突')) {
                td.classList.add('conflicted')
              }
            } else {
              td.classList.add('occupied')
            }
            let bsid = Number(a.href.split('bsid=')[1])
            /*
            let span_name = document.createElement('span')
            span_name.innerText = a.innerHTML
            span_name.setAttribute('data-bsid', bsid)
            td.insertBefore(span_name, a)
            if (a.nextElementSibling) {
              a.nextElementSibling.remove()
            }
            a.remove()
            */
            // disable anchor link
            a.setAttribute('data-bsid', bsid)
            a.setAttribute('href', window.location.hash + '/remove/' + bsid)
            if (!this.bsids.includes(bsid)) {
              this.bsids.push(bsid)
            }
          })
        this.bsids.sort()
      }
    }

    _nextTabClass (nextType) {
      if (isEntry(nextType)) {
        return ArrangeTab
      } else {
        return Tab
      }
    }

    _nextRequest (nextType) {
      return new Request(this.node.action, postOptions(Object.assign(
        {}, this._formData, isEntry(nextType) ?
          this._entryForm(nextType) : this._typeForm(nextType))))
    }

    _entryForm (nextType) {
      return {
        [this.node.querySelector('span > input').name]: nextType,
        [this.node.querySelector('input[value=课程安排]').name]: '课程安排',
      }
    }

    _typeForm (nextType) {
      return {
        __EVENTTARGET: nextType,
        [nextType]: 'radioButton',
      }
    }

    /**
     * Get arrange by token
     * @param {(string|Object)} token
     * @param {sring} button
     * @return ArrangeTab
     */
    entry (nextType, wantsPredict) {
      if (this.entries === undefined) {
        throw new TypeError('no entry available')
      }
      if (!(nextType in this.entries)) {
        return Promise.reject(new TypeError(`invalid enrty ${nextType}`))
      }

      let nextTab = this._tabCache[nextType]
      let p
      if (wantsPredict) {
        p = nextTab.preload()
      } else {
        p = nextTab.load()
      }
      return p
    }

    type (typeDescPath, wantsPredict) {
      if (this.types === undefined) {
        throw new TypeError('no type available')
      }

      let nextType = typeDescPath[0]
      let nextTypeDescPath = typeDescPath.slice(1)
      if (!(nextType in this.types)) {
        return Promise.reject(new TypeError(`invalid type ${typeDescPath}`))
      }

      let nextTab = this._tabCache[nextType]
      let p
      if (wantsPredict) {
        p = nextTab.preload()
      } else {
        p = nextTab.load()
      }
      if (nextTypeDescPath.length) {
        p = p.then(tab => tab.type(nextTypeDescPath, wantsPredict))
      }
      return p
    }

    cache (typeDesc = []) {
      let curTab = this
      for (let i = 0; i < typeDesc.length; i++) {
        if (typeDesc[i] in curTab._tabCache) {
          curTab = curTab._tabCache[typeDesc[i]]
        } else {
          return {}
        }
      }
      return curTab
    }

    submit () {
      return refetch(this.node.action, postOptions(Object.assign(
        {}, this._formData, {
          [this.node.querySelector('input[value=选课提交]').name]: '选课提交',
        })), undefined, () => false)
      .then(() => window.dispatchEvent(new Event('login')))
    }
  }

  class RootTab extends Tab {
    constructor () {
      super()
      this.status = 'loaded'
      this.types = ELECT.list.tab
    }

    submit () {
      for (let k in this._tabCache) {
        return this._tabCache[k].submit()
      }
      return Promise.reject(new TypeError('nothing to submit'))
    }

    _nextTabClass (nextType) {
      switch (nextType) {
        case 'speltyCommonCourse':
          return CommonTab
        case 'outSpeltyEP':
          return OutTab
        default:
          return Tab
      }
    }

    _nextRequest (name) {
      return new Request(ELECT.tab(name), {credentials: 'include'})
    }
  }

  class CommonTab extends Tab {
    _nextTabClass (nextType) {
      return SubCommonTab
    }
  }

  class SubCommonTab extends Tab {
    _parse (data, response) {
      super._parse(data, response)
      // add common course info
      let common_course_type = this.typeDesc[16] - 1
      for (let ref in this.entries) {
        this.entries[ref].as = common_course_type
      }
    }
  }

  class OutTab extends Tab {
    _parse (data, response) {
      super._parse(data, response)
      // this.types
      let select = this.node.getElementsByTagName('select')
      let select_school = select[0]
      let select_year = select[1]
      let types_school = {}
      Array.prototype.forEach.call(select_school.options, option => {
        types_school[option.value] = option.text
      })
      this.types = new Proxy(
        [types_school, Array.prototype.map.call(
          select_year.options, option => Number(option.value))],
        {
          has (target, key) {
            let value = key.split('-')
            return value[0] in target[0] && target[1].includes(Number(value[1]))
          },
        }
      )

      // move page info to the default subtype
      let cur_school = select_school.options[select_school.selectedIndex].value
      let cur_year = select_year.options[select_year.selectedIndex].text
      let subtype_tab = this._tabCache[cur_school + '-' + cur_year]
      subtype_tab.status = 'loaded'
      subtype_tab.loaded = Promise.resolve(subtype_tab)
      subtype_tab._parse(data, response)

      this.entries = undefined
    }

    _nextTabClass (nextType) {
      return SubOutTab
    }

    _typeForm (nextType) {
      let value = nextType.split('-')
      return {
        OutSpeltyEP1$dpYx: value[0],
        OutSpeltyEP1$dpNj: value[1],
        OutSpeltyEP1$btnQuery: '查 询',
      }
    }
  }

  class SubOutTab extends Tab {
    _parse (data, response) {
      super._parse(data, response)
      // add school info
      let select_school = this.node.getElementsByTagName('select')[0]
      let name_school = select_school.options[select_school.selectedIndex].text
      for (let ref in this.entries) {
        this.entries[ref].school = name_school
      }
    }
  }

  class ArrangeTab extends Tab {
    _parse (data, response) {
      super._parse(data, response)
      let q = []
      // add lesson name
      let name = this.parent.entries[this.typeDesc].name
      for (let bsid in this.entries) {
        let lessonInfo = this.entries[bsid]
        lessonInfo.name = name
        q.push(Lesson.from(lessonInfo).then(lesson => {
          // wrap for lesson
          let entryData = Object.create(lesson)
          for (let key in lessonInfo) {
            if (!(key in lesson)) {
              entryData[key] = lessonInfo[key]
            }
          }
          this.entries[bsid] = entryData
        }))
      }
      return Promise.all(q)
    }

    submit (entryData) {
      if (this.entries === undefined) {
        throw new TypeError('no entry available')
      }

      let entryKey = entryData.bsid
      if (!(entryKey in this.entries)) {
        throw new TypeError(`invalid entry ${entryKey}`)
      }
      return refetch(this.node.action, postOptions(Object.assign(
        {}, this._formData, {
          [this.node.querySelector('span > input').name]: entryKey,
          [this.node.querySelector('input[value=选定此教师]').name]: '选定此教师',
        })), undefined, () => false)
      .then(() => window.dispatchEvent(new Event('login')))
    }
  }

  /* helpers */
  const COLUMN_MAPPER = {
    // all
    选择: 'ref',
    课程名称: 'name',
    课程代码: 'ref',
    课程性质: 'type',
    学分: 'credit',
    学时: 'hour',
    是否已选课程: 'choosen',
    // limited
    模块名称: 'name',
    模块说明: 'note',
    // common
    名称: 'name',
    // out
    年级: 'grade',
    // short
    课程模块: 'as',
    提示: 'isFull',
    //arrange
    '\xA0': 'bsid',
    教师姓名: 'teacher',
    职称: 'title',
    课号: 'fullref',
    计划人数: 'max',
    最低人数: 'min',
    已选人数: 'pending',
    确定人数: 'confirmed',
    周安排: 'scheduleDesc',
    备注: 'note',
  }
  function tableSerialize (table) {
    // header
    let headers = Array.prototype.map.call(
      table.querySelector('tr.tdtit').children,
      th => th.innerText)
    let l = headers.length
    // cell
    let data = {}
    let l_tr = table.querySelectorAll('tr:not(.tdtit)')
    for (let i = 0, k = l_tr.length; i < k; i++) {
      let key
      let obj_row = {
        parent: this,
      }
      let l_td = l_tr[i].children
      for (let j = 0; j < l; j++) {
        let th_text = headers[j]
        let td = l_td[j]
        let value = td.innerHTML.replace(/\r/g, '').replace(/\n/g, '').trim()
          .replace(/<br>/g, '\r\n')
        switch (th_text) {
          case '选择':
            key = td.getElementsByTagName('input')[0].name
            continue
          case '\xA0':
            let input = td.getElementsByTagName('input')[0]
            key = Number(input.value)
            value = key
            break
          case '课程代码':
            key = value
            break
          case '学分':
          case '学时':
          case '计划人数':
          case '最低人数':
          case '已选人数':
          case '确定人数':
          case '年级':
            value = Number(value)
            break
          case '是否已选课程':
            value = value == '√'
            break
          case '课程模块':
            value = COMMON_COURSE.typeOf(value)
            break
          case '周安排':
            // remove first line
            value = value.substr(value.indexOf('\n') + 1)
            break
          case '提示':
            value = value == '人数满'
            break
        }
        if (!COLUMN_MAPPER[th_text]) {
          console.debug(th_text)
        }
        obj_row[COLUMN_MAPPER[th_text]] = value
      }
      data[key] = obj_row
    }
    return data
  }

  const ENTRY_PATTERN = /^[A-Z]{2}\d{3}$/
  function isEntry (typeDesc) {
    return ENTRY_PATTERN.test(typeDesc)
  }

  window.addEventListener('login', () => {
    rootTab = new RootTab
  })
}
