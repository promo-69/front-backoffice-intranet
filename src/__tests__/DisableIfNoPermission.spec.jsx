import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuthContext } from '@/context/AuthContext';
import DisableIfNoPermission from '@/components/ui/DisableIfNoPermission';

function Wrapper({ providerValue, children }){
  return (
    <AuthContext.Provider value={providerValue}>
      {children}
    </AuthContext.Provider>
  );
}

describe('DisableIfNoPermission', () => {
  it('renders enabled child when permission present', () => {
    const providerValue = {
      user: { role: 'ADMIN', permissions: ['CRUD:DELETE:USERS'] },
      permissionsSet: new Set(['CRUD:DELETE:USERS']),
      hasPermission: (p) => new Set(['CRUD:DELETE:USERS']).has((p||'').toString().trim().toUpperCase()),
    };

    render(
      <Wrapper providerValue={providerValue}>
        <DisableIfNoPermission permission={"CRUD:DELETE:USERS"}>
          <button>Delete</button>
        </DisableIfNoPermission>
      </Wrapper>
    );

    const btn = screen.getByRole('button', { name: 'Delete' });
    expect(btn).toBeTruthy();
    expect(btn.disabled).toBe(false);
    expect(btn).not.toHaveAttribute('aria-disabled');
  });

  it('disables child and adds title when permission missing', () => {
    const providerValue = {
      user: { role: 'ADMIN', permissions: [] },
      permissionsSet: new Set([]),
      hasPermission: () => false,
    };

    render(
      <Wrapper providerValue={providerValue}>
        <DisableIfNoPermission permission={"CRUD:DELETE:USERS"} title="blocked">
          <button>Delete</button>
        </DisableIfNoPermission>
      </Wrapper>
    );

    const btn = screen.getByRole('button', { name: 'Delete' });
    expect(btn).toBeTruthy();
    // `DisableIfNoPermission` sets `aria-disabled` and `title`. It only sets
    // the `disabled` prop when the original element had a `disabled` prop.
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    expect(btn).toHaveAttribute('title', 'blocked');
  });

  it('allows all for SUPER_ADMIN', () => {
    const providerValue = {
      user: { role: 'SUPER_ADMIN', permissions: [] },
      permissionsSet: new Set([]),
      hasPermission: () => false,
    };

    render(
      <Wrapper providerValue={providerValue}>
        <DisableIfNoPermission permission={"CRUD:DELETE:USERS"}>
          <button>Delete</button>
        </DisableIfNoPermission>
      </Wrapper>
    );

    const btn = screen.getByRole('button', { name: 'Delete' });
    expect(btn.disabled).toBe(false);
    expect(btn).not.toHaveAttribute('aria-disabled');
  });
});
