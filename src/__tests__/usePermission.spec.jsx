import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuthContext } from '@/context/AuthContext';
import { usePermission } from '@/hooks/usePermission';

function TestComponent() {
  const { can, canAny, canAll, isSuperAdmin } = usePermission();
  return (
    <div>
      <div data-testid="can-read-products">{String(can('CRUD:READ:PRODUCTS'))}</div>
      <div data-testid="can-delete-products">{String(can('CRUD:DELETE:PRODUCTS'))}</div>
      <div data-testid="canAny">{String(canAny(['CRUD:DELETE:PRODUCTS','CRUD:READ:PRODUCTS']))}</div>
      <div data-testid="canAll">{String(canAll(['CRUD:READ:PRODUCTS']))}</div>
      <div data-testid="isSuper">{String(isSuperAdmin)}</div>
    </div>
  );
}

describe('usePermission hook', () => {
  it('evaluates permissions correctly for regular user', () => {
    const providerValue = {
      user: { role: 'ADMIN', permissions: ['CRUD:READ:PRODUCTS'] },
      permissionsSet: new Set(['CRUD:READ:PRODUCTS']),
      hasPermission: (p) => new Set(['CRUD:READ:PRODUCTS']).has((p||'').toString().trim().toUpperCase()),
    };

    render(
      <AuthContext.Provider value={providerValue}>
        <TestComponent />
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('can-read-products').textContent).toBe('true');
    expect(screen.getByTestId('can-delete-products').textContent).toBe('false');
    expect(screen.getByTestId('canAny').textContent).toBe('true');
    expect(screen.getByTestId('canAll').textContent).toBe('true');
    expect(screen.getByTestId('isSuper').textContent).toBe('false');
  });

  it('allows everything for SUPER_ADMIN', () => {
    const providerValue = {
      user: { role: 'SUPER_ADMIN', permissions: [] },
      permissionsSet: new Set(),
      hasPermission: () => false,
    };

    render(
      <AuthContext.Provider value={providerValue}>
        <TestComponent />
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('can-read-products').textContent).toBe('true');
    expect(screen.getByTestId('can-delete-products').textContent).toBe('true');
    expect(screen.getByTestId('canAny').textContent).toBe('true');
    expect(screen.getByTestId('canAll').textContent).toBe('true');
    expect(screen.getByTestId('isSuper').textContent).toBe('true');
  });
});
