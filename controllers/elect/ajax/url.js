'use strict'
const ELECT = {
  _host: undefined,
  path: {
    bsid: '/edu/lesson/viewLessonArrangeDetail2.aspx?bsid=',
    remove: '/edu/student/elect/removeRecommandLesson.aspx?' +
      'bsid={}&redirectForm=removeLessonFast.aspx',
    stage: '/edu/student/elect/warning.aspx?xklc={0}&lb={1}',
    tab: '/edu/student/elect/',
  },
  list: {
    stage: [
      [1, 1], //一专海选
      [2, 1], //一专抢选
      [3, 1], //一专第三轮
      [1, 3], //暑假小学期海选
      [2, 3], //暑假小学期抢选
      [3, 3], //暑假小学期第3轮
      [4, 2], //二专抢选
      [5, 2], //二专重修
    ],
    tab: {
      speltyRequiredCourse: 'required',
      speltyLimitedCourse: 'limited',
      speltyCommonCourse: 'common',
      outSpeltyEP: 'out',
      freshmanLesson: 'freshman',
      ShortSessionLesson: 'short',
    },
  },

  get host () {
    return ELECT._host
  },

  set host (newHost) {
    ELECT._host = newHost
    for (let k in ELECT.path) {
      if (typeof ELECT[k] !== 'function') {
        ELECT[k] = ELECT._host + ELECT.path[k]
      }
    }
  },

  bsid (bsid) {
    return ELECT._host + ELECT.path.bsid + bsid
  },

  login: undefined,
  logout: undefined,

  remove (bsid) {
    return ELECT._host + ELECT.path.remove.replace('{}', bsid)
  },

  stage (s) {
    return ELECT._host +
      ELECT.path.stage.replace('{0}', s[0]).replace('{1}', s[1])
  },

  tab (typeDesc) {
    return ELECT._host + ELECT.path.tab + typeDesc + '.aspx'
  },

  testLogin: undefined,
}

ELECT.host = 'http://electsys.sjtu.edu.cn'


const ELECTQ = {
  host: 'http://electsysq.sjtu.edu.cn',
  report: 'http://electsysq.sjtu.edu.cn/ReportServer/Pages/ReportViewer.aspx?' +
    '%2fExamArrange%2fLessonArrangeForOthers&rs:Command=Render'
}
