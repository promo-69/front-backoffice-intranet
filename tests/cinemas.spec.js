import { test, expect } from '@playwright/test';

//LOGIN EXITOSO, AHORA CREAREMOS UNA SUCURSAL------------------------------------
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

//CREACION DE UNA SUCURSAL-----------------------------------------------

  await page.getByRole('link', { name: 'Sucursales' }).click();
  await page.getByRole('button', { name: 'Nueva sucursal' }).click();
  await page.getByPlaceholder('Ej: Cine Plaza').fill('Sucursal Prueba 3');
  await page.getByPlaceholder('Ej: Av. Principal 123').fill('Calle Falsa 123');
  await page.getByLabel('Teléfono').fill('0251 556 2546');

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

  await page.getByRole('button', { name: 'Registrar' }).click();

  //ELIMINACION DE UNA SUCURSAL-----------------------------------------------
/*
  await page.getByRole('link', { name: 'Sucursales' }).click();
  const sucursalAEliminar = 'Sucursal Prueba 3';
  const filaSucursal = page.locator('tr').filter({ hasText: sucursalAEliminar });
  await expect(filaSucursal).toBeVisible();
  const botonEliminar = filaSucursal.locator('button.text-red-500');
  await botonEliminar.click();
  const botonConfirmarBorrado = page.getByRole('button', { name: 'Confirmar' }); // o 'Sí, eliminar'
  await botonConfirmarBorrado.click();
*/

});