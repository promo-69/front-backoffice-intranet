import { test, expect } from '@playwright/test';

//LOGIN EXITOSO, AHORA CREAREMOS UNA SUCURSAL------------------------------------
test('Crear sucursal - SUPERADMIN', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Correo').fill('admin@cineflix.com');
  await page.getByPlaceholder('Contraseña').fill('Admin123456*');
  const botonOjo = page.getByRole('button', { name: 'Mostrar contraseña' });
  await expect(botonOjo).toBeVisible();
  await botonOjo.click();
  await expect(page.getByRole('button', { name: 'Ocultar contraseña' })).toBeVisible();

  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL('/admin/dashboard');

//CREACION DE UNA SUCURSAL-----------------------------------------------

  await page.getByRole('link', { name: 'Sucursales' }).click();
  await page.getByRole('button', { name: 'Nueva sucursal' }).click();
  await page.getByPlaceholder('Ej: Cine Plaza').fill('Sucursal Prueba 02');
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

  const botonEntendido = page.getByRole('button', { name: 'Entendido' });
  await expect(botonEntendido).toBeVisible();
  await botonEntendido.click();

});

//ELIMINACION DE UNA SUCURSAL-----------------------------------------------
test('Eliminar sucursal - SUPERADMIN', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Correo').fill('admin@cineflix.com');
  await page.getByPlaceholder('Contraseña').fill('Admin123456*');
  const botonOjo = page.getByRole('button', { name: 'Mostrar contraseña' });
  await expect(botonOjo).toBeVisible();
  await botonOjo.click();
  await expect(page.getByRole('button', { name: 'Ocultar contraseña' })).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL('/admin/dashboard');

  await page.getByRole('link', { name: 'Sucursales' }).click();
  const sucursalAEliminar = 'Sucursal Prueba 01';
  const filaSucursal = page.locator('tr').filter({ hasText: sucursalAEliminar });
  await expect(filaSucursal).toBeVisible();
  const botonEliminar = filaSucursal.locator('button.text-red-500');
  await botonEliminar.click();
  const botonModalEliminar = page.getByRole('button', { name: 'Eliminar' });
  await expect(botonModalEliminar).toBeVisible();
  await botonModalEliminar.click();

});

//EDITAR DE UNA SUCURSAL-----------------------------------------------
test('Editar sucursal - SUPERADMIN', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Correo').fill('admin@cineflix.com');
  await page.getByPlaceholder('Contraseña').fill('Admin123456*');
  const botonOjo = page.getByRole('button', { name: 'Mostrar contraseña' });
  await expect(botonOjo).toBeVisible();
  await botonOjo.click();
  await expect(page.getByRole('button', { name: 'Ocultar contraseña' })).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL('/admin/dashboard');


  await page.getByRole('link', { name: 'Sucursales' }).click();
  const sucursalAEditar = 'Sucursal Prueba 1';
  const filaSucursal = page.locator('tr').filter({ hasText: sucursalAEditar });
  await expect(filaSucursal).toBeVisible();
  await filaSucursal.locator('button.text-brand-primary').click();
  
  await page.getByLabel('Nombre').fill('Prueba Edicion');
  await page.getByLabel('Dirección').fill('Calle Salsa 456');
  await page.getByLabel('Teléfono').fill('0251 000 2003');
  const bloqueEApertura = page.locator('div.flex-col:has(label:text-is("Apertura"))');
  await bloqueEApertura.getByRole('button').nth(0).click(); 
  await page.locator('div:text-is("05")').click();
  await bloqueEApertura.getByRole('button').nth(1).click();  
  await page.locator('div:text-is("45")').click();
  await bloqueEApertura.getByRole('button').nth(2).click(); //AM/PM
  await page.locator('div:text-is("AM")').click();
  const bloqueECierre = page.locator('div.flex-col:has(label:text-is("Cierre"))');
  await bloqueECierre.getByRole('button').nth(0).click(); // Seleccionar Hora
  await page.locator('div:text-is("11")').click();
  await bloqueECierre.getByRole('button').nth(1).click(); // Seleccionar Minuto
  await page.locator('div:text-is("00")').click();

  await page.getByRole('button', { name: 'Actualizar' }).click();
  const botonEEntendido = page.getByRole('button', { name: 'Entendido' });
  await expect(botonEEntendido).toBeVisible();
  await botonEEntendido.click();
});