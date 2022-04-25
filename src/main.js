import Vue from 'vue'
import App from './views/App.vue'

Vue.config.productionTip = false
Vue.config.errorHandler = (err, vm, info) => {
  console.error(`uncaught Vue error in ${info}: `, err)
}

new Vue({
  render: h => h(App),
}).$mount('#app')
