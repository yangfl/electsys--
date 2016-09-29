'use strict'
let sdtleft
{
  class UserInfo {
    constructor (node) {
      if (node === undefined) {
        // quickInfo
        let date = new Date()
        let is_prev_year = date.getMonth() < 4 ||
          (date.getMonth() == 5 && date.getDay() > 15) || date.getMonth() == 6

        return new this.constructor({
          year: date.getFullYear() - is_prev_year,
          semester: is_prev_year + 1,
        })
      }

      if (node instanceof HTMLElement) {
        // parseInfo
        for (let key in this.constructor.INFO_MAPPER) {
          this[key] = node.querySelector(
            '#' + this.constructor.INFO_MAPPER[key]).innerText.trim()
        }
        this.semester = Number(this.semester)
      } else if (typeof node === 'object') {
        for (let key in this.constructor.INFO_MAPPER) {
          this[key] = node[key]
        }
      } else {
        throw TypeError('unknown node type ' + typeof node)
      }

      return new Proxy(this, this.constructor.handler)
    }

    get year () {
      if (isNaN(this._year)) {
        return ''
      } else {
        return this._year + '-' + (this._year + 1)
      }
    }

    set year (value) {
      this._year = parseInt(value)
    }

    get absSemester () {
      return this.toString()
    }

    toJSON () {
      let result = {}
      for (let key in this) {
        result[key] = this[key]
      }
      return result
    }

    toString () {
      return this.year + '-' + this.semester
    }

    isValid () {
      for (let key in this) {
        if (!this[key]) {
          return false
        }
      }
      return true
    }

    /** @type {UserInfo} */
    get next () {
      let result = new this.constructor(this)
      if (result.semester === 1) {
        result.semester = 2
      } else {
        result._year++
        result.semester = 1
      }
      return result
    }

    /** @type {UserInfo} */
    get prev () {
      let result = new this.constructor(this)
      if (result.semester === 1) {
        result._year--
        result.semester = 2
      } else {
        result.semester = 1
      }
      return result
    }
  }
  UserInfo.INFO_MAPPER = {
    'name': 'lblXm',
    'major': 'lblZy',
    'year': 'lblXn',
    'semester': 'lblXq',
  }
  UserInfo.handler = {
    enumerate (target, key) {
      return Object.keys(UserInfo.INFO_MAPPER)
    },
    ownKeys (target, key) {
      return Object.keys(UserInfo.INFO_MAPPER)
    },
  }

  sdtleft = {
    url: 'http://electsys.sjtu.edu.cn/edu/student/sdtleft.aspx',

    node: undefined,
    loaded: 'Deferred' in window ? new Deferred() : undefined,
    load (reload) {
      if (reload || this.loaded === undefined ||
          this.loaded.resolve !== undefined) {
        this._info = undefined
        this._menu = undefined
        let loaded = this.loaded
        this.loaded = fetch(this.url, {credentials: 'include'})
          .then(response => response.text()).then(data => {
            this.node = document.createElement('div')
            this.node.innerHTML = data.match(/<table[^]*<\/table>/i)[0]
              .replace(/src=/gi, 'tempsrc=')
            if (loaded) {
              loaded.resolve()
            }
            return this
          })
      }
      return this.loaded
    },

    /** @type {UserInfo} */
    _info: undefined,
    get info () {
      if (this._info === undefined) {
        this._info = new UserInfo(this.node)
      }
      return this._info
    },
    set info (data) {
      this._info = new UserInfo(data)
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
