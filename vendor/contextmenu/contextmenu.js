'use strict'
let contextMenu = {
  initiators: new WeakMap,

  getInitiator (node) {
    let menu = contextMenu.getMenu(node)
    if (menu) {
      return contextMenu.initiators.get(menu)
    }
  },

  getMenu (node) {
    return node.closest('.contextmenu')
  },

  showHandler (menu, callback, targetConvertor) {
    return event => {
      let target = event.target
      if (targetConvertor) {
        target = targetConvertor(event.target)
        if (!target) {
          return
        }
      }
      event.preventDefault()
      if (menu.classList.contains('open') &&
          contextMenu.initiators.get(menu) === target) {
        contextMenu.close(menu)
      } else {
        menu.classList.add('open')
        if (event.pageX + menu.firstElementChild.offsetWidth >
            document.documentElement.offsetWidth) {
          menu.style.left = event.pageX -
            menu.firstElementChild.offsetWidth + 'px'
        } else {
          menu.style.left = event.pageX + 'px'
        }
        if (event.pageY + menu.firstElementChild.offsetHeight >
            document.documentElement.offsetHeight) {
          menu.style.top = event.pageY -
            menu.firstElementChild.offsetHeight + 'px'
        } else {
          menu.style.top = event.pageY + 'px'
        }
        contextMenu.initiators.set(menu, target)
        return callback(menu, target, event)
      }
    }
  },

  close (node) {
    if (node instanceof HTMLElement) {
      if (!node.classList.contains('contextmenu')) {
        return contextMenu.close(contextMenu.getMenu(node))
      }
      if (node.classList.contains('open')) {
        node.classList.remove('open')
        return true
      }
      return false
    } else {
      return Array.prototype.some.call(
        document.getElementsByClassName('contextmenu'), contextMenu.close)
    }
  }
}


document.addEventListener('contextmenu', event => {
  if (contextMenu.getMenu(event.target)) {
    return
  }
  if (!event.defaultPrevented) {
    if (contextMenu.close()) {
      event.preventDefault()
    }
  }
})
document.addEventListener('click',  event => {
  if (contextMenu.getMenu(event.target)) {
    return
  }
  contextMenu.close()
})
