'use strict'
/*
const SCHEDULE_RULE = `
Schedule
  = '行课安排为第' _ block:Block+
    { return Array.prototype.concat.apply([], block) }

Block
  = week_skip:$( '单周'  _? / '双周'  _? / '' ) entry:Entry+
    {
      week_skip = ['', '单周', '双周'].indexOf(week_skip.substr(0, 2))
      entry = Array.prototype.concat.apply([], entry)
      entry.forEach(e => e.unshift(week_skip))
      return entry }

Entry
  = '星期' dow:[一二三四五六日] '  第' lesson_start:Integer '节--第' lesson_end:Integer '节' _ teacher:Teacher+
    {
      dow = '一二三四五六日'.indexOf(dow)
      lesson_start--
      return teacher.map(([week_start, week_end, classroom, teacher]) =>
        [week_start, week_end, dow, lesson_start, lesson_end]) }

Teacher
  = classroom:$[^.(\\r\\n]* '.'? '(' week_start:Integer '-' week_end:Integer '周)' ' '? '.'? teacher:$[^\\r\\n]* _
    {
      week_start--
      return [week_start, week_end, classroom, teacher] }

Integer
  = [0-9]+
    { return Number(text()) }

_
  = $[^\\r\\n]* '\\r'? '\\n'
`
*/
const STRUCT_LESSON = [
  ['academy', 'yxmc', String],
  ['teacher', 'xm', String],
  ['title', 'zcmc', String],
  ['name', 'kcmc', String],
  ['fullref', 'kcbm', String],
  ['hour', 'xqxs', Number],
  ['credit', 'xqxf', Number],
  ['scheduleDesc', 'sjms', String],
  ['note', 'bz', String],
  ['grade', 'nj', Number],
  ['year', 'xn', String],
  ['semester', 'xq', Number],
  // ['choosen', 'yqdrs', Number],
  ['classroom', 'jsdm', String],
  ['building', 'jxlmc', String],
]


class Lesson {
  constructor (data = {}) {
    this.PROPERTIES.forEach(property => {
      this[property] = data[property]
    })
  }

  static from (data) {
    let fullref
    switch (typeof data) {
      case 'number':
        let bsid = data
        if (!Number.isInteger(bsid)) {
          throw new TypeError('bsid must be integer')
        }
        return new Promise(resolve => {
          db_lesson.transaction('lesson').objectStore('lesson')
            .index('bsid').get(bsid).onsuccess = event => resolve(
              event.target.result ? new Lesson(event.target.result) :
                fetchBsid(bsid).then(fullref => Lesson.from(fullref)))
        })
      case 'string':
        fullref = data
        // Lesson when found, otherwise undefined
        return new Promise((resolve, reject) => {
          db_lesson.transaction('lesson').objectStore('lesson')
            .get(fullref).onsuccess = event => event.target.result ?
             resolve(new Lesson(event.target.result)) :
             reject(new RangeError(`fullref ${fullref} unknown`))
        })
      case 'object':
        fullref = data.fullref
        if (!fullref) {
          throw new TypeError('fullref required')
        }
        return Lesson.from(fullref).catch(e => {
          if (e instanceof RangeError) {
            return new Lesson
          } else {
            throw e
          }
        }).then(lesson => {
          lesson.update(data)
          return lesson
        })
      case 'undefined':
        throw new TypeError('1 argument required, but only 0 present.')
      default:
        throw new TypeError('data type invaild')
    }
  }

  _parse () {
    try {
      this.schedule = this.scheduleParser.parse(this.scheduleDesc)
    } catch (e) {
      console.warn(this.scheduleDesc.replace(/\r/g, '\\r'))
      throw e
    }
  }

  update (data, noUpdate) {
    if (typeof data !== 'object') {
      throw new TypeError('data must be plain object')
    }
    /* if (data.fullref !== this.fullref) {
      throw new TypeError(
       `fullref mismatched, except '${this.fullref}', got '${data.fullref}'`)
    } */

    // detect update event
    let isUpdated = false
    this.PROPERTIES.forEach(k => {
      if (this[k] === undefined && data[k]) {
        isUpdated = true
        this[k] = data[k]
      } else if (data[k] !== undefined && this[k] !== data[k]) {
        console.warn('property %s:', k, this[k], 'confilcts with', data[k])
      }
    })
    // try to parse schedule
    if (!this.schedule && this.scheduleDesc &&
        this.constructor.prototype.scheduleParser) {
      this._parse()
      isUpdated = true
    }

    if (isUpdated && !noUpdate) {
      // updated, save lesson info
      return new Promise(resolve => {
        db_lesson.transaction(['lesson'], 'readwrite').objectStore('lesson')
          .add(this).onsuccess = event => {
            loggerInit('lesson', [this.fullref, 'stored'])
            return resolve()
          }
      })
    } else {
      // not updated
      return Promise.resolve()
    }
  }

  static _isEntryIntersect (
      [this_week_skip, this_week_start, this_week_end,
        this_dow, this_lesson_start, this_lesson_end],
      [other_week_skip, other_week_start, other_week_end,
        other_dow, other_lesson_start, other_lesson_end]) {
    if (this_dow != other_dow) {
      return false
    }
    if (this_lesson_end <= other_lesson_start ||
        other_lesson_end <= this_lesson_start) {
      return false
    }
    if ((this_week_skip == 1 && other_week_skip == 2) ||
        (this_week_skip == 2 && other_week_skip == 1)) {
      return false
    }
    if (this_week_end <= other_week_start || other_week_end <= this_week_start) {
      return false
    }
    return true
  }

  conflictsWith (other) {
    if (!(other instanceof this.constructor)) {
      throw new TypeError('other must be instance of Lesson')
    }
    if (!this.schedule) {
      throw new TypeError('this.schedule missing')
    }
    if (!other.schedule) {
      throw new TypeError('other.schedule missing')
    }
    return this.schedule.some(this_entry => other.schedule.some(other_entry =>
      this.constructor._isEntryIntersect(this_entry, other_entry)))
  }

  remove () {
    if (!this.hasOwnProperty('bsid')) {
      throw new TypeError('bsid unknown')
    }
    return fetch(ELECT.remove(bsid))
  }
}

Lesson.prototype.PROPERTIES = STRUCT_LESSON.map(cell => cell[0])
Lesson.prototype.PROPERTIES.push('schedule')


function fetchBsid (bsid) {
  return bsidQueue.push(() => refetch(ELECT.bsid(bsid))
    .then(response => response.text()).then(data => {
      let match = data.match(/课号.*\r?\n(.*)/)
      if (!match) {
        throw new TypeError('no fullref in response')
      }
      return match[1].trim()
    }))
}
