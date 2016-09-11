'use strict'
let sdtleft
{
  sdtleft = {
    url: 'http://electsys.sjtu.edu.cn/edu/student/sdtleft.aspx',

    node: undefined,
    load (reload) {
      if (this.node && !reload) {
        return Promise.resolve()
      } else {
        this._info = undefined
        this._menu = undefined
        return fetch(this.url, {credentials: 'include'})
          .then(response => response.text()).then(data => {
            this.node = document.createElement('div')
            this.node.innerHTML = data.match(/<table[^]*<\/table>/i)[0]
              .replace(/src=/gi, 'tempsrc=')
          })
      }
    },

    _info: undefined,
    _info_mapper: {
      'name': 'lblXm',
      'major': 'lblZy',
      'year': 'lblXn',
      'semester': 'lblXq',
    },
    get info () {
      if (this._info) {
        return this._info
      } else if (this.node) {
        // parseInfo
        this._info = {}
        for (let key in this._info_mapper) {
          this._info[key] = this.node
            .querySelector('#' + this._info_mapper[key]).innerText.trim()
        }
        return this._info
      } else {
        // quickInfo
        let date = new Date()
        let is_prev_year = date.getMonth() < 4 ||
          (date.getMonth() == 5 && date.getDay() > 15) || date.getMonth() == 6
        let semester = is_prev_year + 1
        let start_year = date.getFullYear() - is_prev_year
        /* if (next_p) {
          // 1 -> 2, 2 -> 1
          semester = 3 - semester
          if (semester == 1) {
            start_year++
          }
        } */
        let year = start_year + '-' + (start_year + 1)
        return {year: year, semester: semester}
      }
    },
    isVaild () {
      if (this._info === undefined) {
        if (this.node === undefined) {
          return false
        } else {
          // try getter
          this.info
        }
      }
      for (let key in this._info) {
        if (this._info[key] === '') {
          return false
        }
      }
      return true
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
