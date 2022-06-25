import Vue from 'vue'
// Register a global custom directive called `v-focus`
Vue.directive('focus', {
  // When the bound element is inserted into the DOM...
  inserted: (el, args) => {
    if (!args || args.value !== false)
      el.focus()
  }
})