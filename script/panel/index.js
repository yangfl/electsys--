'use strict'
var $table_login = $('input[value="登录"]').closest('table')
var $button_login = $('<a role="button" class="pure-button" \
style="padding: 70px;">登录</a>')
  .attr('href', $table_login.find('a:eq(1)').attr('href'))
$.get('/edu/student/elect/RecommandTblOuter.aspx', data => {
  if (!data.includes('对不起你的网页已经过期')) {
    $button_login.attr('href', '/edu/student/sdtMain.aspx') }})
$table_login.after($button_login)
$table_login.closest('tr').attr('align', 'center')
$table_login.hide()
