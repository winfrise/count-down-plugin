class EventEmitter {
  constructor () {
    this.events = {}
  }

  on (type, fn, context) {
    if (!this.events[type]) {
      this.events[type] = []
    }

    this.events[type].push([fn, context])
    return this
  }

  once (type, fn, context) {
    const magic = (...args) => {
      this.off(type, magic)

      fn.apply(context, args)
    }
    magic.fn = fn

    this.on(type, magic)
    return this
  }

  off (type, fn) {
    if (!type && !fn) {
      this.events = {}
      return this
    }

    if (type && !fn) {
      this.events[type] = []
      return this
    }

    let events = this.events[type]
    if (!events) {
      return this
    }

    let count = events.length
    while (count--) {
      if (events[count][0] === fn || (events[count][0] && events[count][0].fn === fn)) {
        events.splice(count, 1)
      }
    }

    return this
  }

  trigger (type, ...args) {
    let events = this.events[type]
    if (!events) {
      return
    }

    let len = events.length
    for (let i = 0; i < len; i++) {
      let [fn, context] = events[i]
      if (fn) {
        return fn.apply(context, args)
      }
    }
  }
}

export default EventEmitter
