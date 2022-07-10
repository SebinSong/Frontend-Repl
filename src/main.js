import sbp from '~/shared/sbp.js'
import '~/shared/domain/okTurtles/data.js'
import '~/shared/domain/okTurtles/eventQueue.js'
import '~/shared/domain/okTurtles/events.js'

import Vue from 'vue'
import App from './views/App.vue'
import store from './model/state.js'
import router from './controller/router.js'

// custom directives
import '@view-utils/vSafeHtml.js' 
import '@view-utils/vFocus.js'
import '@view-utils/vError.js' 
// global components
import './views/components/global-components/vStyle.js'

// directives
import './views/utils/vSafeHtml.js'

Vue.config.productionTip = false
Vue.config.errorHandler = (err, vm, info) => {
  console.error(`uncaught Vue error in ${info}: `, err)
}

function startApp () {
  if (process.env.NODE_ENV === 'development' || window.Cypress)
    window.sbp = sbp

  new Vue({
    render: h => h(App),
    store,
    router
  }).$mount('#app')  
}

startApp()