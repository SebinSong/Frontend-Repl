'use strict'

import sbp from '~/shared/sbp.js'
import Vue from 'vue'

import '~/shared/domains/chelonia/chelonia.js'
import { merge } from '~/utils/giLodash.js'
import L from '@view-utils/translations.js'

sbp('chelonia/defineContract', {
  name: 'gi.contracts/identity',
  getters: {
    currentIdentityState (state) {
      return state
    },
    loginState (state, getters) {
      return getters.currentIdentityState.loginState
    }
  },
  actions: {
    'gi.contracts/identity': {
      validate: () => true,
      process ({ data }, { state }) {
        const initialState = merge({
          settings: {},
          attributes: {}
        }, data)
        for (const key in initialState) {
          Vue.set(state, key, initialState[key])
        }
      } 
    },
    'gi.contracts/identity/setAttributes': {
      validate: () => true,
      process ({ data }, { state }) {
        for (const key in data) {
          Vue.set(state.attributes, key, data[key])
        }
      }
    },
    'gi.contracts/identity/deleteAttributes': {
      validate: () => true,
      process ({ data }, { state }) {
        for (const attribute of data) {
          Vue.delete(state.attributes, attribute)
        }
      }
    },
    'gi.contracts/identity/updateSettings': {
      validate: () => true,
      process ({ data }, { state }) {
        for (const key in data) {
          Vue.set(state.settings, key, data[key])
        }
      }
    },
    'gi.contracts/identity/setLoginState': {
      validate: () => true,
      process ({ data }, { state }) {
        Vue.set(state, 'loginState', data)
      },
      async sideEffect () {
        try {
          await sbp('gi.actions/identity/updateLoginStateUponLogin')
        } catch (e) {
          sbp('gi.notifications/emit', 'ERROR', {
            message: L("Failed to join groups we're part of on another device. Not catastrophic, but could lead to problems. {errName}: '{errMsg}'", {
              errName: e.name,
              errMsg: e.message || '?'
            })
          })
        }
      }
    }
  }
})