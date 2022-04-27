import Vue from 'vue'

Vue.component('v-style', {
  render: function (h) {
    return h('style', this.$slots.default)
  }
})