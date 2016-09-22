#!/usr/bin/env python3
import os

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
    path = '/edu/lesson/viewLessonArrangeDetail2.aspx?bsid=' + \
        request.query.bsid
    if os.path.isfile(ROOT + path):
        return template(ROOT + path)
    redirect('http://electsys.sjtu.edu.cn' + path)


@route('/edu/lesson/<page>')
def lesson(page):
    return template(ROOT + '/edu/lesson/' + page)


@route('/edu/student/elect/<page>')
def elect(page):
    return template(ROOT + '/edu/student/elect/' + page)


@post('/edu/student/elect/<page>')
def post_elect(page):
    for btn_key in request.forms.keys():
        if btn_key.endswith('lessonArrange'):
            redirect('/edu/lesson/viewLessonArrange.aspx?a=b')
        if btn_key.endswith('Bxk'):
            redirect('speltyRequiredCourse.aspx')
        if btn_key.endswith('Xxk'):
            redirect('speltyLimitedCourse.aspx')
        if btn_key.endswith('Txk'):
            redirect('speltyCommonCourse.aspx')
        if btn_key.endswith('XuanXk'):
            redirect('outSpeltyEP.aspx')
        if btn_key.endswith('Ytk'):
            redirect('freshmanLesson.aspx')
        if btn_key.endswith('Qxsy'):
            redirect('secondRoundFP.aspx')
        if btn_key.endswith('FastCancel'):
            redirect('removeLessonFast.aspx')
    if '__EVENTTARGET' in request.forms:
        with open(ROOT + '/edu/student/elect/' + page + '?' +
                request.forms['__EVENTTARGET']) as f:
            return f.read()
    if 'OutSpeltyEP1$dpYx' in request.forms:
        with open(ROOT + '/edu/student/elect/' + page + '?' +
                request.forms['OutSpeltyEP1$dpYx'] + '-' +
                request.forms['OutSpeltyEP1$dpNj']) as f:
            return f.read()
    return repr(tuple(request.forms.keys()))


def main():
    import sys
    sudo = len(sys.argv) > 1 and sys.argv[1] == '-s'
    if sudo:
        entry = '127.0.0.1\telectsys.sjtu.edu.cn\n'
        with open('/etc/hosts', 'a') as f:
            f.write(entry)

    err = None

    try:
        run(port=80 if sudo else 8080, reloader=True, debug=True)
    except Exception as e:
        err = e

    if sudo:
        with open('/etc/hosts') as f:
            content = f.readlines()
        while entry in content:
            content.remove(entry)
        with open('/etc/hosts', 'w') as f:
            f.writelines(content)

    if err:
        raise err


if __name__ == '__main__':
    main()
