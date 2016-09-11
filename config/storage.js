'use strict'
function initSyncStorage () {
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.clear(() => chrome.storage.sync.set(
      {
        sdtMain_menu: [],
        sdtMain_menu_right: [
          ['url', [
            chrome.i18n.getMessage('menu_right_refresh'),
            'javascript: window.location.reload()']],
          ['url', [
            chrome.i18n.getMessage('menu_right_elect'),
            chrome.extension.getURL('/views/elect/index.html')]],
          ['url', [
            chrome.i18n.getMessage('menu_right_logout'),
            'http://electsys.sjtu.edu.cn/edu/logOut.aspx', true]], ],
        popup_menu: [
          ['url', [
            chrome.i18n.getMessage('menu_popup_main'),
            'http://electsys.sjtu.edu.cn/edu/student/sdtMain.aspx']], ],

        sdtleft_hide: [], //[4, 5, 11, 15, 16, 17],

        show_message: 1000,

        autofill: true,
        autologin_retry: 2,

        exclude_words: ['留学生', '民族班', '保健班'],

        color_head: '#bc8',
        color_not_full: 'lightgreen',
        color_full: 'lightcoral',
        color_confilcted: '#c96',
        color_choosen: '#faf',
        color_unavailable: 'lightslategrey',
        color_hover: '#fc6',

        step_base: 1475,
        step_penalty: 1.3,
        step_retry: 3,

        random_a: .7,
        random_b: 1,
        random_n: 10,
        random_k1: 9,
        random_k2: 6,
        random_k3: 3,
      }, resolve))
  })
}


function initLocalStorage () {
  return new Promise(function (resolve, reject) {
    let l_promise = [
      new Promise(function (resolve, reject) {
        chrome.storage.local.clear(resolve)
      })
    ]
    indexedDB.webkitGetDatabaseNames().onsuccess = function (sender, args) {
      let r = sender.target.result
      for (let i = 0; i < r.length; i++) {
        l_promise.push(new Promise(function (resolve, reject) {
          let request = indexedDB.deleteDatabase(r[i])
          request.onsuccess = resolve
          request.onerror = event => reject(event.target.error)
        }))
      return resolve(Promise.all(l_promise).then(resolve, reject))
      }
    }
  })
}


function initStorage () {
  return Promise.all([initSyncStorage(), initLocalStorage()])
}
