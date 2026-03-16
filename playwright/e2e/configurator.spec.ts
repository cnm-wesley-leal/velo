import { test } from '../support/fixtures'

test.describe('Configuração do Veículo', () => {
  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
  })

  test('deve atualizar a imagem e manter o preço base ao trocar a cor do veículo', async ({ app }) => {
    await app.configurator.expectPrice('R$ 40.000,00')

    await app.configurator.selectColor('Midnight Black')
    await app.configurator.expectPrice('R$ 40.000,00')
    await app.configurator.expectCarImageSrc('/src/assets/midnight-black-aero-wheels.png')
  })

  test('deve atualizar o preço e a imagem ao alterar as rodas, e restaurar os valores padrão', async ({ app }) => {
    await app.configurator.expectPrice('R$ 40.000,00')

    await app.configurator.selectWheels(/Sport Wheels/)
    await app.configurator.expectPrice('R$ 42.000,00')
    await app.configurator.expectCarImageSrc('/src/assets/glacier-blue-sport-wheels.png')

    await app.configurator.selectWheels(/Aero Wheels/)
    await app.configurator.expectPrice('R$ 40.000,00')
    await app.configurator.expectCarImageSrc('/src/assets/glacier-blue-aero-wheels.png')
  })

  test('deve atualizar o preço ao adicionar e remover opcionais e seguir para o checkout (CT03)', async ({ app }) => {
    const toggleAndExpectOptional = async (
      name: string,
      checked: boolean,
      expectedPrice: string,
    ) => {
      await app.configurator.toggleOptional(name)
      await app.configurator.expectOptionalChecked(name, checked)
      await app.configurator.expectPrice(expectedPrice)
    }

    await app.configurator.expectPrice('R$ 40.000,00')

    await toggleAndExpectOptional('Precision Park', true, 'R$ 45.500,00')
    await toggleAndExpectOptional('Flux Capacitor', true, 'R$ 50.500,00')

    await toggleAndExpectOptional('Precision Park', false, 'R$ 45.000,00')
    await toggleAndExpectOptional('Flux Capacitor', false, 'R$ 40.000,00')

    await app.configurator.goToCheckout()
  })
})