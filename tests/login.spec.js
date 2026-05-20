import { test, expect } from '@playwright/test';

//Prueba de Login exitosa con usuario
test('Debería interactuar con el formulario y logearse exitosamente', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Correo').fill('admin@cineflix.com');
  await page.getByPlaceholder('Contraseña').fill('admin123456*');

  const botonOjo = page.getByRole('button', { name: 'Mostrar contraseña' });
  await expect(botonOjo).toBeVisible();
  await botonOjo.click();

  await expect(page.getByRole('button', { name: 'Ocultar contraseña' })).toBeVisible();

  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  await expect(page).toHaveURL('/admin/dashboard');
});
