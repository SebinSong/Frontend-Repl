'use strict'

import sbp from '~/shared/sbp.js'
import Vue from 'vue'
import Vuex, { Store } from 'vuex'

import { THME_LIGHT, THEME_DARK } from '~/utils/themes.js'
import * as EVENTS from '~/utils/events.js'
import { CONTRACTS_MODIFIED } from '@/utils/events'

Vue.use(Vuex)

const contractIsSyncing = {}

let defaultTheme = THEME_LIGHT
if (typeof (window) !== 'undefined' &&
  window?.matchMedia('(prefers-color-scheme: dark)').matches) {
  defaultTheme = THEME_DARK
}

const cloneDeep = obj => JSON.parse(JSON.stringify(obj))

const initialState = {
  currentGroupId: null,
  contracts: {}, // contractIDs => { type: string, HEAD" string }
  pending: [],
  loggedIn: false,
  theme: defaultTheme,
  reducedMotion: false,
  increasedContrast: false,
  fontSize: 16,
  appLogsFilter: process.env.NODE_ENV === 'development'
    ? ['error', 'warn', 'debug', 'log']
    : ['error', 'warn']
}

sbp('okTurtles.events/on', EVENTS.CONTRACT_IS_SYNCING, (contractID, isSyncing) => {
  contractIsSyncing[contractID] = isSyncing
})

sbp('sbp/selectors/register', {
  // 'state/latestContractState': (contractID) => {},
  // 'state/enqueueContractSync': function (contractID) {},
  // 'state/enqueueHandleEvent': function (event) {},
  'state/vuex/state': () => store.state,
  'state/vuex/commit': (id, payload) => store.commit(id, payload),
  'state/vuex/dispatch': (...args) => store.dispatch(...args),
  'state/vuex/getters': () => store.getters
})

//Mutations must be synchronous! Never call these directly, instead use commit()
const mutations = {
  login (state, user) {
    state.loggedIn = user
  },
  logout (state) {
    state.loggedIn = false
    state.currentGroupId = null
  },
  processMessage (state, { message }) {
    sbp('chelonia/in/processMessage', message, state)
  },
  registerContract (state, { contractID, type }) {
    const firstTimeRegistering = !state[contractID]
    const vuexModule = {
      namespaced: true,
      state: {},
      mutations: { processMessage: mutations.processMessage }
    }

    store.registerModule(contractID, vuexModule, { preserveState: !firstTimeRegistering })

    if (firstTimeRegistering)
      state.contracts = { 
        ...state.contracts,
        contractID: { type, HEAD: contractID }
      }

    const index = state.pending.indexOf(contractID)
    index !== -1 && state.pending.splice(index, 1)

    sbp('okTurtles.events/emit', EVENTS.CONTRACTS_MODIFIED, state.contracts)
  },
  setContractHEAD (state, { contractID, HEAD }) {
    const contract = state.contracts[contractID]

    if (!contract) {
      console.error(`This contract ${contractID} doesn't exist anymore. Probably you left the group just now.`)

      return
    }

    state.contracts[contractID].HEAD = HEAD
  },
  removeContract (state, contractID) {
    try {
      store.unregisterModule(contractID)
      Vue.delete(state.contracts, contractID)
    } catch (e) {
      console.warn(`removeContract: ${e.name} attempting to remove ${contractID}: `, e.message)
    }

    sbp('okTurtles.events/emit', EVENTS/CONTRACTS_MODIFIED, state.contracts)
  },
  deleteMessage (state, hash) {
    const mailboxContract = store.getters.mailboxContract
    const index = mailboxContract?.messages.findIndex(msg => msg.hash === hash)

    if (index > -1)
      mailboxContract.messages.splice(index, 1)
  },
  markMessageAsRead (state, hash) {
    const mailboxContract = store.getters.mailboxContract
    const index = mailboxContract?.messages.findIndex(msg => msg.hash === hash)

    if (index > -1)
      mailboxContract.messages[index].read = true
  },
  setCurrentGroupId (state, currentGroupId) {
    state.currentGroupId = currentGroupId
  },
  pending (state, contractID) {
    if (!state.contracts[contractID] &&
      !state.pending.includes(contractID))
      state.pending.push(contractID)
  },
  setTheme (state, color) {
    state.theme = color
  },
  setReducedMotion (state, isChecked) {
    state.reducedMotion = isChecked
  },
  setTemporaryReducedMotion (state) {
    const tempSettings = state.reducedMotion

    state.reducedMotion = true
    setTimeout(() => {
      state.reducedMotion = tempSettings
    })
  },
  setIncreasedContrast (state, isChecked) {
    state.increasedContrast = isChecked
  },
  setFontSize (state, fontSize) {
    state.fontSize = fontSize
  },
  setAppLogsFilters (state, filters) {
    state.appLogsFilter = filters
  }
}

const store = new Vuex.store({
  state: cloneDeep(initialState),
  mutations,
  getters: {},
  actions: {},
  modules: {},
  strict: process.env.VUEX_STRICT ? process.env.VUEX_STRICT === 'true' : true
})