import { test, expect } from '@playwright/test';

//Crear una sucursal con SUPERADMIN
test('Crear sucursal - SUPERADMIN', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Correo').fill('admin@cineflix.com');
  await page.getByPlaceholder('Contraseña').fill('admin123456*');
  const botonOjo = page.getByRole('button', { name: 'Mostrar contraseña' });
  await expect(botonOjo).toBeVisible();
  await botonOjo.click();
  await expect(page.getByRole('button', { name: 'Ocultar contraseña' })).toBeVisible();

  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL('/admin/dashboard');

  //LOGIN EXITOSO, AHORA CREAREMOS UNA SUCURSAL------------------------------------

  await page.getByRole('link', { name: 'Sucursales' }).click();
  await page.getByRole('button', { name: 'Nueva sucursal' }).click();
  await page.getByPlaceholder('Ej: Cine Plaza').fill('Sucursal Prueba');
  await page.getByPlaceholder('Ej: Av. Principal 123').fill('Calle Falsa 123');
  await page.getByPlaceholder('Ej: 0251 123 1243').fill('0251 556 2546');

  const bloqueApertura = page.locator('div.flex-col:has(label:text-is("Apertura"))');
  await bloqueApertura.getByRole('button', { name: 'Hora' }).click(); // Seleccionar Hora
  await page.locator('div:text-is("09")').click();
  await bloqueApertura.getByRole('button', { name: 'Min' }).click(); // Seleccionar Minuto
  await page.locator('div:text-is("30")').click();
  await bloqueApertura.getByRole('button', { name: 'AM' }).click(); //AM/PM
  await page.locator('div:text-is("AM")').click();

  const bloqueCierre = page.locator('div.flex-col:has(label:text-is("Cierre"))');
  await bloqueCierre.getByRole('button', { name: 'Hora' }).click(); // Seleccionar Hora
  await page.locator('div:text-is("10")').click();
  await bloqueCierre.getByRole('button', { name: 'Min' }).click(); // Seleccionar Minuto
  await page.locator('div:text-is("45")').click();
  await bloqueCierre.getByRole('button', { name: 'AM' }).click(); //AM/PM
  await page.locator('div:text-is("PM")').click();

  await page.getByRole('button', { name: 'Guardar' }).click();
});