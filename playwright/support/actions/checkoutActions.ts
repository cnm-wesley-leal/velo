import { Page, expect } from '@playwright/test'

export function createCheckoutActions(page: Page) {
  const terms = page.getByTestId('checkout-terms')
  const paymentCash = page.getByTestId('payment-avista')
  const paymentFinancing = page.getByTestId('payment-financiamento')
  const submitButton = page.getByTestId('checkout-submit')
  const summaryTotalPrice = page.getByTestId('summary-total-price')

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
      paymentCash,
      paymentFinancing,
      submitButton,
      summaryTotalPrice,
      alerts,
    },

    async expectLoaded() {
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    },

    async expectSummaryTotal(price: string) {
      await expect(summaryTotalPrice).toHaveText(price)
    },

    async expectCashPaymentAmount(price: string) {
      await expect(paymentCash).toContainText(price)
    },

    async selectCashPayment() {
      await paymentCash.click()
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

    async acceptTerms() {
      await terms.check()
    },

    async submit() {
      await page.getByRole('button', { name: 'Confirmar Pedido' }).click()
    },
  }
}