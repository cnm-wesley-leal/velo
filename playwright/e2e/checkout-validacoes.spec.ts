import { test, expect } from '../support/fixtures'

import { deleteOrderByEmail } from '../support/database/orderRepository'

test.describe('Checkout', () => {



    test.describe('Validações de campos obrigatórios', () => {

        test.beforeEach(async ({ page, app }) => {
            await page.goto('/order')
            await app.checkout.expectLoaded()
        })


        test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {
            // Act
            await app.checkout.submit()

            // Assert
            await app.checkout.expectAlert('name', 'Nome deve ter pelo menos 2 caracteres')
            await app.checkout.expectAlert('lastname', 'Sobrenome deve ter pelo menos 2 caracteres')
            await app.checkout.expectAlert('email', 'Email inválido')
            await app.checkout.expectAlert('phone', 'Telefone inválido')
            await app.checkout.expectAlert('document', 'CPF inválido')
            await app.checkout.expectAlert('store', 'Selecione uma loja')
            await app.checkout.expectAlert('terms', 'Aceite os termos')
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
            await app.checkout.expectAlert('name', 'Nome deve ter pelo menos 2 caracteres')
            await app.checkout.expectAlert('lastname', 'Sobrenome deve ter pelo menos 2 caracteres')
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
            await app.checkout.expectAlert('email', 'Email inválido')
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
            await app.checkout.expectAlert('document', 'CPF inválido')
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
            await app.checkout.expectAlert('terms', 'Aceite os termos')
        })
    })

    test.describe('Pagamento e Confirmação', () => {

        test.beforeEach(async ({ page, app }) => {
            await page.goto('/')
            await page.getByRole('link', { name: /Configure Agora/i }).click()

            await app.configurator.expectPrice('R$ 40.000,00')
            await app.configurator.finishConfigurator()
            await app.checkout.expectLoaded()
        })

        test('deve criar um pedido com sucesso para pagamento à vista', async ({ app }) => {

            const customer = {
                name: 'Fernando',
                lastname: 'Papito',
                email: 'papito@teste.com',
                document: '05366127068',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'À Vista',
                totalPrice: 'R$ 40.000,00'
            }

            await deleteOrderByEmail(customer.email)

            // Arrange
            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            // Act
            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.expectSummaryTotal(customer.totalPrice)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            // Assert
            await app.checkout.expectOrderApproved()
        })

        test('deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento', async ({ app }) => {

            const customer = {
                name: 'Steve',
                lastname: 'Woz',
                email: 'woz@velo.dev',
                document: '65493881047',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00'
            }

            await deleteOrderByEmail(customer.email)
            await app.checkout.mockCreditAnalysis(710)

            // Arrange
            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            // Act
            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            // Assert
            await app.checkout.expectOrderApproved()
        })

        test('deve encaminhar para análise de crédito quando o score do CPF for entre 501 e 700 no financiamento', async ({ app }) => {

            const customer = {
                name: 'Tony',
                lastname: 'Stark',
                email: 'tony@stark.com',
                document: '74690251037',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00'
            }

            await deleteOrderByEmail(customer.email)
            await app.checkout.mockCreditAnalysis(600)

            // Arrange
            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            // Act
            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            // Assert
            await app.checkout.expectOrderInReview()
        })

        test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada igual a 50%', async ({ app }) => {

            const customer = {
                name: 'Richard',
                lastname: 'Fortus',
                email: 'richard@gmail.com',
                document: '39434745004',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00',
                downPayment: '20000'
            }

            await deleteOrderByEmail(customer.email)
            await app.checkout.mockCreditAnalysis(450)

            // Arrange
            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            // Act
            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.fillDownPayment(customer.downPayment)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            // Assert
            await app.checkout.expectOrderApproved()
        })

        test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada mair que 50%', async ({ app }) => {

            const customer = {
                name: 'Axl',
                lastname: 'Rose',
                email: 'alx@gnr.com',
                document: '79327557000',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'Financiamento',
                totalPrice: 'R$ 40.000,00',
                downPayment: '30000'
            }

            await deleteOrderByEmail(customer.email)
            await app.checkout.mockCreditAnalysis(300)

            // Arrange
            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore(customer.store)

            // Act
            await app.checkout.selectPaymentMethod(customer.paymentMethod)
            await app.checkout.fillDownPayment(customer.downPayment)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            // Assert
            await app.checkout.expectOrderApproved()
        })
    })
})