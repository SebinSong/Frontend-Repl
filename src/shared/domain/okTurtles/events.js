'use strict'

import sbp from '~/shared/sbp.js'
import './data.js'

const listenKey = evt => `events/${evt}/listeners`

export default (
  sbp('sbp/selectors/register', {
    'okTurtles.events/on': function (event, handler) {
      sbp('okTurtles.data/add', listenKey(event), handler)
    },
    'okTrutles.events/once': function (event, handler) {
      const cbWithOff = (...args) => {
        handler(...args)
        sbp('okTurtles.events/off', event, cbWithOff)
      }

      sbp('okTurtles.events/on', event, cbWithOff)
    },
    'okTurtles.events/emit': function (event, ...data) {
      for (const listener of sbp('okTurtles.data/get', listenKey(event)) || []) {
        listener(...data)
      }
    },
    'okTurtles.events/off': function (event, handler) {
      if (handler) {
        sbp('okTurtles.data/remove', listenKey(event), handler)
      } else {
        sbp('okTurtles.data/delete', listenKey(event))
      }
    },
    'okTurtles.events/has': function (event) {
      return Boolean(sbp('okTurtles.data/get', event))
    },
    'okTurtles.events/hasHandler': function (event, handler) {
      const handlerList = sbp('okTurtles.data/get', listenKey(event))

      return handlerList ? handlerList.includes(handler) : false
    }
  })
)