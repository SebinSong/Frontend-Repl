'use strict'

import sbp from '~/shared/sbp.js'
import Vue from 'vue'

import '~/shared/domain/chelonia/chelonia.js'

export function createInvite ({ 
  quantity = 1,
  creator,
  expires,
  invitee
}) {
  return {
    inviteSecret: `${parseInt(Math.random() * 10000)}`,
    quantity,
    creator,
    invitee,
    status: INVITE_STATUS.VALID,
    response: {},
    expires: Date.now() + DAYS_MILLIS * expires
  }
}

function initGroupProfile (contractID, joinedDate) {
  
}