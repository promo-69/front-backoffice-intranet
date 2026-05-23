# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cinemas.spec.js >> Crear sucursal - SUPERADMIN
- Location: tests\cinemas.spec.js:4:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "https://localhost:5174/admin/dashboard"
Received: "https://localhost:5174/login"
Timeout:  5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × unexpected value "https://localhost:5174/login"

```

```yaml
- img "Cineflix Logo"
- img "logotipo"
- heading "Gestion interna" [level=1]
- heading "Iniciar sesión" [level=2]
- textbox "Correo"
- textbox "Contraseña"
- button "Mostrar contraseña":
  - img
- button "Cancelar"
- button "Iniciar sesión"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | //LOGIN EXITOSO------------------------------------
  4  | test('Crear sucursal - SUPERADMIN', async ({ page }) => {
  5  |   await page.goto('/login');
  6  | 
  7  |   await page.getByPlaceholder('Correo').fill('admin@cineflix.com');
  8  |   await page.getByPlaceholder('Contraseña').fill('admin123456*');
  9  |   const botonOjo = page.getByRole('button', { name: 'Mostrar contraseña' });
  10 |   await expect(botonOjo).toBeVisible();
  11 |   await botonOjo.click();
  12 |   await expect(page.getByRole('button', { name: 'Ocultar contraseña' })).toBeVisible();
  13 | 
  14 |   await page.getByRole('button', { name: 'Iniciar sesión' }).click();
> 15 |   await expect(page).toHaveURL('/admin/dashboard');
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  16 | 
  17 | //CREACION DE UNA SUCURSAL-----------------------------------------------
  18 | 
  19 |   await page.getByRole('link', { name: 'Sucursales' }).click();
  20 |   await page.getByRole('button', { name: 'Nueva sucursal' }).click();
  21 |   await page.getByPlaceholder('Ej: Cine Plaza').fill('Sucursal Prueba 3');
  22 |   await page.getByPlaceholder('Ej: Av. Principal 123').fill('Calle Falsa 123');
  23 |   await page.getByLabel('Teléfono').fill('0251 556 2546');
  24 | 
  25 |   const bloqueApertura = page.locator('div.flex-col:has(label:text-is("Apertura"))');
  26 |   await bloqueApertura.getByRole('button', { name: 'Hora' }).click(); // Seleccionar Hora
  27 |   await page.locator('div:text-is("09")').click();
  28 |   await bloqueApertura.getByRole('button', { name: 'Min' }).click(); // Seleccionar Minuto
  29 |   await page.locator('div:text-is("30")').click();
  30 |   await bloqueApertura.getByRole('button', { name: 'AM' }).click(); //AM/PM
  31 |   await page.locator('div:text-is("AM")').click();
  32 | 
  33 |   const bloqueCierre = page.locator('div.flex-col:has(label:text-is("Cierre"))');
  34 |   await bloqueCierre.getByRole('button', { name: 'Hora' }).click(); // Seleccionar Hora
  35 |   await page.locator('div:text-is("10")').click();
  36 |   await bloqueCierre.getByRole('button', { name: 'Min' }).click(); // Seleccionar Minuto
  37 |   await page.locator('div:text-is("45")').click();
  38 | 
  39 |   await page.getByRole('button', { name: 'Registrar' }).click();
  40 | 
  41 |   //ELIMINACION DE UNA SUCURSAL-----------------------------------------------
  42 | /*
  43 |   await page.getByRole('link', { name: 'Sucursales' }).click();
  44 |   const sucursalAEliminar = 'Sucursal Prueba 3';
  45 |   const filaSucursal = page.locator('tr').filter({ hasText: sucursalAEliminar });
  46 |   await expect(filaSucursal).toBeVisible();
  47 |   const botonEliminar = filaSucursal.locator('button.text-red-500');
  48 |   await botonEliminar.click();
  49 |   const botonConfirmarBorrado = page.getByRole('button', { name: 'Confirmar' }); // o 'Sí, eliminar'
  50 |   await botonConfirmarBorrado.click();
  51 | */
  52 | 
  53 | });
```