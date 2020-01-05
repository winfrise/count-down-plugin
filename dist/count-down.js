(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.CountDown = factory());
}(this, function () { 'use strict';

  class EventEmitter {
    constructor () {
      this.events = {};
    }

    on (type, fn, context) {
      if (!this.events[type]) {
        this.events[type] = [];
      }

      this.events[type].push([fn, context]);
      return this
    }

    once (type, fn, context) {
      const magic = (...args) => {
        this.off(type, magic);

        fn.apply(context, args);
      };
      magic.fn = fn;

      this.on(type, magic);
      return this
    }

    off (type, fn) {
      if (!type && !fn) {
        this.events = {};
        return this
      }

      if (type && !fn) {
        this.events[type] = [];
        return this
      }

      let events = this.events[type];
      if (!events) {
        return this
      }

      let count = events.length;
      while (count--) {
        if (events[count][0] === fn || (events[count][0] && events[count][0].fn === fn)) {
          events.splice(count, 1);
        }
      }

      return this
    }

    trigger (type, ...args) {
      let events = this.events[type];
      if (!events) {
        return
      }

      let len = events.length;
      for (let i = 0; i < len; i++) {
        let [fn, context] = events[i];
        if (fn) {
          return fn.apply(context, args)
        }
      }
    }
  }

  function fallback (cb) {
    let id = setTimeout(cb, 16.7);
    return id
  }

  const iRAF = window.requestAnimationFrame || fallback;
  const iCancelRAF = window.cancelRequestAnimationFrame || window.clearTimeout;

  const rAF = (fn) => {
    return iRAF(fn)
  };

  const cancelRAF = (id) => {
    iCancelRAF(id);
  };

  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  function parseTimeData (time) {
    var days = Math.floor(time / DAY);
    var hours = Math.floor(time % DAY / HOUR);
    var minutes = Math.floor(time % HOUR / MINUTE);
    var seconds = Math.floor(time % MINUTE / SECOND);
    var milliseconds = Math.floor(time % SECOND);
    return {
      days,
      hours,
      minutes,
      seconds,
      milliseconds
    }
  }

  class CountDown extends EventEmitter {
    constructor ({
      time = 0, // 倒计时时长，单位 ms
      format, // 时间格式 默认： HH:mm:ss
      autoStart = true,
      millisecond = false
    } = {}) {
      super();

      this.time = time;
      this.autoStart = autoStart;
      this.millisecond = millisecond;
      this.format = format;

      this.rafId = null;

      if (autoStart) {
        this.start();
      }
    }

    start () {
      if (this.counting) {
        return
      }
      this.counting = true;

      this.remainTime = this.time;
      this.endTime = Date.now() + this.time;

      let step = () => {
        this.remainTime = Math.max(this.endTime - Date.now(), 0);
        this.trigger('change', parseTimeData(this.remainTime));

        if (this.remainTime === 0) {
          this.trigger('finish');
        } else {
          this.rafId = rAF(step);
        }
      };
      this.rafId = rAF(step);
    }

    pause () {
      this.counting = false;
      cancelRAF(this.rafId);
    }

    reset () {
      this.counting = false;
      this.remain = this.time;
      if (this.autoStart) {
        this.start();
      }
    }
  }

  return CountDown;

}));
