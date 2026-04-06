import { test, expect } from '../support/fixtures'

test.describe('Checkout', () => {

  test.describe('Validações de campos obrigatórios', () => {


    let alerts: any

    test.beforeEach(async ({ app, page }) => {
      await page.goto('/order')
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
      alerts = app.checkout.elements.alerts
    })


    test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {
      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(alerts.email).toHaveText('Email inválido')
      await expect(alerts.phone).toHaveText('Telefone inválido')
      await expect(alerts.document).toHaveText('CPF inválido')
      await expect(alerts.store).toHaveText('Selecione uma loja')
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })

    test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ app }) => {

      const customer = {
        name: 'A',
        lastname: 'B',
        email: 'papito@teste.com',
        document: '00000014141',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    })

    test('deve exibir erro para e-mail com formato inválido', async ({ app }) => {
      const customer = {
        name: 'Fernando',
        lastname: 'Papito',
        email: 'papito@.com',
        document: '00000014141',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.email).toHaveText('Email inválido')
    })

    test('deve exibir erro para CPF inválido', async ({ app }) => {

      const customer = {
        name: 'Fernando',
        lastname: 'Papito',
        email: 'papito@test.com',
        document: '00000014199',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.document).toHaveText('CPF inválido')
    })

    test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {

      const customer = {
        name: 'Fernando',
        lastname: 'Papito',
        email: 'papito@test.com',
        document: '00000014199',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')

      await expect(app.checkout.elements.terms).not.toBeChecked()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })
  })

  test.describe('Pagamento e Confirmação', () => {
    test('CT05 - deve concluir pedido aprovado com pagamento à vista', async ({ app, page }) => {
      const checkoutData = {
        customer: {
          name: 'Mariana',
          lastname: 'Silva',
          email: 'mariana.silva@teste.com',
          document: '52998224725',
          phone: '(11) 99876-5432',
        },
        store: 'Velô Paulista',
        expectedTotal: 'R$ 40.000,00',
        successStatus: 'Pedido Aprovado!',
      }

      // Arrange
      await app.configurator.openHome()
      await page.getByRole('link', { name: 'Configure Agora' }).click()
      await app.configurator.expectPrice(checkoutData.expectedTotal)
      await app.configurator.proceedToCheckout()
      await app.checkout.expectLoaded()
      await app.checkout.fillCustomerlData(checkoutData.customer)
      await app.checkout.selectStore(checkoutData.store)
      await app.checkout.selectCashPayment()
      await app.checkout.expectSummaryTotal(checkoutData.expectedTotal)
      await app.checkout.expectCashPaymentAmount(checkoutData.expectedTotal)
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success$/)
      await expect(page.getByTestId('success-status')).toHaveText(checkoutData.successStatus)
      await expect(page.getByTestId('order-id')).toBeVisible()
      await expect(page.getByText(`${checkoutData.customer.name} ${checkoutData.customer.lastname}`)).toBeVisible()
      await expect(page.getByText(checkoutData.customer.email)).toBeVisible()
      await expect(page.getByText(checkoutData.store)).toBeVisible()
    })
  })
})