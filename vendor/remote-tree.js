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
      return this.parent.TypeDescPath.concat(this.typeDesc)
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
          .then(() => this._preload()).then(() => {
            this.status = 'preloaded'
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
    if (this.loaded === undefined || this.status === 'failed') {
      if (this.status !== 'loaded') {
        this.status = 'loading'
        this.loaded = this.parent.load().then(() => this._load()).then(() => {
          this.status = 'loaded'
          return this
        })
        this.loaded.catch(e => {
          this.status = 'failed'
        })
      } else {
        return Promise.resolve(this)
      }
    }
    return this.loaded
  }

  type (typeDescPath, wantsPredict) {
    if (this.types === undefined) {
      throw new TypeError('no type available')
    }

    let nextType = typeDescPath[0]
    let nextTypeDescPath = typeDescPath.slice(1)
    if (!(nextType in this.types)) {
      return Promise.reject(new TypeError(`invalid type ${typeDescPath}`))
    }

    let nextTab = this._tabCache[nextType]
    let p
    if (wantsPredict) {
      p = nextTab.preload()
    } else {
      p = nextTab.load()
    }
    if (nextTypeDescPath.length) {
      p = p.then(tab => tab.type(nextTypeDescPath, wantsPredict))
    }
    return p
  }

  cache (typeDesc = []) {
    let curTab = this
    for (let i = 0; i < typeDesc.length; i++) {
      if (typeDesc[i] in curTab._tabCache) {
        curTab = curTab._tabCache[typeDesc[i]]
      } else {
        return {}
      }
    }
    return curTab
  }
}
