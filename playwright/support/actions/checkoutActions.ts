import { Page, expect, Locator } from '@playwright/test'

export type CheckoutActions = {
  elements: {
    terms: Locator
    alerts: Record<string, Locator>
  }
  expectLoaded(): Promise<void>
  expectSummaryTotal(price: string): Promise<void>
  expectAlert(field: string, message: string): Promise<void>
  fillCustomerData(data: {
    name: string
    lastname: string
    email: string
    phone: string
    document: string
  }): Promise<void>
  selectStore(storeName: string): Promise<void>
  fillDownPayment(value: string): Promise<void>
  acceptTerms(): Promise<void>
  selectPaymentMethod(method: string): Promise<void>
  submit(): Promise<void>
  expectResult(status: string): Promise<void>
}

export function createCheckoutActions(page: Page): CheckoutActions {

  const terms = page.getByTestId('checkout-terms')

  const alerts: Record<string, Locator> = {
    name: page.getByTestId('error-name'),
    lastname: page.getByTestId('error-surname'),
    email: page.getByTestId('error-email'),
    phone: page.getByTestId('error-phone'),
    document: page.getByTestId('error-cpf'),
    store: page.getByTestId('error-store'),
    terms: page.getByTestId('error-terms')
  }

  return {

    elements: {
      terms,
      alerts
    },

    async expectLoaded() {
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    },

    async expectSummaryTotal(price: string) {
      await expect(page.getByTestId('summary-total-price')).toHaveText(price)
    },

    async expectAlert(field: string, message: string) {
      await expect(alerts[field]).toHaveText(message)
    },

    async fillCustomerData(data: {
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
      await page.getByRole('option', { name: storeName }).click()
    },

    async selectPaymentMethod(method: string) {
      await page.getByRole('button', { name: new RegExp(method, 'i') }).click()
    },

    async fillDownPayment(value: string) {
      await page.getByTestId('input-entry-value').fill(value)
    },

    async acceptTerms() {
      await terms.check()
    },

    async submit() {
      await page.getByRole('button', { name: 'Confirmar Pedido' }).click()
    },

    async expectResult(status: string) {
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: status })).toBeVisible()
    }

  }
}