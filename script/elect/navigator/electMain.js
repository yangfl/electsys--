'use strict'
prepareElectStage(elect_stage_url => {
  if (elect_stage_url) {
    window.location = elect_stage_url }
  else {
    $('body').append(
      $('<p />').text(chrome.i18n.getMessage('elect_electMain_error'))) }})
