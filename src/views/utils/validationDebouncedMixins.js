import { debounce } from '@utils/giLodash.js'

/**
 Methods to debounce vuelidate validations.

 Ex.

 // -- using v-model

  input.input(
  :class='{error: $v.from.email.$error}'
  type='email'
  v-model='form.email'
  @input='debounceField("email")'
  @blur='updateFiled("email")'
  v-error:email=''
  )

// -- Without v-model
  input.input(
    :class='{error: $v.form.name.$error}'
    name='username'
    @input='e => debounceField("username", e.target.value)'
    @blur='e => updateField("username", e.target.value)'
    v-error:username=''
  )

// -- Debounce both vaidation and $error feedback (cannot use v-model)
input.input(
  :class='{error: $v.form.name.$error}'
  name='username'
  @input='e => debounceValidation("username", e.target.value)'
  @blur='e => updateField("username", e.target.value)'
  v-error:username=''
)
 */

export default {
  methods: {
    debounceField (fieldname, value) {
      this.$v.form[fieldname].$reset()
      this.debounceValidation(fieldName, value)
    },
    updateField (fieldname, value) {
      if (value) {
        this.form[fieldname] = value
      }
      this.$v.form[fieldName].$touch()
    },
    debounceValidation: debounce(function (fieldName, value) {
      this.updateField(fieldName, value)
    })
  }
}