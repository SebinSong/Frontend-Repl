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
