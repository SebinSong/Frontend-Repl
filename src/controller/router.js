'use strict'

import Vue from 'vue'
import Router from 'vue-router'
import sbp from '~/shared/sbp.js'
import store from '@model/state.js'

import Home from '@pages/Home.vue'
import Join from '@pages/Join.vue'
import L from '@view-utils/translations.js'

Vue.use(Router)

/*
  The following are reusable guard for routes
  the 'guard' defines how the route is blocked and the redirect determines the redirect behavior
  when a route is blocked.
*/
const homeGuard = {
  guard: () => !!store.state.currentGroupId,
  redirect: () => ({ path: '/dashboard' })
}
// const loginGuard = {
//   guard: (to, from) => !store.state.loggedIn,
//   redirect: (to, from) => ({ path: '/', query: { next: to.path } }) 
// }
const inviteGuard = {
  guard: (to) => {
    return !(to.query.groupId && to.query.secret)
  },
  redirect: () => ({ path: '/' })
}

// check if user has a group
// const groupGuard = {
//   guard: (to, from) => !store.state.currentGroupId,
//   redirect: (to, from) => ({ path: '/' })
// }

// TODO: add state machine guard and redirect to ciritical error page if necessary
function createEnterGuards (...guards) {
  return function (to, from, next) {
    for (const current of guards) {
      if (current.guard(to, from)) {
        return next(current.redirect(to, from))
      }
    }

    next()
  }
}

const router = new Router({
  mode: 'history',
  base: '/app',
  scrollBehavior () {
    return { x: 0, y: 0 }
  },
  routes: [
    {
      path: '/',
      component: Home,
      name: 'home',
      meta: { title: L('Group Income') },
      beforeEnter: createEnterGuards(homeGuard)
    },
    {
      path: '/join',
      name: Join.name,
      component: Join,
      meta: { title: L('Join a Group') },
      beforeEnter: createEnterGuards(inviteGuard)
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = `[C] ${to.meta.title || 'Group Income'}`
  next()
})

sbp('sbp/selectors/register', {
  'controller/router': () => router
})

export default router