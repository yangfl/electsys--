'use strict'
function i18n (prefix, root = document) {
  let nodes = root.querySelectorAll('[data-i18n]')
  let i = nodes.length
  while (i--) {
    let node = nodes[i]
    let keys = node.dataset.i18n.split(';')
    let j = keys.length
    while (j--) {
      let key = keys[j]
      if (key.startsWith('[')) {
        let attr_key = key.split(']')
        node[attr_key[0]] = chrome.i18n.getMessage(prefix + attr_key[1])
      } else {
        node.innerText = chrome.i18n.getMessage(prefix + key)
      }
    }
  }
  return root
}
