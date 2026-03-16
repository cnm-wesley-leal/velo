import { Page, expect } from '@playwright/test'

export function createConfiguratorActions(page: Page) {
  return {
    async open() {
      await page.goto('/configure')
    },

    async selectColor(name: string) {
      await page.getByRole('button', { name }).click()
    },

    async selectWheels(name: string | RegExp) {
      await page.getByRole('button', { name }).click()
    },

    async toggleOptional(name: string) {
      const optionalCheckbox = page.getByRole('checkbox', { name })
      await expect(optionalCheckbox).toBeVisible()
      await optionalCheckbox.click()
    },

    async expectOptionalChecked(name: string, checked: boolean) {
      const optionalCheckbox = page.getByRole('checkbox', { name })
      await expect(optionalCheckbox).toBeVisible()
      if (checked) {
        await expect(optionalCheckbox).toBeChecked()
      } else {
        await expect(optionalCheckbox).not.toBeChecked()
      }
    },

    async expectPrice(price: string) {
      const priceElement = page.getByTestId('total-price')
      await expect(priceElement).toBeVisible()
      await expect(priceElement).toHaveText(price)
    },

    async expectCarImageSrc(src: string) {
      const carImage = page.locator('img[alt^="Velô Sprint"]')
      await expect(carImage).toHaveAttribute('src', src)
    },

    async goToCheckout() {
      const checkoutButton = page.getByRole('button', { name: /Monte o Seu/i })
      await expect(checkoutButton).toBeVisible()
      await checkoutButton.click()
      await expect(page).toHaveURL(/\/order/)
    },
  }
}
