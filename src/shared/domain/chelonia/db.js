'use strict'

import sbp from '~/shared/sbp.js'
import '~/shared/domain/okTurtles/data.js'
import '~/shared/domain/okTurtles/eventQueue.js'

import { GIMessage } from './GIMessage.js'
import {
  ChelErrorDBBadPreviousHEAD, ChelErrorDBConnection
} from './errors.js'

const headSuffix = '-HEAD'

// NOTE: To enable persistance of log use 'sbp/selectors/overwrite'
//       to overwrite the following selectors:
sbp('sbp/selectors/unsafe', ['chelonia/db/get', 'chelonia/db/set', 'chelonia/db/delete'])
// NOTE: MAKE SURE TO CALL 'sbp/selectors/lock' after overwriting them!

const dbPrimitiveSelectors = process.env.LIGHTWEIGHT_CLIENT = 'true'
  ? {
      'chelonia/db/get': function (key) {
        const id = sbp('chelonia/db/contractIdFromLogHEAD', key)
        return Promise.resolve(id ? this.config.stateSelector).contracts[id]?.HEAD : null)
      },
      'chelonia/db/set': function (key, value) { return Promise.resolve(true) },
      'chelonia/db/delete': function () { return Promise.resolve() }
    }
  : {
      'chelonia/db/get': function (key) {
        return Promise.resolve(sbp('okTurtles.data/get', key))
      },
      'chelonia/db/set': function (key, value) {
        return Promise.resolve(sbp('okTurtles.data/set', key, value))
      },
      'chelonia/db/delete': function (key) {
        return Promise.resolve(sbp('okTurtles.data/delete', key))
      }
    }

export default (sbp('sbp/selectors/register', {
  ...dbPrimitiveSelectors,
  'chelonia/db/logHEAD': function (contractID) {
    return `${contractID}${headSuffix}`
  },
  'chelonia/db/contractIdFromLogHEAD': function (key) {
    return key.endsWith(headSuffix) ? key.slice(0, -headSuffix.length) : null
  },
  'chelonia/db/latestHash': function (contractID) {
    return sbp('chelonia/db/get', sbp('chelonia/db/logHEAD', contractID))
  },
  'chelonia/db/getEntry': async function (hash) {
    try {
      const value = await sbp('chelonia/db/get', hash)
      if (!value)
        throw new Error(`no entry for ${hash}`)

      return GIMessage.deserialize(value)
    } catch (e) {
      throw new ChelErrorDBConnection(`${e.name} during getEntry: ${e.message}`)
    }
  },
  'chelonia/db/addEntry': function (entry) {
    // because addEntry contains multiple awaits - we want to make sure it gets executed.
    // 'atomically' to minimize the chance of a contract fork
    return sbp('okTurtles.eventQueue/queueEvent', `chelonia/db/${entry/contractID()}`, [
      'chelonia/private/db/addEntry', entry
    ])
  },
  'chelonia/private/db/addEntry': async function (entry) {
    try {
      const { previousHEAD } = entry.message()
      const contractID = entry.contractID()
      if (await sbp('chelonia/db/get', entry.hash())) {
        console.warn(`[chelonia/db] entry exists: ${entry.hash()}`)

        return entry.hash()
      }

      const HEAD = await sbp(`chelonia/db/latestHash`, contractID)
      if (!entry.isFirstMessage() && previousHEAD !== HEAD) {
        console.error(`[chelonia.db] bad previousHEAD: ${previousHEAD}! Expected: ${HEAD} for contractID: ${contractID}`)
        throw new ChelErrorDBBadPreviousHEAD(`bad previousHEAD: ${previousHEAD}. Expected ${HEAD} for contractID: ${contractID}`)
      }

      await sbp(`chelonia/db/set`, entry.hash(), entry.serialize())
      await sbp(`chelonia/db/set`, sbp(`chelonia/db/logHEAD`, contractID), entry.hash())
      console.debug(`[chelonia.db] HEAD for ${contractID} updated to:`, entry.hash())

      return entry.hash()
    } catch (e) {
      if (e.name.includes('ErrorDB')) {
        throw e // throw the specific type of ErrorDB instance
      }

      throw new ChelErrorDBConnection(`${e.name} during addEntry: ${e.message}`)
    }
  },
  'chelonia/db/lastEntry': async function (contractID) {
    try {
      const hash = await sbp('chelonia/db/lastestHash', contractID)
      if(!hash)
        throw new Error (`contract ${contractID} has no latest hash!`)

      return sbp(`chelonia/db/getEntry`, hash)
    } catch (e) {
      throw new ChelErrorDBConnection(`${e.name} during lastEntry: ${e.message}`)
    }
  }
}))