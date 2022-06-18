import dompurify from 'dompurify'
import Vue from 'vue'
import { cloneDeep } from '~/utils/giLodash.js'

export const defaultConfig = {
  ALLOWED_ATTR: ['class'],
  ALLOWED_TAGS: ['b', 'br', 'em', 'i', 'p', 'small', 'span', 'strong', 'sub', 'sup', 'u'],
  RETURN_DOM_FRAGMENT: true
}

const transform = (el, binding) => {
  const { 
    oldValue = null,
    value,
    arg
  } = binding

  if (oldValue === value) {
    return
  }

  const config = {
    ...defaultConfig,
    ...(arg || {})
  }

  el.textContent = ''
  el.appendChild(dompurify.sanitize(value, config))
}

Vue.directive('safe-html', {
  bind: transform,
  update: transform
})