import { Page, expect } from '@playwright/test'

export function createCheckoutActions(page: Page) {
  const terms = page.getByTestId('checkout-terms')

  const alerts = {
    name: page.getByTestId('error-name'),
    lastname: page.getByTestId('error-surname'),
    email: page.getByTestId('error-email'),
    phone: page.getByTestId('error-phone'),
    document: page.getByTestId('error-cpf'),
    store: page.getByTestId('error-store'),
    terms: page.getByTestId('error-terms'),
  }

  return {
    elements: {
      terms,
      alerts,
    },

    async expectLoaded() {
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    },

    async expectSummaryTotal(price: string) {
      await expect(page.getByTestId('summary-total-price')).toHaveText(price)
    },

    async fillCustomerlData(data: {
      name: string
      lastname: string
      email: string
      phone: string
      document: string
    }) {
      await page.getByTestId('checkout-name').fill(data.name)
      await page.getByTestId('checkout-surname').fill(data.lastname)
      await page.getByTestId('checkout-email').fill(data.email)
      await page.getByTestId('checkout-phone').fill(data.phone)
      await page.getByTestId('checkout-cpf').fill(data.document)
    },

    async selectStore(storeName: string) {
      await page.getByTestId('checkout-store').click()
      await page.getByRole('option', { name: new RegExp(storeName, 'i') }).click()
    },
    async fillDownPayment(value: string) {
      await page.getByTestId('input-entry-value').fill(value)
    },

    async acceptTerms() {
      await terms.check()
    },

    async selectPaymentMethod(method: string) {
      await page.getByRole('button', { name: method }).click()
    },

    async submit() {
      await page.getByRole('button', { name: 'Confirmar Pedido' }).click()
    },

    async mockCreditAnalysis(score: number) {
      await page.route('**/functions/v1/credit-analysis', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'Done',
            score,
          }),
        })
      })
    },

    async expectOrderApproved() {
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: /Pedido Aprovado/i })).toBeVisible()
    },

    async expectOrderInReview() {
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: /Pedido em Análise/i })).toBeVisible()
    }
  }
}