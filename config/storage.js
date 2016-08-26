'use strict'
var initSyncStorage =
  callback => chrome.storage.sync.clear(
    () => chrome.storage.sync.set(
      {
        sdtMain_menu: [],
        sdtMain_menu_right: [
          ['url', [
            chrome.i18n.getMessage('menu_right_refresh'),
            'javascript: window.location.reload()']],
          ['url', [
            chrome.i18n.getMessage('menu_right_elect'),
            chrome.extension.getURL('/script/elect/navigator/electMain.html')]],
          ['url', [
            chrome.i18n.getMessage('menu_right_logout'),
            'http://electsys.sjtu.edu.cn/edu/logOut.aspx', true]], ],
        popup_menu: [
          ['url', [
            chrome.i18n.getMessage('menu_popup_main'),
            'http://electsys.sjtu.edu.cn/edu/student/sdtMain.aspx']], ],

        sdtleft_hide: [], //[4, 5, 11, 15, 16, 17],

        show_message: 1000,

        autofill_retry: 2,

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

        random_a: .7,
        random_b: 1,
        random_n: 10,
        random_k1: 9,
        random_k2: 6,
        random_k3: 3, },
      callback))

var initLocalStorage =
  callback => chrome.storage.local.clear(
    () => chrome.storage.local.set(
      {
        arrange: [],
        schedule: {},
        bsid: {},
        timestamp: [], },
      callback))

var initStorage = callback => initSyncStorage(() => initLocalStorage(callback))
