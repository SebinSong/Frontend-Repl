export function omit (o, props = []) {
  const x = {}
  for (const k in o) {
    if (!props.includes(k)) {
      x[k] = o[k]
    }
  }

  return x
}

export function cloneDeep (obj) {
  return JSON.parse(JSON.stringify(obj))
}

export function uniq (array) {
  return Array.from(new Set(array))
}

export function union (...arrays) {
  return uniq([].concat.apply([], arrays))
}

export function debounce (func, wait, immediate) {
  let timeout, args, context, timestamp, result
  if (wait == null) wait = 100

  function later () {
    const last = Date.now() - timestamp

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      if (!immediate) {
        result = func.apply(context, args)
        context = args = null
      }
    }
  }

  const debounced = function () {
    context = this
    args = arguments
    timestamp = Date.now()
    const callNow = immediate && !timeout
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }

  debounced.clear = function () {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  debounced.flush = function () {
    if (timeout) {
      result = func.apply(context, args)
      context = args = null
      clearTimeout(timeout)
      timeout = null
    }
  }

  return debounced
}

export function randomBytes (length) {
  return crypto.getRandomValues(new Uint8Array(length))
}

export function randomHexString (length) {
  return Array.from(randomBytes(length), byte => (byte % 16).toString(16)).join('')
}

export function randomIntFromRange (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function randomFromArray (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function isMergeableObject (val) {
  const nonNullObject = val && typeof val === 'object'

  return nonNullObject &&
    Object.prototype.toString.call(val) !== '[object RegExp]'
}

export function merge (obj, src) {
  for (const key in src) {
    const clone = isMergeableObject(src[key]) ? cloneDeep(src[key]) : undefined
    if (clone && isMergeableObject(obj[key])) {
      merge(obj[key], clone)
      continue
    }

    obj[key] = clone || src[key]
  }

  return obj
}

function flatten (arr) {
  let flat = []
  for (let i=0; i<arr.length; i++) {
    const entry = arr[i]
    if (Array.isArray(entry)) {
      flat = flat.concat(entry)
    } else {
      flat.push(entry)
    }
  }

  if (flat.some(item => Array.isArray(item)))
    return flatten(flat)
  else
    return flat
}