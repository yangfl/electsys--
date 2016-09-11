'use strict'
let config
{
  config = {
    init () {
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync') {
          for (let key in changes) {
            changes[key] = changes[key].newValue
          }
          this.loaders.forEach(loader => loader(changes))
        }
      })
      this.bind()
      return this.load()
    },

    load () {
      return new Promise(resolve => chrome.storage.sync.get(item => {
        this.loaders.forEach(loader => loader(item))
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
      item => {
        for (let key in item) {
          setConfigDom(document.getElementById(key), item[key])
        }
      },
    ],
  }

  function setConfigDom (input, value) {
    if (!input) {
      return
    }
    switch (input.type) {
      case 'checkbox':
        $(input).bootstrapSwitch('state', value)
        break
      case 'number':
        input.value = value || 0
        break
      default:
        if (input.classList.contains('config-list')) {
          input.value = value.join(', ')
        } else {
          input.value = value || ''
        }
        if (input.classList.contains('config-color')) {
          input.style.backgroundColor = input.value
        }
    }
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
