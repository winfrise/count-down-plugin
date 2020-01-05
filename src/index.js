import EventEmitter from './utils/event-emitter'
import { rAF, cancelRAF } from './utils/raf'
import { parseTimeData } from './utils/format-time'

export default class CountDown extends EventEmitter {
  constructor ({
    time = 0, // 倒计时时长，单位 ms
    format, // 时间格式 默认： HH:mm:ss
    autoStart = true,
    millisecond = false
  } = {}) {
    super()

    this.time = time
    this.autoStart = autoStart
    this.millisecond = millisecond
    this.format = format

    this.rafId = null

    if (autoStart) {
      this.start()
    }
  }

  start () {
    if (this.counting) {
      return
    }
    this.counting = true

    this.remainTime = this.time
    this.endTime = Date.now() + this.time

    let step = () => {
      this.remainTime = Math.max(this.endTime - Date.now(), 0)
      this.trigger('change', parseTimeData(this.remainTime))

      if (this.remainTime === 0) {
        this.trigger('finish')
      } else {
        this.rafId = rAF(step)
      }
    }
    this.rafId = rAF(step)
  }

  pause () {
    this.counting = false
    cancelRAF(this.rafId)
  }

  reset () {
    this.counting = false
    this.remain = this.time
    if (this.autoStart) {
      this.start()
    }
  }
}