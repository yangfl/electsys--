'use strict'
let sdtleft
{
  class StuInfo {
    constructor (node) {
      if (node instanceof HTMLElement) {
        // parseInfo
        for (let key in this.constructor.INFO_MAPPER) {
          this[key] = node.querySelector(
            '#' + this.constructor.INFO_MAPPER[key]).innerText.trim()
        }
        this.year = parseInt(this.year)
        this.semester = Number(this.semester)
      } else if (typeof node === 'object') {
        for (let key in this.constructor.INFO_MAPPER) {
          this[key] = node[key]
        }
      } else {
        for (let key in this.constructor.INFO_MAPPER) {
          this[key] = undefined
        }
        // quickInfo
        let date = new Date()
        let is_prev_year = date.getMonth() < 4 ||
          (date.getMonth() == 5 && date.getDay() > 15) || date.getMonth() == 6
        this.semester = is_prev_year + 1
        this.year = date.getFullYear() - is_prev_year
      }
    }

    get yearString () {
      return this.year + '-' + (this.year + 1)
    }

    isValid () {
      for (let key in this) {
        if (!this[key]) {
          return false
        }
      }
      return true
    }

    get next () {
      let result = new this.constructor(this)
      if (result.semester === 1) {
        result.semester = 2
      } else {
        result.year++
        result.semester = 1
      }
      return result
    }

    get prev () {
      let result = new this.constructor(this)
      if (result.semester === 1) {
        result.year--
        result.semester = 2
      } else {
        result.semester = 1
      }
      return result
    }
  }

  StuInfo.INFO_MAPPER = {
    'name': 'lblXm',
    'major': 'lblZy',
    'year': 'lblXn',
    'semester': 'lblXq',
  }

  sdtleft = {
    url: 'http://electsys.sjtu.edu.cn/edu/student/sdtleft.aspx',

    node: undefined,
    load (reload) {
      if (this.node && !reload) {
        return Promise.resolve(this)
      } else {
        this._info = undefined
        this._menu = undefined
        return fetch(this.url, {credentials: 'include'})
          .then(response => response.text()).then(data => {
            this.node = document.createElement('div')
            this.node.innerHTML = data.match(/<table[^]*<\/table>/i)[0]
              .replace(/src=/gi, 'tempsrc=')
            return this
          })
      }
    },

    _info: undefined,
    get info () {
      if (this._info === undefined) {
        this._info = new StuInfo(this.node)
      }
      return this._info
    },

    _menu: undefined,
    get menu () {
      if (this._menu === undefined) {
        this._menu = parseSdtleftMenu(
          this.node.querySelector('table[width="122"]'))
      }
      return this._menu
    },
  }

  function parseSdtleftMenu (table) {
    let l_entry = []
    // table -> tbody -> tr
    let l_tr = table.firstElementChild.children
    for (let i = 0, k = l_tr.length; i < k; i++) {
      let tr = l_tr[i]
      let div_child = tr.getElementsByClassName('child')[0]
      if (div_child) {
        l_entry[l_entry.length - 1][0] = 'group'
        l_entry[l_entry.length - 1][1][1] =
          // div -> table
          parseSdtleftMenu(div_child.firstElementChild)
        continue
      }
      // tr that has a
      let div_a = tr.querySelector('.unuse, .menu')
      if (div_a) {
        let a = div_a.getElementsByTagName('a')[0]
        l_entry.push(['url', [
          a.innerText.trim(),
          URI(a.getAttribute('href').trim()).absoluteTo(sdtleft.url).toString(),
          a.target === '_blank' ]])
      }
    }
    return l_entry
  }
}
