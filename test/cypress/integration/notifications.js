const dreamersGroupName = 'Dreamer'
const turtlesGroupName = 'Turtles'
const username = `user-${Math.floor(Math.random() * 10000)}`

/* === Fake notifications === */
const fakeNotificationsForDreamers = [
  {
    type: 'MEMBER_ADDED',
    data: {
      username: 'greg'
    }
  },
  {
    type: 'MEMBER_ADDED',
    data: {
      username: 'kate'
    }
  },
  {
    type: 'NEW_PROPOSAL',
    data: {
      creator: 'greg',
      subtype: 'CHANGE_MINCOME',
      value: '$1000'
    }
  },
  {
    type: 'MEMBER_ADDED',
    data: {
      username: 'bot'
    }
  },
  {
    type: 'NEW_PROPOSAL',
    data: {
      creator: 'kate',
      subtype: 'REMOVE_MEMBER'
    }
  }
]

const otherFakeNotificationsForDreamers = [
  {
    type: 'MEMBER_REMOVED',
    data: {
      username: 'bot'
    }
  },
  {
    type: 'MEMBER_ADDED',
    data: {
      username: 'john'
    }
  }
]

const fakeNotificationsForTurtles = [
  {
    type: 'MEMBER_ADDED',
    data: {
      username: 'alice'
    }
  },
  {
    type: 'MEMBER_ADDED',
    data: {
      username: 'bob'
    }
  },
  {
    type: 'MEMBER_ADDED',
    data: {
      username: 'john'
    }
  }
]

const fakePrivateNotifications = [
  {
    type: 'CONTRIBUTION_REMINDER',
    data: {
      date: '2022-04-23'
    }
  },
  {
    type: 'INCOME_DETAILS_OLD',
    data: {
      months: 6
    }
  }
]

/* === Helper functions === */

const cyCheckBellsBadge = (expectedCount) => {
  if (expectedCount) {
    cy.getByDT('alertNotification').each(elem => {
      cy.wrap(elem).should('have.text', expectedCount)
    })
  } else {
    cy.getByDT('alertNotification').should('not.exist')
  }
}

const cyCheckDashboardBadge = (expectedCount) => {
  if (expectedCount) {
    cy.getByDT('dashboardBadge').should('have.text', expectedCount)
  } else {
    cy.getByDT('dashboardBadge').should('not.exist')
  }
}

const cyCheckDreamersBadge = (expectedCount) => {
  if (expectedCount) {
    cy.getByDT(`groupBadge-${dreamersGroupName}`).should('have.text', expectedCount)
  } else {
    cy.getByDT(`groupBadge-${dreamersGroupName}`).should('not.exist')
  }
}

const cyCheckTurtlesBadge = (expectedCount) => {
  if (expectedCount) {
    cy.getByDT(`groupBadge-${turtlesGroupName}`).should('have.text', expectedCount)
  } else {
    cy.getByDT(`groupBadge-${turtlesGroupName}`).should('not.exist')
  }
}

/* === Tests === */
describe('Notifications', () => {
  it('creates a user and two groups', () => {
    cy.visit('/').its('sbp').then(async sbp => {
      if (sbp('state/vuex/state').loggedIn) {
        await sbp('gi.actions/identity/logout')
      }
    })
    cy.giSignup(username, { bypassUI: true })
    cy.giCreateGroup(dreamersGroupName, { bypassUI: true })
    cy.giCreateGroup(turtlesGroupName, { bypassUI: true })
    // The sidebar should now be visible and have two group buttons and one '+' button.
    cy.getByDT('groupList').find('button').should('have.length', 3)
  })
})