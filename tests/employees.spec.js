import { test, expect } from '@playwright/test';

test('Login exitoso - Credenciales correctas', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Correo').fill('admin@cineflix.com');
  await page.getByPlaceholder('Contraseña').fill('admin123456*');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL('/admin/dashboard');

  await page.getByRole('link', { name: 'Personal' }).click();
});