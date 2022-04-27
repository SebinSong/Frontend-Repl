import Vue from 'vue'
import App from './views/App.vue'
import store from './model/state.js'

// global components
import './views/components/global-components/vStyle.js'

Vue.config.productionTip = false
Vue.config.errorHandler = (err, vm, info) => {
  console.error(`uncaught Vue error in ${info}: `, err)
}

function startApp () {
  if (process.env.NODE_ENV === 'development' || window.Cypress)
    window.sbp = sbp

  new Vue({
    render: h => h(App),
    store
  }).$mount('#app')  
}

startApp()