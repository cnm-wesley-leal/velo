import { test, expect } from '@playwright/test';

///AAA - Arrange, Act, Assert

test('deve consultar um pedido', async ({ page }) => {

// Arrange
  await page.goto('http://localhost:5173/');
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');

  await page.getByRole('link', { name: 'Consultar Pedido' }).click();
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido');

  // Act
  await page.getByRole('textbox', { name: 'Número do Pedido'}).fill('VLO-HUMHRM');
  await page.getByRole('button', { name: 'Buscar Pedido' }).click();

  // Assert
  await expect(page.getByRole('textbox', { name: 'Pedido' })).toBeVisible({ timeout: 30000 });

  await expect(page.getByText('VLO-HUMHRM')).toBeVisible();
  
  await expect(page.getByText('APROVADO')).toBeVisible();
})
