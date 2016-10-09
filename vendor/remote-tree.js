class TreeNode {
  constructor (parent, typeDesc) {
    this.parent = parent
    this.typeDesc = typeDesc

    //               pending --> preloading --> preloaded
    //                  |---------------------------|
    //  failed <--> loading --> loaded
    this.status = 'pending'
    this.preloaded = undefined
    this.loaded = undefined
    this.clear()
  }

  get typeDescPath () {
    if (this.parent) {
      return this.parent.typeDescPath.concat(this.typeDesc)
    } else {
      return []
    }
  }

  clear () {
    /** @type {Object.<string, Object>} */
    this.types = undefined
    let tabGenerator =
      nextType => new (this._nextTabClass(nextType))(this, nextType)
    /** @type {Object.<string, Tab>} */
    this._tabCache = new Proxy({}, {
      get (target, key, receiver) {
        if (!(key in target)) {
          target[key] = tabGenerator(key)
        }
        return Reflect.get(target, key, receiver)
      },
    })
  }

  preload () {
    if (this.preloaded === undefined) {
      if (this.status === 'pending') {
        this.status = 'preloading'
        this.preloaded = Promise.resolve()
          .then(() => this._preload()).then(cacheMatched => {
            if (cacheMatched === false) {
              this.status = 'mismatched'
            } else {
              this.status = 'preloaded'
            }
            return this
          })
        this.preloaded.catch(e => {
          this.status = 'pending'
        })
      } else {
        return Promise.resolve(this)
      }
    }
    return this.preloaded
  }

  load (reload) {
    if (!this.parent || this.status === 'loading' ||
        this.status === 'loaded' && !reload) {
      return this.loaded || Promise.resolve(this)
    }
    if (this.status !== 'loaded' || reload) {
      this.status = 'loading'
      this.loaded = this.parent.load(reload).then(() => this._load())
      .then(() => {
        this.status = 'loaded'
        return this
      })
      this.loaded.catch(e => {
        this.status = 'failed'
      })
    }
    return this.loaded
  }

  type (typeDescPath, wantsPredict) {
    let nextType
    let nextTypeDescPath
    if (Array.isArray(typeDescPath)) {
      nextType = typeDescPath[0]
      nextTypeDescPath = typeDescPath.slice(1)
    } else {
      nextType = typeDescPath
    }
    if (!this.hasType(nextType)) {
      return Promise.reject(new TypeError(`invalid type ${typeDescPath}`))
    }

    let nextTab = this._tabCache[nextType]
    let p
    if (wantsPredict) {
      p = nextTab.preload()
    } else {
      p = nextTab.load()
    }
    if (nextTypeDescPath && nextTypeDescPath.length) {
      p = p.then(tab => tab.type(nextTypeDescPath, wantsPredict))
    }
    return p
  }

  /**
   * get cached node
   * @param {(Array.<string>|string)} [typeDescPath]
   * @returns {?TreeNode}
   */
  cache (typeDescPath = []) {
    let _typeDescPath = typeDescPath
    if (typeof _typeDescPath === 'string') {
      _typeDescPath = [_typeDescPath]
    }
    let curTab = this
    for (let i = 0, k = _typeDescPath.length; i < k; i++) {
      if (_typeDescPath[i] in curTab._tabCache) {
        curTab = curTab._tabCache[_typeDescPath[i]]
      } else {
        return
      }
    }
    return curTab
  }

  cacheStauts (typeDescPath) {
    return this.cache(typeDescPath).status || 'pending'
  }

  hasType (nextType) {
    if (!this.types) {
      throw new TypeError('no type available')
    }
    return nextType in this.types
  }
}
