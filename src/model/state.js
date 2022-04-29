'use strict'

import sbp from '~/shared/sbp.js'
import Vue from 'vue'
import Vuex from 'vuex'

import * as _ from '~/utils/giLodash.js'
import { THEME_LIGHT, THEME_DARK } from '~/utils/themes.js'
import * as EVENTS from '~/utils/events.js'
import { CONTRACTS_MODIFIED } from '@/utils/events'
import Colors from './colors.js'

Vue.use(Vuex)

const contractIsSyncing = {}

let defaultTheme = THEME_LIGHT
if (typeof (window) !== 'undefined' &&
  window?.matchMedia('(prefers-color-scheme: dark)').matches) {
  defaultTheme = THEME_DARK
}

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

const getters = {
  // !!  IMPORTANT  !!
  //
  // For getters that get data from only contract state, write them
  // under the 'getters' key of the object passed to DefineContract.
  // See for example: frontend/model/contracts/group.js
  //
  // Fot convenience, we've defined the same getter, `currentGroupState`,
  // twice, so that we can reuse the same getter definitions both here with Vuex,
  // and inside of the contracts (e.g. in group.js)
  //
  // The one here is based off the value of `state.currentGroupId` - a user
  // preference that does not exist in the group contract state.
  //
  // The getters in DefineContract are designed to be compatible with Vuex!
  // when they're used in the context of DefineContract, their 'state' always refers
  // to the state of the contract whose messages are being processed, regardless 
  // of what group we're in. That is why the definition of 'currentGroupState' in
  // group.js simply returns the state.
  //
  // Since the getter functions are compatible between Vuex and our contract chain
  // library, we can simply import them here, while excluding the getter for
  // `currentGroupState`, and redefining it here based on the Vuex rootState.

  // ..._.omit(sbp('gi.contracts/group/getters'), ['currentGroupState']),
  //..._.omit(sbp('gi.contracts/chatroom/getters'), ['currentChatRoomState']),

  currentGroupState (state) {
    return state[state.currentGroupId] || {}
  },

  currentChatRoomState (state, getters) {
    return state[getters.currentChatRoomId] || {}
  },

  mailboxContract (state, getters) {
    const contract = getters.ourUserIdentityContract

    return (contract.attributes && state[contract.attributes.mailbox])
  },

  mailboxMessages (state, getters) {
    const mailboxContract = getters.mailboxContract
    return (mailboxContract && mailboxContract.messages) || []
  },

  unreadMessageCount (state, getters) {
    return getters.mailboxMessages.filter(msg => !msg.read).length
  },

  ourUsername (state) {
    return state.loggedIn && state.loggedIn.username
  },

  ourGrupProfile (state, getters) {
    return getters.groupProfile(getters.ourUsername)
  },

  ourUserDisplayName (state, getters) {
    const userContract = getters.ourUserIdentityContract || {}

    return (userContract.attributes &&
      userContract.attributes.displayName)
  },

  ourIdentityContractId (state) {
    return state.loggedIn && state.loggedIn.identityContractID
  },

  ourUserIdentityContract (state) {
    return (state.loggedIn && state[state.loggedIn.identityContractID])
  },

  ourContributionSummary (state, getters) {
    const {
      groupProfiles,
      ourUsername,
      ourGroupProfile
    } = getters

    if (!ourGroupProfile || !ourGroupProfile.incomeDetailsType) {
      return {}
    }

    const doWeNeedIncome = ourGroupProfile.incomeDetailsType === 'incomeAmount'
    const distribution = getters.groupIncomeDistribution

    const nonMonetaryContributionsOf = (username) => groupProfiles[username]?.nonMonetaryContributions || []
    const getDisplayName = (username) => getters.globalProfile(username).displayName || username

    return {
      givingMonetary: (() => {
        if (doWeNeedIncome) { return null }
        const who = []
        const total = distribution
          .filter(p => p.from === ourUsername)
          .reduce((acc, payment) => {
            who.push(getDisplayName(payment.to))
            return acc + payment.amount
          }, 0)

        return { who, total, pledged: ourGroupProfile.pledgeAmount }
      })(),
      receivingMonetary: (() => {
        if (!doWeNeedIncome) { return null }
        const needed = getters.groupSettings.mincomeAmount - ourGroupProfile.incomeAmount
        const who = []
        const total = distribution
          .filter(p => p.to === ourUsername)
          .reduce((acc, payment) => {
            who.push(getDisplayName(payment.from))
            return acc + payment.amount
          }, 0)

        return { who, total, needed }
      })(),
      receivingNonMonetary: (() => {
        const listWho = Object.keys(groupProfiles)
          .filter(username => username !== ourUsername && nonMonetaryContributionsOf(username).length > 0)
        const listWhat = listWho.reduce((contr, username) => {
          const displayName = getDisplayName(username)
          const userContributions = nonMonetaryContributionsOf(username)

          userContributions.forEach((what) => {
            const contributionIndex = contr.findIndex(c => c.what === what)
            contributionIndex >= 0
              ? contr[contributionIndex].who.push(displayName)
              : contr.push({ who: [displayName], what })
          })
          return contr
        }, [])

        return listWho.length > 0 ? { what: listWhat, who: listWho } : null
      })(),
      givingNonMonetary: (() => {
        const contributions = ourGroupProfile.nonMonetaryContributions

        return contributions.length > 0 ? contributions : null
      })()
    } 
  },

  userDisplayName (state, getters) {
    return (username) => {
      const profile = getters.globalProfile(username) || {}
      return profile.displayName || username
    }
  },
  currentPaymentPeriod (state, getters) {
    return getters.periodStampGivenDate(new Date())
  },
  thisPeriodPaymentInfo (state, getters) {
    return getters.groupPeriodPayments[getters.currentPaymentPeriod]
  },
  latePayments (state, getters) {
    const periodPayments = getters.groupPeriodPayments
    if (Object.keys(periodPayments).length === 0) return
    const ourUsername = getters.ourUsername
    const pPeriod = getters.periodBeforePeriod(getters.currentPaymentPeriod)
    const pPayments = periodPayments[pPeriod]
    if (pPayments) {
      return pPayments.lastAdjustedDistribution.filter(todo => todo.from === ourUsername)
    }
  },
  // used with graphs like those in the dashboard and in the income details modal
  // groupIncomeDistribution (state, getters) {
  //   return unadjustedDistribution({
  //     haveNeeds: getters.haveNeedsForThisPeriod(getters.currentPaymentPeriod),
  //     minimize: false
  //   })
  // },
  // adjusted version of groupIncomeDistribution, used by the payments system
  // groupIncomeAdjustedDistribution (state, getters) {
  //   const paymentInfo = getters.thisPeriodPaymentInfo
  //   if (paymentInfo && paymentInfo.lastAdjustedDistribution) {
  //     return paymentInfo.lastAdjustedDistribution
  //   } else {
  //     const period = getters.currentPaymentPeriod
  //     return adjustedDistribution({
  //       distribution: unadjustedDistribution({
  //         haveNeeds: getters.haveNeedsForThisPeriod(period),
  //         minimize: getters.groupSettings.minimizeDistribution
  //       }),
  //       payments: getters.paymentsForPeriod(period),
  //       dueOn: getters.dueDateForPeriod(period)
  //     })
  //   }
  // },
  ourPaymentsSentInPeriod (state, getters) {
    return (period) => {
      const periodPayments = getters.groupPeriodPayments
      if (Object.keys(periodPayments).length === 0) return
      const payments = []
      const thisPeriodPayments = periodPayments[period]
      const paymentsFrom = thisPeriodPayments && thisPeriodPayments.paymentsFrom
      if (paymentsFrom) {
        const ourUsername = getters.ourUsername
        const allPayments = getters.currentGroupState.payments
        for (const toUser in paymentsFrom[ourUsername]) {
          for (const paymentHash of paymentsFrom[ourUsername][toUser]) {
            const { data, meta } = allPayments[paymentHash]
            payments.push({ hash: paymentHash, data, meta, amount: data.amount, username: toUser })
          }
        }
      }
      return payments
    }
  },
  ourPaymentsReceivedInPeriod (state, getters) {
    return (period) => {
      const periodPayments = getters.groupPeriodPayments
      if (Object.keys(periodPayments).length === 0) return
      const payments = []
      const thisPeriodPayments = periodPayments[period]
      const paymentsFrom = thisPeriodPayments && thisPeriodPayments.paymentsFrom
      if (paymentsFrom) {
        const ourUsername = getters.ourUsername
        const allPayments = getters.currentGroupState.payments
        for (const fromUser in paymentsFrom) {
          for (const toUser in paymentsFrom[fromUser]) {
            if (toUser === ourUsername) {
              for (const paymentHash of paymentsFrom[fromUser][toUser]) {
                const { data, meta } = allPayments[paymentHash]
                payments.push({ hash: paymentHash, data, meta, amount: data.amount, username: toUser })
              }
            }
          }
        }
      }
      return payments
    }
  },
  ourPayments (state, getters) {
    const periodPayments = getters.groupPeriodPayments
    if (Object.keys(periodPayments).length === 0) return
    const ourUsername = getters.ourUsername
    const cPeriod = getters.currentPaymentPeriod
    const pPeriod = getters.periodBeforePeriod(cPeriod)
    const currentSent = getters.ourPaymentsSentInPeriod(cPeriod)
    const previousSent = getters.ourPaymentsSentInPeriod(pPeriod)
    const currentReceived = getters.ourPaymentsReceivedInPeriod(cPeriod)
    const previousReceived = getters.ourPaymentsReceivedInPeriod(pPeriod)

    // TODO: take into account pending payments that have been sent but not yet completed
    const todo = () => {
      return getters.groupIncomeAdjustedDistribution.filter(p => p.from === ourUsername)
    }

    return {
      sent: [...currentSent, ...previousSent],
      received: [...currentReceived, ...previousReceived],
      todo: todo()
    }
  },
  ourPaymentsSummary (state, getters) {
    const isNeeder = getters.ourGroupProfile.incomeDetailsType === 'incomeAmount'
    const ourUsername = getters.ourUsername
    const isOurPayment = (payment) => {
      return isNeeder ? payment.to === ourUsername : payment.from === ourUsername
    }
    const cPeriod = getters.currentPaymentPeriod
    const ourUnadjustedPayments = getters.groupIncomeDistribution.filter(isOurPayment)
    const ourAdjustedPayments = getters.groupIncomeAdjustedDistribution.filter(isOurPayment)

    const receivedOrSent = isNeeder
      ? getters.ourPaymentsReceivedInPeriod(cPeriod)
      : getters.ourPaymentsSentInPeriod(cPeriod)
    const paymentsTotal = ourAdjustedPayments.length + receivedOrSent.length
    const nonLateAdjusted = ourAdjustedPayments.filter((p) => !p.isLate)
    const paymentsDone = paymentsTotal - nonLateAdjusted.length
    const hasPartials = ourAdjustedPayments.some(p => p.partial)
    const amountTotal = ourUnadjustedPayments.reduce((acc, payment) => acc + payment.amount, 0)
    const amountDone = receivedOrSent.reduce((acc, payment) => acc + payment.amount, 0)
    return {
      paymentsDone,
      hasPartials,
      paymentsTotal,
      amountDone,
      amountTotal
    }
  },
  // list of group names and contractIDs
  groupsByName (state) {
    const contracts = state.contracts
    // The code below was originally Object.entries(...) but changed to .keys()
    // due to the same flow issue as https://github.com/facebook/flow/issues/5838
    return Object.keys(contracts || {})
      .filter(contractID => contracts[contractID].type === 'gi.contracts/group' && state[contractID].settings)
      .map(contractID => ({ groupName: state[contractID].settings.groupName, contractID }))
  },
  groupMembersSorted (state, getters) {
    const profiles = getters.currentGroupState.profiles
    if (!profiles) return []
    const weJoinedMs = new Date(profiles[getters.ourUsername].joinedDate).getTime()
    const isNewMember = (username) => {
      if (username === getters.ourUsername) { return false }
      const memberProfile = profiles[username]
      if (!memberProfile) return false
      const memberJoinedMs = new Date(memberProfile.joinedDate).getTime()
      const joinedAfterUs = weJoinedMs <= memberJoinedMs
      return joinedAfterUs && Date.now() - memberJoinedMs < 604800000 // joined less than 1w (168h) ago.
    }

    return Object.keys({ ...getters.groupMembersPending, ...getters.groupProfiles })
      .map(username => {
        const { displayName } = getters.globalProfile(username) || {}
        return {
          username,
          displayName: displayName || username,
          invitedBy: getters.groupMembersPending[username],
          isNew: isNewMember(username)
        }
      })
      .sort((userA, userB) => {
        const nameA = userA.displayName.toUpperCase()
        const nameB = userB.displayName.toUpperCase()
        // Show pending members first
        if (userA.invitedBy && !userB.invitedBy) { return -1 }
        if (!userA.invitedBy && userB.invitedBy) { return 1 }
        // Then new members...
        if (userA.isNew && !userB.isNew) { return -1 }
        if (!userA.isNew && userB.isNew) { return 1 }
        // and sort them all by A-Z
        return nameA < nameB ? -1 : 1
      })
  },
  globalProfile (state, getters) {
    return username => {
      const groupProfile = getters.groupProfile(username)
      const identityState = groupProfile && state[groupProfile.contractID]
      return identityState && identityState.attributes
    }
  },
  colors (state) {
    return Colors[state.theme]
  },
  isDarkTheme (state) {
    return Colors[state.theme].theme === THEME_DARK
  },
  fontSize (state) {
    return state.fontSize
  },
  currentChatRoomId (state) {
    return state.currentChatRoomIDs[state.currentGroupId]
  },
  // isPrivateChatRoom (state) {
  //   return chatRoomId => {
  //     return state[chatRoomId]?.attributes.privacyLevel === CHATROOM_PRIVACY_LEVEL.PRIVATE
  //   }
  // }
}

const store = new Vuex.Store({
  state: _.cloneDeep(initialState),
  mutations,
  getters,
  actions: {},
  modules: {},
  strict: process.env.VUEX_STRICT ? process.env.VUEX_STRICT === 'true' : true
})

export default store