'use strict'
loadBsids(() => {
  $table_available.children('tbody').children(':not(:first)').map(function () {
    setBsid(
      this.children[0].innerHTML.match(/value="(.*?)"/)[1],
      this.children[3].innerHTML.trim()) })
  saveBsids() })
