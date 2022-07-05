'use strict'

export class ChelErrorDBBadPreviousHEAD extends Error {
  constructor (...params) {
    super(...params)

    this.name = 'ChelErrorDBBadPreviousHEAD'
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export class ChelErrorDBConnection extends Error {
  constructor (...params: any[]) {
    super(...params)
    this.name = 'ChelErrorDBConnection'
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export class ChelErrorUnexpected extends Error {
  constructor (...params: any[]) {
    super(...params)
    this.name = 'ChelErrorUnexpected'
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export class ChelErrorUnrecoverable extends Error {
  constructor (...params: any[]) {
    super(...params)
    this.name = 'ChelErrorUnrecoverable'
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}


