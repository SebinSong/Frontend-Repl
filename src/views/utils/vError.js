import Vue from 'vue'

/**
 * Register a global custom directive called `v-error`
 * to autoamtically display vuelidate error messages
 * 
 * Config:
 *  validations: {
 *    form: {
 *      incomeAmount: {
 *        [L('field is required')]: required,
 *        [L('cannot be negative')]: v => v >= 0,
 *        [L('cannot have more than 2 decimals')]: decimals(2)
 *      },
 *    }
 *  }
 * 
 *  Markup:
 *    i18n.label(tag='label') Enter your income:
 *    input.input.is-primary(
 *      type='text'
 *      v-model='$v.form.incomeAmount.$model'
 *      :class='{ error: $v.form.incomeAmount.$error }'
 *      v-error:incomeAmount='{ tag: "p", attrs: { "data-test": "badIncome" } }'
 *    )
 *
 */

Vue.directive('error', {
  inserted (el, binding, vnode) {
    // make sure the v-error argument and the corresponding vuelidate field is there.
    if (!binding.arg) {
      throw new Error(`v-error: missing argument on ${el.outerHTML}`)
    }

    if (!vnode.context.$v.form[binding.arg]) {
      throw new Error(`v-error: vuelidate doesn't have validation for ${binding.arg}`)
    }

    const { attrs = {} , tag = 'span' } = binding.value || {}

    // create DOM element for the error-message and hide it as the initial setup.
    const pErr = document.createElement(tag || 'span')
    for (const attr in attrs) {
      pErr.setAttribute(attr, attrs[attr])
    }
    pErr.classList.add('error', 'is-hidden')
    el.insertAdjacentElement('afterend', pErr)
  },
  update (el, binding, vnode) {
    const { arg } = binding
    // vuelidate field this particular 'v-error'directive is targetting. 
    const targetField = vnode.context.$v.form[arg]
    const elMsg = el.nextElementSibling

    if (targetField.$error) {
      for (const errMsg in targetField.$params) {
        if (!targetField[errMsg]) {
          elMsg.innerText = errMsg
          break
        }
      }
      elMsg.classlist.remove('is-hidden') // reveal the message
    } else if (!elMsg.classList.contain('is-hidden')) {
      elMsg.classList.add('is-hidden')
    }
  },
  unbind (el) {
    el.nextElementSibling.remove()
  }
})