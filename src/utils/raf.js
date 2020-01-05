function fallback (cb) {
  let id = setTimeout(cb, 16.7)
  return id
}

const iRAF = window.requestAnimationFrame || fallback
const iCancelRAF = window.cancelRequestAnimationFrame || window.clearTimeout

export const rAF = (fn) => {
  return iRAF(fn)
}

export const cancelRAF = (id) => {
  iCancelRAF(id)
}
