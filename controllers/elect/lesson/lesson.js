'use strict'
class Lesson {
  /**
   * Constructe from a DB record.
   * @constructs Lesson
   * @param {Object} data - DB record which contains lesson info
   */
  constructor (data = {}) {
    if (data.fullref === undefined) {
      throw new TypeError('fullref required')
    }

    if (data.fullref in this.constructor.cache) {
      return this.constructor.cache[data.fullref]
    }
    this.constructor.cache[data.fullref] = this

    for (let i = 0, k = this.constructor.PROPERTIES.length; i < k; i++) {
      let property = this.constructor.PROPERTIES[i]
      // db will return null for empty values
      this[property] = data[property] || undefined
    }
  }

  get absSemester () {
    return this.constructor.splitFullref(this.fullref)[1]
  }

  get ref () {
    return this.constructor.splitFullref(this.fullref)[2]
  }

  static from (token, _data) {
    let data
    let fullref
    let p
    switch (typeof token) {
      case 'number':
        let bsid = token
        if (!Number.isInteger(bsid)) {
          throw new TypeError('bsid must be integer')
        }
        return new Promise(resolve => {
          db_lesson.transaction('lesson').objectStore('lesson')
            .index('bsid').get(bsid).onsuccess = event => {
              if (event.target.result) {
                // bsid found in db
                return resolve(new Lesson(event.target.result))
              } else {
                // remote fetch
                if (!(bsid in this.queueBsid)) {
                  this.queueBsid[bsid] = this.bsid2fullref(bsid)
                    .then(fullref => {
                      delete this.queueBsid[bsid]
                      return this.from(fullref, {bsid: bsid})
                    }, e => {
                      this.queueBsid = {}
                      return loggerError('lesson', 'Error when fetch ' + bsid,
                        true)(e)
                    })
                }
                return resolve(this.queueBsid[bsid])
              }
            }
        })
      case 'object':
        data = token
        fullref = data.fullref
        if (typeof fullref !== 'string') {
          throw new TypeError('fullref required')
        }
        return Lesson.from(data.fullref, data)
      case 'string':
        fullref = token
        data = _data
        let p
        if (fullref in this.cache) {
          p = Promise.resolve(this.cache[fullref])
        } else {
          p = new Promise((resolve, reject) => {
            db_lesson.transaction('lesson').objectStore('lesson')
              .get(fullref).onsuccess = event => {
                if (event.target.result) {
                  // fullref found in db
                  return resolve(new Lesson(event.target.result))
                } else if (data) {
                  // create new
                  return resolve(new Lesson({fullref: fullref}))
                } else {
                  return reject(new RangeError(`fullref ${fullref} unknown`))
                }
              }
          })
        }
        if (data) {
          p = p.then(l => {
            l.update(data)
            return l
          })
        }
        return p
      case 'undefined':
        throw new TypeError('1 argument required, but only 0 present.')
      default:
        throw new TypeError('data type invalid')
    }
  }

  _parse () {
    try {
      this.schedule = this.constructor.scheduleParser.parse(this.scheduleDesc)
    } catch (e) {
      console.warn(this.scheduleDesc.replace(/\r/g, '\\r'))
      throw e
    }
  }

  update (data, noStore) {
    let isUpdated = false
    if (typeof data === 'object') {
      /* if (data.fullref !== undefined && data.fullref !== this.fullref) {
        throw new TypeError(
         `fullref mismatched, except '${this.fullref}', got '${data.fullref}'`)
      } */
      // detect update event
      for (let i = 0, k = this.constructor.PROPERTIES.length; i < k; i++) {
        let property = this.constructor.PROPERTIES[i]
        if (this[property] === undefined && data[property]) {
          isUpdated = true
          this[property] = data[property]
        } else if (data[property] !== undefined &&
            this[property] !== data[property]) {
          console.warn(
            'property %s:', property, this[property],
            'confilcts with', data[property])
        }
      }
    }

    // try to parse schedule
    if (!this.schedule && this.scheduleDesc) {
      this._parse()
      isUpdated = true
    }

    if (isUpdated && !noStore) {
      // updated, save lesson info
      return new Promise(resolve => {
        db_lesson.transaction(['lesson'], 'readwrite').objectStore('lesson')
          .put(this).onsuccess = event => {
            loggerInit('lesson', this.fullref + ' stored')
            return resolve()
          }
      })
    } else {
      // not updated
      return Promise.resolve()
    }
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
    let i = this.schedule.length
    let k = other.schedule.length
    while (i--) {
      let [this_week_skip, this_week_start, this_week_end,
        this_dow, this_lesson_start, this_lesson_end] = this.schedule[i]
      let j = k
      while (j--) {
        let [other_week_skip, other_week_start, other_week_end,
          other_dow, other_lesson_start, other_lesson_end] = other.schedule[j]
        if (this_dow != other_dow) {
          continue
        }
        if (this_lesson_end <= other_lesson_start ||
            other_lesson_end <= this_lesson_start) {
          continue
        }
        if ((this_week_skip == 1 && other_week_skip == 2) ||
            (this_week_skip == 2 && other_week_skip == 1)) {
          continue
        }
        if (this_week_end <= other_week_start ||
            other_week_end <= this_week_start) {
          continue
        }
        return true
      }
    }
    return false
  }

  remove () {
    if (!this.hasOwnProperty('bsid')) {
      throw new TypeError('bsid unknown')
    }
    return refetch(ELECT.remove(bsid), undefined, undefined, () => false)
      .then(() => window.dispatchEvent(new Event('login')))
  }

  /* helpers */
  static bsid2fullref (bsid) {
    return bsidQueue.push(() => refetch(ELECT.bsid(bsid))
      .then(responseText).then(data => {
        let match = data.match(/课号.*\r?\n(.*)/)
        if (!match) {
          throw new TypeError('no fullref in response')
        }
        return match[1].trim()
      }))
  }

  static splitFullref (fullref) {
    let result = fullref.match(/^(\d{3})-\((.{11})\)(.{5})\((.{3})\)$/)
    result.shift()
    // 001 2015-2016-1 XX101 ...
    return result
  }

  static selectAll (absSemester) {
    return new Promise(resolve => {
      db_lesson.transaction('lesson').objectStore('lesson')
        .getAll().onsuccess = event => {
          let result = {}
          let l_record = event.target.result
          let i = l_record.length
          while (i--) {
            let record = l_record[i]
            let fullref_split = Lesson.converters.splitFullref(record.fullref)

            let obj_semester = result[fullref_split[1]]
            if (!obj_semester) {
              result[fullref_split[1]] = {}
              obj_semester = result[fullref_split[1]]
            }
            let obj_ref = obj_semester[fullref_split[2]]
            if (!obj_ref) {
              obj_semester[fullref_split[2]] = {}
              obj_ref = obj_semester[fullref_split[2]]
            }
            obj_ref[fullref_split[0]] = record
          }
          return resolve(result)
        }
    })
  }
}

Lesson.SCHEDULE_RULE = `
Schedule
  = '行课安排为第' _ l_block:Block+
    {
      return Array.prototype.concat.apply([], l_block)
    }

Block
  = str_week_skip:$( '单周'  _? / '双周'  _? / '' ) l_entry:Entry+
    {
      let week_skip
      switch (str_week_skip.substr(0, 2)) {
        case '':
          week_skip = 0
          break
        case '单周':
          week_skip = 1
          break
        case '双周':
          week_skip = 2
          break
      }
      let l_arrange = []
      for (let i = 0; i < l_entry.length; i++) {
        let entry = l_entry[i]
        for (let j = 0; j < entry.length; j++) {
          // fixWeekSkip
          let [week_start, week_end, dow, lesson_start, lesson_end] = entry[j]
          week_start--
          // single week
          if (week_skip == 1) {
            if (week_start & 1) {
              week_start++
            }
            if (!(week_end & 1)) {
              week_end--
            }
          }
          // double week
          else if (week_skip == 2) {
            if (!(week_start & 1)) {
              week_start++
            }
            if (week_end & 1) {
              week_end--
            }
          }
          l_arrange.push([week_skip, week_start, week_end, dow, lesson_start, lesson_end])
        }
      }
      return l_arrange
    }

Entry
  = '星期' str_dow:[一二三四五六日] ' '+ '第' raw_lesson_start:Integer '节--第' lesson_end:Integer '节' _
    l_teacher:Teacher+
    {
      let dow = ' 一二三四五六日'.indexOf(str_dow)
      let lesson_start = raw_lesson_start - 1
      return l_teacher.map(([raw_week_start, raw_week_end]) =>
        [raw_week_start, raw_week_end, dow, lesson_start, lesson_end])
    }

Teacher
  = classroom:$[^.(\\r\\n]* '.'? '(' raw_week_start:Integer '-' raw_week_end:Integer '周)'
    ' '? '.'? teacher:$[^\\r\\n]* _
    {
      return [raw_week_start, raw_week_end, classroom, teacher]
    }

Integer
  = [0-9]+
    {
      return Number(text())
    }

_
  = $[^\\r\\n]* '\\r'? '\\n'
`
Lesson.STRUCT = {
  yxmc: 'academy',
  xm: 'teacher',
  zcmc: 'title',
  kcmc: 'name',
  kcbm: 'fullref',
  xqxs: 'hour',
  xqxf: 'credit',
  sjms: 'scheduleDesc',
  bz: 'note',
  nj: 'grade',
  xn: 'year',
  xq: 'semester',
  // yqdrs: 'choosen',
  jsdm: 'classroom',
  jxlmc: 'building',
}
Lesson.PROPERTIES = Object.values(Lesson.STRUCT)
Lesson.PROPERTIES.unshift('bsid')
Lesson.PROPERTIES.push('schedule')
Lesson.cache = {}
Lesson.queueBsid = {}
