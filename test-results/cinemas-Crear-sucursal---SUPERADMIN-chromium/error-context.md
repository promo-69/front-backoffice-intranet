# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cinemas.spec.js >> Crear sucursal - SUPERADMIN
- Location: tests\cinemas.spec.js:4:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('tr').filter({ hasText: 'Sucursal Prueba 2' }).locator('button.text-red-500')
    - locator resolved to <button class="text-red-500 hover:scale-110 transition-transform">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 bg-black/40 backdrop-blur-sm"></div> from <div class="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 bg-black/40 backdrop-blur-sm"></div> from <div class="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    29 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="fixed inset-0 bg-black/40 backdrop-blur-sm"></div> from <div class="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - img "Cineflix Logo" [ref=e8]
      - paragraph [ref=e9]: Intranet Administrativa
    - generic [ref=e11]:
      - generic [ref=e12]: Menú Principal
      - list [ref=e14]:
        - listitem [ref=e15]:
          - link "Dashboard" [ref=e16] [cursor=pointer]:
            - /url: /admin/dashboard
            - img [ref=e17]
            - generic [ref=e22]: Dashboard
        - listitem [ref=e23]:
          - link "Sucursales" [ref=e24] [cursor=pointer]:
            - /url: /admin/sucursales
            - img [ref=e25]
            - generic [ref=e28]: Sucursales
        - listitem [ref=e29]:
          - link "Personal" [ref=e30] [cursor=pointer]:
            - /url: /admin/personal
            - img [ref=e31]
            - generic [ref=e36]: Personal
        - listitem [ref=e37]:
          - link "Cartelera" [ref=e38] [cursor=pointer]:
            - /url: /admin/exhibition
            - img [ref=e39]
            - generic [ref=e41]: Cartelera
        - listitem [ref=e42]:
          - link "Inventario" [ref=e43] [cursor=pointer]:
            - /url: /admin/inventario
            - img [ref=e44]
            - generic [ref=e48]: Inventario
        - listitem [ref=e49]:
          - link "Maestros" [ref=e50] [cursor=pointer]:
            - /url: /admin/catalogo
            - img [ref=e51]
            - generic [ref=e53]: Maestros
        - listitem [ref=e54]:
          - link "Reportes" [ref=e55] [cursor=pointer]:
            - /url: /admin/reports
            - img [ref=e56]
            - generic [ref=e58]: Reportes
        - listitem [ref=e59]:
          - link "Venta de Boletos" [ref=e60] [cursor=pointer]:
            - /url: /ticketOffice/sell
            - img [ref=e61]
            - generic [ref=e63]: Venta de Boletos
        - listitem [ref=e64]:
          - link "Caramelería" [ref=e65] [cursor=pointer]:
            - /url: /ticketOffice/candy
            - img [ref=e66]
            - generic [ref=e69]: Caramelería
    - list [ref=e71]:
      - listitem [ref=e72]:
        - link "Cerrar sesión" [ref=e73] [cursor=pointer]:
          - /url: /login
          - img [ref=e74]
          - generic [ref=e77]: Cerrar sesión
  - main [ref=e78]:
    - generic [ref=e80]:
      - button "Toggle Sidebar" [ref=e81] [cursor=pointer]:
        - img
        - generic [ref=e82]: Toggle Sidebar
      - generic [ref=e83]:
        - navigation "breadcrumb" [ref=e84]:
          - list [ref=e85]:
            - listitem [ref=e86]:
              - link "Intranet" [ref=e87] [cursor=pointer]:
                - /url: /admin/dashboard
            - listitem [ref=e88]:
              - img [ref=e89]
            - listitem [ref=e91]:
              - link "Gestión de Sucursales y Salas" [disabled] [ref=e92]
        - button "Operador Administrador" [ref=e94] [cursor=pointer]:
          - generic [ref=e95]:
            - paragraph [ref=e96]: Operador
            - paragraph [ref=e97]: Administrador
          - generic [ref=e98]:
            - img
    - main [ref=e99]:
      - generic [ref=e100]:
        - heading "Gestión de Sucursales y Salas" [level=1] [ref=e102]
        - generic [ref=e104]:
          - generic [ref=e105]:
            - generic [ref=e106]:
              - heading "Listado de Sucursales" [level=3] [ref=e107]
              - paragraph [ref=e108]: Administra las sucursales de Cineflix. Puedes agregar, editar o eliminar sedes según sea necesario.
            - generic [ref=e109]:
              - textbox "Buscar Sucursal..." [ref=e110]
              - button "NUEVA SUCURSAL" [ref=e111] [cursor=pointer]:
                - img [ref=e112]
                - text: NUEVA SUCURSAL
          - table [ref=e114]:
            - rowgroup [ref=e115]:
              - row "Nombre Dirección Teléfono Horario Acciones" [ref=e116]:
                - columnheader [ref=e117]
                - columnheader "Nombre" [ref=e118]
                - columnheader "Dirección" [ref=e119]
                - columnheader "Teléfono" [ref=e120]
                - columnheader "Horario" [ref=e121]
                - columnheader "Acciones" [ref=e122]
            - rowgroup [ref=e123]:
              - row "Cine Central Av. Principal 123, Centro +58 212-555-0101 10:00:00 - 23:30:00" [ref=e124] [cursor=pointer]:
                - cell [ref=e125]
                - cell "Cine Central" [ref=e127]
                - cell "Av. Principal 123, Centro" [ref=e128]
                - cell "+58 212-555-0101" [ref=e129]
                - cell "10:00:00 - 23:30:00" [ref=e130]:
                  - generic [ref=e131]:
                    - img [ref=e132]
                    - generic [ref=e135]: 10:00:00
                    - generic [ref=e136]: "-"
                    - generic [ref=e137]: 23:30:00
                - cell [ref=e138]:
                  - generic [ref=e139]:
                    - button [ref=e140]:
                      - img [ref=e141]
                    - button [ref=e144]:
                      - img [ref=e145]
              - row "Cine Plaza Calle Las Palmas 45, Urb. Las Américas +58 212-555-0202 11:00:00 - 22:30:00" [ref=e148] [cursor=pointer]:
                - cell [ref=e149]
                - cell "Cine Plaza" [ref=e151]
                - cell "Calle Las Palmas 45, Urb. Las Américas" [ref=e152]
                - cell "+58 212-555-0202" [ref=e153]
                - cell "11:00:00 - 22:30:00" [ref=e154]:
                  - generic [ref=e155]:
                    - img [ref=e156]
                    - generic [ref=e159]: 11:00:00
                    - generic [ref=e160]: "-"
                    - generic [ref=e161]: 22:30:00
                - cell [ref=e162]:
                  - generic [ref=e163]:
                    - button [ref=e164]:
                      - img [ref=e165]
                    - button [ref=e168]:
                      - img [ref=e169]
              - row "Sucursal Prueba 2 Calle Falsa 123 0251 556 2546 09:30:00 - 22:45:00" [ref=e172] [cursor=pointer]:
                - cell [ref=e173]
                - cell "Sucursal Prueba 2" [ref=e175]
                - cell "Calle Falsa 123" [ref=e176]
                - cell "0251 556 2546" [ref=e177]
                - cell "09:30:00 - 22:45:00" [ref=e178]:
                  - generic [ref=e179]:
                    - img [ref=e180]
                    - generic [ref=e183]: 09:30:00
                    - generic [ref=e184]: "-"
                    - generic [ref=e185]: 22:45:00
                - cell [ref=e186]:
                  - generic [ref=e187]:
                    - button [ref=e188]:
                      - img [ref=e189]
                    - button [ref=e192]:
                      - img [ref=e193]
              - row "Sucursal Prueba 3 Calle Falsa 123 0251 556 2546 09:30:00 - 22:45:00" [ref=e196] [cursor=pointer]:
                - cell [ref=e197]
                - cell "Sucursal Prueba 3" [ref=e199]
                - cell "Calle Falsa 123" [ref=e200]
                - cell "0251 556 2546" [ref=e201]
                - cell "09:30:00 - 22:45:00" [ref=e202]:
                  - generic [ref=e203]:
                    - img [ref=e204]
                    - generic [ref=e207]: 09:30:00
                    - generic [ref=e208]: "-"
                    - generic [ref=e209]: 22:45:00
                - cell [ref=e210]:
                  - generic [ref=e211]:
                    - button [ref=e212]:
                      - img [ref=e213]
                    - button [ref=e216]:
                      - img [ref=e217]
          - generic [ref=e221]:
            - paragraph [ref=e223]: Mostrando 1 a 4 de 4 resultados
            - navigation "Pagination" [ref=e225]:
              - button [disabled] [ref=e226]:
                - img [ref=e227]
              - generic [ref=e229]: Página 1 de 1
              - button [disabled] [ref=e230]:
                - img [ref=e231]
          - generic [ref=e236]:
            - img [ref=e240]
            - generic [ref=e242]:
              - heading "¡Registro Exitoso!" [level=2] [ref=e243]
              - paragraph [ref=e244]: La nueva sede ha sido incorporada al sistema.
            - button "Entendido" [ref=e245] [cursor=pointer]
          - generic [ref=e247]:
            - img [ref=e248]
            - paragraph [ref=e249]: Selecciona una sucursal de la lista para gestionar sus salas disponibles.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | //LOGIN EXITOSO, AHORA CREAREMOS UNA SUCURSAL------------------------------------
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
  15 |   await expect(page).toHaveURL('/admin/dashboard');
  16 | 
  17 | //CREACION DE UNA SUCURSAL-----------------------------------------------
  18 | 
  19 |   await page.getByRole('link', { name: 'Sucursales' }).click();
  20 |   await page.getByRole('button', { name: 'Nueva sucursal' }).click();
  21 |   await page.getByPlaceholder('Ej: Cine Plaza').fill('Sucursal Prueba 2');
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
  42 | 
  43 |   const sucursalAEliminar = 'Sucursal Prueba 2';
  44 |   const filaSucursal = page.locator('tr').filter({ hasText: sucursalAEliminar });
  45 |   await expect(filaSucursal).toBeVisible();
  46 |   const botonEliminar = filaSucursal.locator('button.text-red-500');
> 47 |   await botonEliminar.click();
     |                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
  48 |   const botonConfirmarBorrado = page.getByRole('button', { name: 'Confirmar' }); // o 'Sí, eliminar'
  49 |   await botonConfirmarBorrado.click();
  50 | 
  51 | 
  52 | });
```