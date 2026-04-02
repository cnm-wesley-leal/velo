import { test, expect } from '../support/fixtures'
import { generateOrderCode } from '../support/helpers'
import type { OrderDetails } from '../support/actions/orderLookupActions'

import testData from '../support/fixtures/orders.json' with { type: 'json' }

type DbOrder = {
  id: string
  order_number: string
  color: 'glacier-blue' | 'lunar-white' | 'midnight-black'
  wheel_type: 'aero' | 'sport'
  optionals: string[]
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_cpf: string
  payment_method: 'avista' | 'financiamento'
  total_price: number
  status: 'APROVADO' | 'REPROVADO' | 'EM_ANALISE'
  created_at: string
  updated_at: string
}

type FixtureOrder = OrderDetails & {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_cpf: string
  payment_method: 'avista' | 'financiamento'
  total_price_number: number
  color_slug: 'glacier-blue' | 'lunar-white' | 'midnight-black'
  wheel_type: 'aero' | 'sport'
  created_at: string
  updated_at: string
  optionals: string[]
}

function toDbOrder(order: FixtureOrder): DbOrder {
  return {
    id: order.id,
    order_number: order.order_number,
    color: order.color_slug,
    wheel_type: order.wheel_type,
    optionals: order.optionals,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    customer_cpf: order.customer_cpf,
    payment_method: order.payment_method,
    total_price: order.total_price_number,
    status: order.status,
    created_at: order.created_at,
    updated_at: order.updated_at,
  }
}

const mockOrders: Record<string, DbOrder> = {
  [testData.em_analise.number]: toDbOrder(testData.em_analise as FixtureOrder),
  [testData.reprovado.number]: toDbOrder(testData.reprovado as FixtureOrder),
  [testData.aprovado.number]: toDbOrder(testData.aprovado as FixtureOrder),
  [testData.aprovado_2.number]: toDbOrder(testData.aprovado_2 as FixtureOrder),
}

test.describe('Consulta de Pedido', () => {

  test.beforeEach(async ({ app, page }) => {
    await page.route('**/rest/v1/orders*', async (route) => {
      const requestUrl = new URL(route.request().url())
      const eqValue = requestUrl.searchParams.get('order_number')?.replace(/^eq\./, '')
      const order = eqValue ? mockOrders[eqValue] : undefined

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(order ? [order] : []),
      })
    })

    await app.orderLookup.open()
  })


  test('deve consultar um pedido aprovado', async ({ app }) => {

    const order: OrderDetails = testData.aprovado as OrderDetails

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
    await app.orderLookup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido reprovado', async ({ app }) => {

    const order: OrderDetails = testData.reprovado as OrderDetails

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
    await app.orderLookup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido em analise', async ({ app }) => {
    const order: OrderDetails = testData.em_analise as OrderDetails

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
    await app.orderLookup.validateStatusBadge(order.status)
  })

  test('deve exibir mensagem quando o pedido não é encontrado', async ({ app }) => {
    const order = generateOrderCode()
    await app.orderLookup.searchOrder(order)
    await app.orderLookup.validateOrderNotFound()
  })

  test('deve exibir mensagem quando o código do pedido está fora do padrão', async ({ app }) => {
    const orderCode = 'XYZ-999-INVALIDO'
    await app.orderLookup.searchOrder(orderCode)
    await app.orderLookup.validateOrderNotFound()
  })

  test('deve manter o botão de busca desabilitado com campo vazio ou apenas espaços', async ({ app, page }) => {
    const button = app.orderLookup.elements.searchButton
    await expect(button).toBeDisabled()

    await app.orderLookup.elements.orderInput.fill('     ')
    await expect(button).toBeDisabled()
  })
})