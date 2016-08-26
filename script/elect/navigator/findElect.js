'use strict'
setupResponseURL()
const L_STAGE_INDEX = [
  [1, 1], //一专海选
  [2, 1], //一专抢选
  [3, 1], //一专第三轮
  [1, 3], //暑假小学期海选
  [2, 3], //暑假小学期抢选
  [3, 3], //暑假小学期第3轮
  [4, 2], //二专抢选
  [5, 2], //二专重修
]
const ELECT_URL = 'http://electsys.sjtu.edu.cn/edu/student/elect/warning.aspx?\
xklc={0}&lb={1}'


var getElectStageUrl = (stage, type) =>
  ELECT_URL.replace('{0}', stage).replace('{1}', type)


var testElectStage = function* (data, textStatus, jqXHR) {
  //return true
  var responseURL = jqXHR.getResponseHeader('responseURL')
  if (responseURL.includes('messagePage.aspx')) {
    return false }
  var $form =
    $(data.match(/<form[^]*<\/form>/i)[0].replace(/src=/gi, 'tempsrc='))
  var $submit = $form.find('input[value=继续]')
  if ($submit.length) {
    $form.find('input[type=checkbox]').click()
    var form_data = $form.serializeArray()
    form_data.push({name: $submit.attr('name'), value: $submit.val()})
    return (yield* testElectStage.apply(
      this, yield $.post(responseURL, form_data))) }
  else if (data.includes('arrowdown.gif')) {
    return true }}


var findElectStage = asyncWapper(function* (callback) {
  for (var [stage, type] of L_STAGE_INDEX) {
    if (yield* testElectStage.apply(
        this, yield $.get(getElectStageUrl(stage, type)))) {
      return callback(stage, type) }}
  return callback() })


var prepareElectStage = (callback = () => {}) =>
  findElectStage((stage, type) => {
    if (stage === undefined) {
      return callback() }
    /* var {year, semester} = quickInfo(stage != 3 && type != 3)
    prepareArranges(year, semester) */
    return callback(getElectStageUrl(stage, type)) })
