'use strict'
let config
{
  config = {
    init () {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync') {
          let item = {}
          for (let key in changes) {
            if ('newValue' in changes[key]) {
              item[key] = changes[key].newValue
            }
          }
          this.loaders.forEach(loader => loader(item))
        }
      })
      this.bind()
      return this.load()
    },

    load () {
      return new Promise((resolve, reject) => chrome.storage.sync.get(item => {
        try {
          this.loaders.forEach(loader => loader(item, true))
        } catch (e) {
          return reject(e)
        }
        return resolve()
      }))
    },

    set (key, value) {
      return new Promise(resolve =>
        chrome.storage.sync.set({[key]: value}, resolve))
    },

    get (key) {
      return new Promise(resolve =>
        chrome.storage.sync.get(key, resolve))
    },

    bind () {
      $('.config-sync[type=checkbox]').on('switchChange.bootstrapSwitch',
        function (event, state) {
          config.set(this.id, state)
        })
      Array.prototype.forEach.call(
        document.querySelectorAll('.config-sync[type=number]'),
        input => input.addEventListener('change', saveNumber))
      Array.prototype.forEach.call(
        document.querySelectorAll('.config-sync.config-list'),
        input => input.addEventListener('change', saveList))
      Array.prototype.forEach.call(
        document.querySelectorAll('.config-sync[type=text]:not(.config-list)'),
        input => input.addEventListener('change', saveText))
    },

    loaders: [
      (item, hasAll) => {
        let l_node = document.getElementsByClassName('config-sync')
        let i = l_node.length
        while (i--) {
          let node = l_node[i]
          if (node.type === 'checkbox') {
            if (hasAll || node.id in item) {
              $(node).bootstrapSwitch('state', item[node.id] || false)
            }
            continue
          }
          if (!(node.id in item)) {
            continue
          }
          switch (node.type) {
            case 'number':
              node.value = item[node.id] || 0
              break
            default:
              if (node.classList.contains('config-list')) {
                node.value = item[node.id].join(', ')
              } else {
                node.value = item[node.id] || ''
              }
              if (node.classList.contains('config-color')) {
                node.style.backgroundColor = node.value
              }
          }
        }
      },
    ],
  }


  function saveNumber () {
    config.set(this.id, Number(this.value))
  }

  function saveList () {
    config.set(
      this.id, this.value.split(',').map(i => i.trim()).filter(i => i))
  }

  function saveText () {
    config.set(this.id, this.value)
  }
}
