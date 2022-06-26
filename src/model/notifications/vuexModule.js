import sbp from '~/shared/sbp.js'

import './selectors.js'
import { age, isNew, isOlder } from './utils.js'
import * as keys from './mutationKeys.js'

const getters = {
  // notifications relevant to the current group, plus notifications that don't belong to any group in particular.
  currentNotifications (state, getters, rootState) {
    return state.filter(item => !item.groupID || item.groupID === rootState.currentGroupId)
  },

  currentNotificationCount (state, getters) {
    return getters.currentNotifications.length
  },

  currentNewNotifications (state, getters) {
    return getters.currentNotifications.filter(isNew)
  },

  currentOlderNotifications (state, getters) {
    return getters.currentNotifications.filter(isOlder)
  },

  currentUnreadNotifications (state, gettters) {
    return getters.currentNotifications.filter(item => !item.read)
  },

  totalUnreadNotificationCount (state) {
    return state.filter(item => !item.read).length
  },

  // Notifications relevant to the current group only.
  currentGroupNotifications (state, getters, rootState) {
    return state.filter(item => item.groupID === rootState.currentGroupId)
  },

  // Unread notifications relevant to the current group only.
  currentGroupUnreadNotifications (state, getters) {
    return getters.currentGroupNotifications.filter(item => !item.read)
  },

  currentGroupUnreadNotificationCount (state, getters) {
    return getters.currentGroupUnreadNotifications.length
  },

  unreadGroupNotificationsFor (state, getters, rootState) {
    return (groupID) => (
      groupID === rootState.currentGroupId
        ? getters.currentGroupUnreadNotifications
        : state.filter(item => !item.read && item.groupID === groupID)
    )
  },

  // Finds what number to display on a group's avatar badge in the sidebar. Used in GroupList.vue.
  unreadGroupNotificationCountFor (state, getters) {
    return (groupID) => getters.unreadGroupNotificationsFor(groupID).length
  }
}

const mutations = {
  // Seems necessary because the red badge would not clear upon signing up a new user in Cypress via the bypassUI mechanism.
  logout (state) {
    state.splice(0, state.length)
  },

  [keys.ADD_NOTIFICATION] (state, notification) {
    if (state.includes(notification)) {
      throw new Error('This notification is already in the store.')
    }
    if (state[0] && age(notification) > age(state[0])) {
      throw new Error('This notification is older than the latest one in the store.')
    }
    // Using `unshift()` here to insert the new item before older ones.
    state.unshift(notification)
  },

  [keys.MARK_NOTIFICATION_AS_READ] (state, notification) {
    notification.read = true
  },

  // Clears the bell icon's badge, as well as the current group avatar's badge in the sidebar if visible.
  [keys.MARK_ALL_NOTIFICATIONS_AS_READ] (state) {
    sbp('state/vuex/getters').currentUnreadNotifications.forEach(item => {
      item.read = true
    })
  },

  [keys.REMOVE_NOTIFICATION] (state, notification) {
    const index = state.indexOf(notification)

    if (index > -1) {
      state.splice(index, 1)
    }
  },

  [keys.REMOVE_ALL_NOTIFICATIONS] (state) {
    // Just setting the length to zero wouldn't update the view immediately
    state.splice(0, state.length)
  },

  // Used upon successful login, with notifications from local storage
  [keys.SET_NOTIFICATIONS] (state, notifications) {
    state.splice(0, state.length, ...notifications)
  }
}

export default ({
  state: () => [],
  getters,
  mutations
})