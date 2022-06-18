import dompurify from 'dompurify'
import Vue from 'vue'
import { cloneDeep } from '~/utils/giLodash.js'

export const defaultConfig = {
  ALLOWED_ATTR: ['class'],
  ALLOWED_TAGS: ['b', 'br', 'em', 'i', 'p', 'small', 'span', 'strong', 'sub', 'sup', 'u'],
  RETURN_DOM_FRAGMENT: true
}

const transform = (el, binding) => {
  if (binding.oldValue !== binding.value) {
    let config = defaultConfig
    if (binding.arg === 'a') {
      config = cloneDeep(config)
      config.ALLOWED_ATTR.push('href', 'target')
      config.ALLOWED_TAGS.push('a')
    }

    el.textContent = ''
    el.appendChild(dompurify.sanitize(binding.value, config))
  }
}

Vue.directive('safe-html', {
  bind: transform,
  update: transform
})