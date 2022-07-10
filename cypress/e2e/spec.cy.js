const kitchenSinkUrl = 'https://example.cypress.io'
const name = 'sebin'
const obj = { name: 'sebin', age: null }
const wait = (ms = 600) => new Promise((res) => { setTimeout(res, ms) })
const fnWithError = async () => {
  await wait(800)

  throw Error('random Error')
}
const fnObjToNumber = (obj = {}) => Object.entries(obj).length || 0

describe('My First Test', {
  viewportWidth: 1400,
  viewportHeight: 800
}, () => {
  it.only('Visit the kitchen Sink!', () => {
    expect(cy.config('viewportWidth')).to.equal(1400)
    expect(cy.config('viewportHeight')).to.lt(900)

    cy.visit(kitchenSinkUrl)

    cy.get('ul li').each(li => {
      cy.wrap(li).should('match', ':not(:empty)')
    })
  })

  it(
    'check if a custom config to a particular test item works',
    { viewportWidth: 700 },
    () => {
      expect(cy.config('viewportWidth')).to.not.eq(1400)
      cy.wrap([1, false, 'sebin']).its('length').should('lte', 3)
    }
  )

  it('BDD assertion practice', () => {
    expect(name).to.not.eq('Jamne')
    expect(obj).to.deep.equal({ name, age: null })
    expect({ name: { first: 'sebin', last: 'sebin' } }).to.have.nested.property('name.last')
    expect([1, 2, false, 'sebin', { name }]).to.include(2)
    expect([1, 2, false, 'wow']).to.have.members([1, 'wow', 2, false])
    expect(120).to.be.a('number')
    expect([2,3,4,5]).include(3)
    expect(false).to.not.be.ok
    expect({ name: 'Jane' }).to.eql({ name: 'Jane' })
    expect([1,2,3]).to.satisfy(arr => arr.includes(2) && arr.length < 5)
    expect({
      name: 'sebin', age: 40, isOnline: false
    }).to.include.keys('age', 'isOnline')
    expect([3, 4, 5, 6]).to.include.members([6,3])

    cy.wrap([2,3,4,5, 'sebin']).should('include', 5)
    cy.wrap(Math.random()).should('be.a', 'number')
    cy.wrap(obj).should('have.property', 'age')

  })
})
