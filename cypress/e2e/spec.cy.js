const kitchenSinkUrl = 'https://example.cypress.io'

describe('My First Test', () => {
  it('Visit the kitchen Sink!', () => {
    cy.visit(kitchenSinkUrl)

    cy.contains('type').click()

    cy.url().should('include', '/commands/actions')

    cy.get('#email1')
      .type('fake@email.com')
      .should('have.value', 'fake@email.com')
  })
})
