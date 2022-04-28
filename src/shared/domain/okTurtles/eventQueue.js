'use strict'

import sbp from '~/shared/sbp.js'

const eventQueues = {}
const STATE_PENDING = 0
const STATE_INVOKING = 1
const STATE_FINISHED = 2

export default (
  sbp('sbp/selectors/register', {
    'okTurtles.eventQueue/queueEvent': async function (name, sbpInvocation) {
      if (!eventQueues[name]) {
        eventQueues[name] = { events: [] }
      }

      const events = eventQueues[name].events

      events.push({
        sbpInvocation,
        state: STATE_PENDING,
        promise: null
      })

      while (events.length > 0) {
        const event = events[0]

        if (event.state === STATE_PENDING) {
          event.state = STATE_INVOKING
          event.promise = sbp(...event.sbpInvocation)
          await event.promise
          event.state = STATE_FINISHED
        } else if (event.state === STATE_INVOKING) {
          await event.promise
        } else {
          events.shift()
        }
      }
    }
  })
)