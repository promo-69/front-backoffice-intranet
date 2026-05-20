import { test, expect } from '@playwright/test';

//Prueba de Login exitosa con SUPERADMIN
test('Login exitoso - Credenciales correctas', async ({ page }) => {
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

//Prueba de Login fallida con SUPERADMIN
test('Login Fallido - Credenciales incorrectas 1', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Correo').fill('admin@cineflix.com');
  await page.getByPlaceholder('Contraseña').fill('claveErronea123');

  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  await expect(page).not.toHaveURL('/admin/dashboard');

  await expect(page.getByText(/las credenciales no son válidas/i)).toBeVisible();
});

//Prueba de Login fallida con SUPERADMIN
test('Login Fallido - Credenciales incorrectas 2', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Correo').fill('frek@cineflix.com');
  await page.getByPlaceholder('Contraseña').fill('defferente123');

  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  await expect(page).not.toHaveURL('/admin/dashboard');

  await expect(page.getByText(/las credenciales no son válidas/i)).toBeVisible();
});
