import sbp from '~/shared/sbp.js'
import './shared/domain/okTurtles/events.js'
import './shared/domain/okTurtles/eventQueue.js'
import './internals.js'

export const ACTION_REGEX: RegExp = /^((([\w.]+)\/([^/]+))(?:\/(?:([^/]+)\/)?)?)\w*/
// ACTION_REGEX.exec('gi.contracts/group/payment/process')
// 0 => 'gi.contracts/group/payment/process'
// 1 => 'gi.contracts/group/payment/'
// 2 => 'gi.contracts/group'
// 3 => 'gi.contracts'
// 4 => 'group'
// 5 => 'payment'

sbp('sbp/selectors/register', {
  'chelonia/_init': function () {
    this.config = {
      decryptFn: JSON.parse,
      encryptFn: JSON.stringify,
      stateSelector: 'chelonia/private/state',
      whitelisted: (action) => !!this.whitelistedActions[action]
      reactiveSet: (obj, key, value) => { obj[key] = value },
      reactiveDel: (obj, key) => { delete obj[key] },
      skipActionProcessing: false,
      skipSideEffects: false,
      connectionOptions: {
        maxRetries: Infinity,
        reconnectOnTimeout: true,
        timeout: 5000
      },
      hooks: {
        preHandleEvent: null,
        postHandleEvent: null,
        processError: null,
        sideEffectError: null,
        handleEventError: null,
        syncContractError: null,
        pubsubError: null
      }
    }
    this.state = {
      contracts: {},
      pending: []
    }
    this.contracts = {}
    this.whitelistedActions = {}
    this.sideEffectStacks = {}
    this.sideEffectStack = (contractID) => {
      let stack = this.sideEffectStacks[contractID]
      if (!stack) {
        this.sideEffectStacks[contractID] = stack = []
      }

      return stack
    }
  },
  'chelonia/configure': function (config) {
    merge(this.config, config)

    merge(this.config.hooks, config.hooks || {})
  },
  'chelonia/defineContract': function (contract) {
    if (!ACTION_REGEX.exec(contract.name)) {
      throw new Error(`bad contract name : ${contract.name}`)
    }

    if (!contract.metadata)
      contract.metadata = { validate () {} , create: () => ({}) }
    if (!contract.getters)
      contract.getters = {}

    contract.state = (contractID) => sbp(this.config.stateSelector)[contractID]
    this.contracts[contract.name] = contract

    sbp('sbp/selectors/register', {
      // expose getters for Vuex integration and other conveniences
      [`${contract.name}/getters`]: () => contract.getters,
      // 2 ways to cause sideEffects to happen: by defining a sideEfect function in the,
      // contract, or by calling /pushSideEffect w/async SBP call. Can also do both.
      [`${contract.name}/pushSideEffect`]: (contractID, asyncSbpCall) => {
        this.sideEffectStack(contractID).push(asyncSbpCall)
      }
    })

    for (const action in contract.actions) {
      contractFromAction(this.contracts, action) // ensure actions are appropreately named
      this.whitelistedActions[action] = true

      sbp('sbp/selectors/register', {
        [`${action}/process`]: (message, state) => {
          const { meta, data, contractID } = message
          const gProxy = gettersProxy(state, contract.getters)
          state = state || contract.state(contractID)

          contract.metadata.validate(meta, { state, ...gProxy, contractID })
          contract.actions[action].validate(data, { state, ...gProxy, meta, contractID })
          contract.actions[action].process(message, { state, ...gProxy })
        },
        [`${action}/sideEffect`]: async (message, state) => {
          const sideEffects = this.sideEffectStack(message.contractID)
          
          while(sideEffects.length > 0) {
            const sideEffect = sideEffects.shift()
            
            try {
              await sbp(...sideEffect)
            } catch (e) {
              console.error(`[chelonia] ERROR: '${e.name}' ${e.message}, for pushed sideEffect of ${message.description()}:`, sideEffect)
              this.sideEffectStacks[message.contractID] = [] // clear the side effects
              throw e
            }
          }

          if (contract.actions[action].sideEffect) {
            state = state || contract.state(message.contractID)
            const gProxy = gettersProxy(state, contract.getters)
            await contract.actions[action].sideEffect(message, { state, ...gProxy })
          }
        }
      })

    }
  }
})