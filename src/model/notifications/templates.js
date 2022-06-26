import L from '@view-utils/translations.js'

// Note: this escaping is not intended as a protection against XSS
// It is only done to enable correct rendering of special characters in usernames.
// To guard against XSS when rendering usernames, use `v-safe-html` directive.
const escapeForHtml = text => text.replace(/[<>&]/g, '\\$$')
const strong = text => `<strong>${escapeForHtml(text)}</strong>`

export default ({
  GENERAL (data) {
    return {
      body: data.message,
      icon: 'cog',
      level: 'info',
      linkTo: '',
      scope: 'app'
    }
  },
  WARNING (data) {
    return {
      body: data.message,
      icon: 'exclamation-triangle',
      level: 'danger',
      linkTo: '',
      scope: 'app'
    }
  },
  ERROR (data) {
    return {
      body: data.message,
      icon: 'exclamation-triangle',
      level: 'danger',
      linkTo: `/app/dashboard?modal=UserSettingsModal&section=application-logs&errorMsg=${encodeURI(data.message)}`,
      scope: 'app'
    }
  },
  CONTRIBUTION_REMINDER (data) {
    return {
      body: L('Do not forget to send your pledge by {date}.', {
        date: strong(data.date)
      }),
      icon: 'coins',
      level: 'info',
      linkTo: '/payments',
      scope: 'user'
    }
  },
  INCOME_DETAILS_OLD (data) {
    return {
      body: L("You haven't updated your income details in more than {months} months. Would you like to review them now?", {
        months: Math.floor(data.months)
      }),
      icon: 'coins',
      level: 'info',
      linkTo: '/contributions/TODO-LINK-MODAL',
      scope: 'user'
    }
  },
  MEMBER_ADDED (data) {
    return {
      avatarUsername: data.username,
      body: L('The group has a new member. Say hi to {name}!', {
        name: strong(data.username)
      }),
      icon: 'user-plus',
      level: 'info',
      linkTo: '/group-chat/XXXX',
      scope: 'group'
    }
  },
  MEMBER_LEFT (data) {
    return {
      avatarUsername: data.username,
      body: L('{name} has left your group. Contributions were udpated accordingly.', {
        name: data.username
      }),
      icon: 'icon-minus',
      level: 'info',
      linkTo: '/contributions',
      scope: 'group'
    }
  },
  MEMBER_REMOVED (data) {
    return {
      avatarUsername: data.username,
      body: L('{name} was kicked out of the group. Contributions were updated accordingly.', {
        name: strong(data.username)
      }),
      icon: 'user-minus',
      level: 'danger',
      linkTo: '/contributions',
      scope: 'group'
    }
  },
  NEW_PROPOSAL (data) {
    const bodyTemplateMap = {
      ADD_MEMBER: (creator) => L('{member} proposed to add a member to the group. Vote now!', { member: strong(creator) }),
      CHANGE_MINCOME: (creator) => L('{member} proposed to change the group mincome. Vote now!', { member: strong(creator) }),
      CHANGE_VOTING_RULE: (creator) => L('{member} proposed to change the group voting system. Vote now!', { member: strong(creator) }),
      REMOVE_MEMBER: (creator) => L('{member} proposed to remove a member from the group. Vote now!', { member: strong(creator) })
    }

    const iconMap = {
      ADD_MEMBER: 'user-plus',
      CHANGE_MINCOME: 'coins',
      CHANGE_VOTING_RULE: 'vote-yea',
      REMOVE_MEMBER: 'user-minus'
    }

    return {
      avatarUsername: data.creator,
      body: bodyTemplateMap[data.subType](data.creator),
      creator: data.creator,
      icon: iconMap[data.subType],
      level: 'info',
      linkTo: 'dashboard#TODO-proposals',
      subtype: data.subType,
      scope: 'group'
    }
  }
})