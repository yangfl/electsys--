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

  mode.list = {
    pre () {
      loggerInit('init', 'Show lesson list', 'log')
      document.getElementById('list-type').style.display = 'none'
      document.getElementById('btn-result').style.display = 'none'
      deferredPool.start.resolve()
      scheduleTable.table.fill()

      mode.debug.fillInfo()
      window.selectedType = () => [[]]
      window.dispatchEvent(new Event('login'))
      deferredPool.finished.then(() => Lesson.selectAll()).then(result => {
        let select_semester = document.getElementById('table-available-semester')
        Object.keys(result).forEach(semester => {
          let option = document.createElement('option')
          option.value = semester
          option.text = semester
          select_semester.add(option)
        })
      })
      return mode.main()
    },
  }
}
