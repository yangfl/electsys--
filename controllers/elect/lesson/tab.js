'use strict'
let Tab
let rootTab
{
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

  Tab = class Tab {
    constructor (parent, thisTypeDesc) {
      if (this.constructor === Tab) {
        switch (thisTypeDesc) {
          case 'outSpeltyEP':
            return new OutTab(parent, thisTypeDesc)
          case undefined:
            return new RootTab
        }
      }

      /** @type {Array.<string>} */
      this.parent = parent
      this.typeDesc = this.parent ?
        this.parent.typeDesc.concat(thisTypeDesc) : []
      this._request = undefined
      //               pending --> preloading --> preloaded
      //                  |---------------------------|
      //  failed <--> loading --> loaded
      this.status = 'pending'
      this._clear()
    }

    _clear () {
      this.node = undefined

      /** @type {Object.<string, Object>} */
      this.entries = undefined
      /** @type {Object.<string, Object>} */
      this.types = undefined
      let tabGenerator = nextType => new Tab(this, nextType)
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
    }

    preload () {
      if (this.status === 'pending') {
        return Promise.resolve(this)
      }
      this.status = 'preloading'
      return new Promise(resolve => {
        db_tab.transaction(cur_tab_store_name).objectStore(cur_tab_store_name)
          .index('from').get(typeDesc).onsuccess = event => {
            // TODO
            this.status = 'preloaded'
            return resolve(this)
          }
      })
    }

    load (reload) {
      if (this.status === 'loaded' && !reload) {
        return Promise.resolve(this)
      }
      this.status = 'loading'
      if (this.request === undefined) {
        this.request = this.parent
      }
      return refetch(this.request)
        .then(response => response.text()
          .then(data => this._parse(data, response)))
        .then(() => this).catch(e => {
          this.status = 'failed'
          throw e
        })
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


      let form_data = Array.from(new FormData(this.node).entries())
      debugger

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
            a.removeAttribute('href')
            if (!this.bsids.includes(bsid)) {
              this.bsids.push(bsid)
            }
          })
        this.bsids.sort()
      }
    }

    /**
     * Get arrange by token
     * @param {(string|Object)} token
     * @param {sring} button
     * @return ArrangeTab
     */
    entry (token, button = '课程安排') {
      if (this.entries === undefined) {
        throw new TypeError('no entry available')
      }

      let entryData
      let entryKey
      if (typeof token === 'object') {
        entryData = token
        entryKey = entryData.ref
      } else {
        entryData = this.entries[token]
        entryKey = token
      }
      if (entryData === undefined) {
        throw new TypeError(`invaild entry ${entryKey}`)
      }

      let entryTab
      if (entryKey in this._tabCache) {
        entryTab = this._tabCache[entryKey]
      } else {
        entryTab = new ArrangeTab(this.typeDesc.concat(entryKey))
        entryTab.request = new Request(this.formAction, Object.assign(
          {}, this.statusData, {
            [this.entryFormName]: entryKey,
            [this.buttonData[button]]: button,
          }))
        entryTab.data = entryData
        this._tabCache[entryKey] = entryTab
      }
      return entryTab
    }

    type (typeDesc, wantsPredict) {
      if (this.types === undefined) {
        throw new TypeError('no type available')
      }

      let nextType = typeDesc[0]
      let nextTypeDesc = typeDesc.slice(1)
      if (!(nextType in this.types)) {
        return Promise.reject(new TypeError(`invaild type ${typeDesc}`))
      }

      let nextTab = this._tabCache[nextType]
      let p
      if (wantsPredict) {
        p = nextTab.preload()
      } else {
        p = nextTab.load()
      }
      if (nextTypeDesc.length) {
        p = p.then(tab => tab.type(nextTypeDesc, wantsPredict))
      }
      return p
    }

    typeCached (typeDesc = []) {
      let curTab = this
      for (let i = 0; i < typeDesc.length; i++) {
        if (typeDesc[i] in curTab._tabCache) {
          curTab = curTab._tabCache[typeDesc[i]]
        } else {
          return false
        }
      }
      return curTab.status === 'loaded'
    }

    submit (button = '选课提交', data) {
      return refetch(
        this.formAction, postOptions(Object.assign(
          {}, this.statusData, {[this.buttonData[button]]: button})),
        undefined, () => false)
      .then(() => window.dispatchEvent(new Event('login')))
    }

    _request (name, value, button) {
      return {
        __EVENTTARGET: nextType,
        [nextType]: 'radioButton',
      }
      return new Request(this.formAction,
        this.formAction && postOptions(Object.assign(
          {}, this.statusData, this._type_request_data(nextType))))
    }
  }

  class OutTab extends Tab {
    _parse (data, response) {
      super._parse(data, response)
      // add school info
      let select_school = this.node.getElementsByTagName('select')[0]
      let school = select_school.options[select_school.selectedIndex].text
      for (let key in this.entries) {
        this.entries[key].school = school
      }
    }

    _type_request_data (nextType) {
      let value = nextType.split('-')
      return {
        OutSpeltyEP1$dpYx: value[0],
        OutSpeltyEP1$dpNj: value[1],
        [this.buttonData['查 询']]: '查 询',
      }
    }
  }

  class RootTab extends Tab {
    constructor () {
      super()
      this.status = 'loaded'
      this.types = ELECT.list.tab
    }

    submit (button) {
      for (let k in this._tabCache) {
        return this._tabCache[k].submit(button)
      }
      throw new TypeError('nothing to submit')
    }

    _request (name) {
      return new Request(ELECT.tab(name), {credentials: 'include'})
    }
  }

  class ArrangeTab extends Tab {
    _parse (data, response) {
      super._parse(data, response)
      let q = []
      let name = this.parent.entries[this.typeDesc[this.typeDesc.length - 1]]
        .name
      for (let bsid in this.entries) {
        let lessonInfo = this.entries[bsid]
        // add lesson name
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

    submit (button = '选定此教师', entryData) {
      if (this.entries === undefined) {
        throw new TypeError('no entry available')
      }

      let entryKey = entryData.bsid
      if (!(entryKey in this.entries)) {
        throw new TypeError(`invaild entry ${entryKey}`)
      }
      refetch(this.formAction, postOptions(Object.assign(
        {}, this.statusData, {
          [this.entryFormName]: entryKey,
          [this.buttonData[button]]: button,
        }))).then(() => window.dispatchEvent(new Event('login')))

      return super.submit(button)
    }
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
          case '周安排':
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

  window.addEventListener('tab.debug', () => {
    debugger
  })
}


window.addEventListener('login', () => {
  rootTab = new Tab
})
