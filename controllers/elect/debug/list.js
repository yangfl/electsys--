'use strict'
{
  class DbTab extends TreeNode {
    constructor (parent, typeDesc, types, entries) {
      super(parent, typeDesc)

      this.status = 'loaded'
      this.types = types
      this.entries = entries
      this._tabCache = types
    }

    _preload () {
    }

    _load () {
    }
  }


  this.setupList = function setupList () {
    window.selectedType = () => [[]]
    window.dispatchEvent(new Event('login'))
    Lesson.selectAll().then(result => {
      let select_semester = document.getElementById('table-available-semester')
      Object.keys(result).forEach(semester => {
        let option = document.createElement('option')
        option.value = semester
        option.text = semester
        select_semester.add(option)
      })
    })
    return preMain()
  }
}
