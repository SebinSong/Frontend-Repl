import sbp from '~/shared/sbp.js'
import * as keys from './mutationKeys.js'
import templates from './templates.js'

/**
 * NOTE: do not refactor occurentce of `sbp('state/vuex/state')` by defining a shared constant in the
 *       outer scope, because login actions might invaidate it by calling 'replaceState()'.
 */
sbp('sbp/selectors/register', {
  'gi.notifications/emit': (type, data) => {
    const template = templates[type](data)

    if (template.scope === 'group' && !data.groupID) {
      throw new TypeError('Incomplete notification data: `data.groupID` is required')
    }

    // Creates the notification object in a single step.
    const notification = {
      avatarUsername: template.avatarUsername || sbp('state.vuex/getters').ourUsername,
      ...template,
      // Sets 'groupID' if this notification only pertains to a certain group.
      ...(template.scope === 'group' ? { groupID: data.groupID } : {}),
      read: false,
      timestamp: Date.now(),
      type
    }
    sbp('state/vuex/commit', keys.ADD_NOTIFICATION, notification)
  },

  'gi.notifications/markAsRead': (notification) => {
    sbp('state/vuex/commit', keys.MARK_NOTIFICATION_AS_READ, notification)
  },

  'gi.notifications/markAllAsRead': (groupID) => {
    sbp('state/vuex/commit', keys.MARK_ALL_NOTIFICATIONS_AS_READ, groupID)
  }
})