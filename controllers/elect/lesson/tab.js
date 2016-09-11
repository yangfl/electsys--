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

  window.addEventListener('login', () => {
    rootTab = new Tab
  })

  Tab = class Tab {
    constructor (typeDesc = [], requestUrl, requestData) {
      if (this.constructor === Tab) {
        switch (typeDesc[0]) {
          case 'outSpeltyEP':
            return new OutTab(typeDesc, requestUrl, requestData)
          case undefined:
            return new RootTab
        }
      }

      this.typeDesc = typeDesc // [typeDesc]
      this.parent = undefined
      this.requestUrl = requestUrl
      this.requestData = requestData
      this.status = 'pending'
      this.node = undefined

      this.formAction = undefined // url
      this.statusData = undefined // {name: value}
      this.buttonData = undefined // {value: name}

      this.entryData = undefined // {ref | fullref: {name: value}}
      this.entryCache = {} // {ref | fullref: Tab}
      this.entryFormName = undefined
      this.typeData = undefined // {typeDesc: {name: value}}
      this.typeCache = {} // {typeDesc: Tab}
    }

    consume (func) {
      if (this.node) {
        if (func) {
          func(this.node, this.typeDesc, this)
        }
        this.node = undefined
      }
    }

    preload () {
      if (this.status === 'preloaded' ||
          this.status === 'loading' || this.status === 'loaded') {
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
      return refetch(
        this.requestUrl, this.requestData && postOptions(this.requestData))
      .then(response => response.text().then(data => {
        this.status = 'loaded'
        this._parse(data, response)
        return this
      })).catch(e => {
        this.status = 'failed'
        throw e
      })
    }

    _parse (data, response) {
      // this.node
      this.node = document.createElement('div')
      this.node.innerHTML = data.replace('src', 'tempsrc').substring(
        data.indexOf('>', data.indexOf('<body')) + 1, data.indexOf('</body'))

      // this.typeData
      let first_type = this.node.querySelector('input[onclick][type="radio"]')
      if (first_type) {
        this.typeData = tableSerialize.call(this, first_type.closest('table'))
      }

      // this.entryData
      let first_entry = this.node.querySelector('span > input')
      if (first_entry) {
        this.entryData = tableSerialize.call(this, first_entry.closest('table'))
        if (this.typeDesc[0] == 'outSpeltyEP') {
          let select_school = this.node.getElementsByTagName('select')[0]
          let school = select_school.options[select_school.selectedIndex].text
          for (let key in this.entryData) {
            this.entryData[key].school = school
          }
        }
        this.entryFormName = first_entry.name
      }

      // this.scheduleTable
      let first_classtit = this.node.getElementsByClassName('classtit')[0]
      if (first_classtit) {
        this.scheduleTable = first_classtit.closest('table')
        this.bsids = []
        Array.prototype.forEach.call(
          this.scheduleTable.querySelectorAll('a'), a => {
            let bsid = Number(a.href.split('bsid=')[1])
            if (!this.bsids.includes(bsid)) {
              this.bsids.push(bsid)
            }
          })
      }

      // this.formAction
      this.formAction = URI(
        this.node.getElementsByTagName('form')[0].getAttribute('action').trim()
      ).absoluteTo(response.url).toString()

      // this.buttonData, this.statusData
      this.buttonData = {}
      Array.prototype.forEach.call(
        this.node.querySelectorAll('input[type=submit]'),
        input => {
          this.buttonData[input.value] = input.name
        })
      this.statusData = {}
      Array.prototype.forEach.call(
        this.node.querySelectorAll('input[type=hidden]'),
        input => {
          this.statusData[input.name] = input.value
        })
    }

    entry (entryData, button) {
      if (this.entryData === undefined) {
        throw new TypeError('no entry available')
      }
      if (entryData === undefined) {
        return Object.keys(this.entryData)
      }

      let entryKey = entryData.ref
      if (!(entryKey in this.entryData)) {
        throw new TypeError(`invaild entry ${entryKey}`)
      }

      let entryTab
      if (entryKey in this.entryCache) {
        entryTab = this.entryCache[entryKey]
      } else {
        let _button = typeof button === 'string' ? button : '课程安排'
        entryTab = new ArrangeTab(
          this.typeDesc.concat(entryKey), this.formAction, Object.assign(
            {}, this.statusData, {
              [this.entryFormName]: entryKey,
              [this.buttonData[_button]]: _button,
            }))
        entryTab.parent = this
        this.entryCache[entryKey] = entryTab
      }

      if (button === true) {
        return entryTab.preload()
      } else {
        return entryTab.load()
      }
    }

    type (typeDesc, wantsPredict) {
      if (this.typeData === undefined) {
        throw new TypeError('no type available')
      }
      if (typeDesc === undefined || typeDesc.length === 0) {
        return this._type_list()
      }

      let nextType = typeDesc[0]
      let nextTypeDesc = typeDesc.slice(1)
      if (!(nextType in this.typeData)) {
        return Promise.reject(new TypeError(`invaild type ${typeDesc}`))
      }

      let nextTab
      if (nextType in this.typeCache) {
        nextTab = this.typeCache[nextType]
      } else {
        nextTab = new Tab(
          this.typeDesc.concat(nextType),
          this._type_request_url ? this._type_request_url(nextType) :
                                   this.formAction,
          this.formAction && Object.assign(
            {}, this.statusData, this._type_request_data(nextType)))
        nextTab.parent = this
        this.typeCache[nextType] = nextTab
      }

      let p
      if (wantsPredict) {
        p = nextTab.preload()
      } else {
        p = nextTab.load()
      }
      if (nextTypeDesc.length) {
        p = p.then(nextTab => nextTab.type(nextTypeDesc, wantsPredict))
      }
      return p
    }

    _type_list () {
      return Object.keys(this.typeData)
    }

    _type_request_data (nextType) {
      return {
        __EVENTTARGET: nextType,
        [nextType]: 'radioButton',
      }
    }

    typeCached (typeDesc) {
      if (typeDesc.length) {
        if (this.typeCache[typeDesc[0]]) {
          return this.typeCache[typeDesc[0]].typeCached(typeDesc.slice(1))
        } else {
          return false
        }
      } else {
        return this.status === 'loaded'
      }
    }
  }

  class OutTab extends Tab {
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
      this.typeData = ELECT.list.tab
      this.entryCache = undefined
    }
  }

  RootTab.prototype._type_request_url = ELECT.tab

  class ArrangeTab extends Tab {
    entry (entryData, button = '选定此教师') {
      if (this.entryData === undefined) {
        throw new TypeError('no entry available')
      }
      if (entryData === undefined) {
        return Object.keys(this.entryData)
      }

      let entryKey = entryData.bsid
      if (!(entryKey in this.entryData)) {
        throw new TypeError(`invaild entry ${entryKey}`)
      }

      return refetch(this.formAction, postOptions(Object.assign(
        {}, this.statusData, {
          [this.entryFormName]: entryKey,
          [this.buttonData[button]]: button,
        }))).then(() => window.dispatchEvent(new Event('login')))
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
        let value = td.innerHTML.trim()
        switch (th_text) {
          case '选择':
            continue
          case '\xA0':
            let input = td.getElementsByTagName('input')[0]
            key = input.value
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
        }
        if (!COLUMN_MAPPER[th_text]) debugger
        obj_row[COLUMN_MAPPER[th_text]] = value
      }
      data[key] = obj_row
    }
    return data
  }
}