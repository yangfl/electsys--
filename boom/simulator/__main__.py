#!/usr/bin/env python3
from bottle import *

ROOT = 'tpl'

def set_static(path):
    @route(path + '/<filename>')
    def static(filename):
        return static_file(filename, root=ROOT + path)


for path in ('/edu/imgs', '/edu/include', '/edu/images'):
    set_static(path)


@route('/')
@route('/edu/')
def index():
    redirect('/edu/student/elect/secondRoundFP.aspx')


@route('/edu/lesson/viewLessonArrangeDetail2.aspx')
def viewLessonArrangeDetail2():
    return template('{}/edu/lesson/viewLessonArrangeDetail2.aspx?bsid={}'
        .format(ROOT, request.query.bsid))


@route('/edu/lesson/<page>')
def lesson(page):
    return template(ROOT + '/edu/lesson/' + page)


@route('/edu/student/elect/<page>')
def elect(page):
    return template(ROOT + '/edu/student/elect/' + page)


@post('/edu/student/elect/<page>')
def post_elect(page):
    for btn_key in request.forms.keys():
        if 'lessonArrange' in btn_key:
            redirect('/edu/lesson/viewLessonArrange.aspx?a=b')
        if 'Bxk' in btn_key:
            redirect('speltyRequiredCourse.aspx')
        if 'Xxk' in btn_key:
            redirect('speltyLimitedCourse.aspx')
        if 'Txk' in btn_key:
            redirect('speltyCommonCourse.aspx')
        if 'XuanXk' in btn_key:
            redirect('outSpeltyEP.aspx')
        if 'Ytk' in btn_key:
            redirect('freshmanLesson.aspx')
        if 'Qxsy' in btn_key:
            redirect('secondRoundFP.aspx')
        if 'FastCancel' in btn_key:
            redirect('removeLessonFast.aspx')
    return repr(tuple(request.forms.keys()))

entry = '127.0.0.1\telectsys.sjtu.edu.cn\n'
err = None

with open('/etc/hosts', 'a') as f:
    f.write(entry)

try:
    run(port=80, reloader=True, debug=True)
except Exception as e:
    err = e

with open('/etc/hosts') as f:
    content = f.readlines()
while entry in content:
    content.remove(entry)
with open('/etc/hosts', 'w') as f:
    f.writelines(content)
if err:
    raise err
